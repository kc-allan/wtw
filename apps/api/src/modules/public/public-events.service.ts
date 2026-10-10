import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventStatus, EventVisibility, InvitationChannel, InvitationStatus } from '@wtw/shared';
import { generateRawToken, hashToken } from '../../core/crypto/tokens';
import {
  toDbEventStatus,
  toDbInvitationChannel,
  toDbInvitationStatus,
  toDbVisibility,
} from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventModulesService } from '../events/event-modules.service';

export interface ResolvedGuest {
  id: string;
  invitationId: string;
  firstName: string;
  lastName: string | null;
  maxPartySize: number;
  rsvp: {
    status: string;
    partySize: number;
    adults: number | null;
    children: number | null;
    attendeeNames: string[];
    mealChoice?: string | null;
    dietaryNotes?: string | null;
    message: string | null;
  } | null;
}

/** Everything a guest sees about the event itself. */
const EVENT_VIEW_SELECT = {
  id: true,
  slug: true,
  title: true,
  tagline: true,
  description: true,
  hostNames: true,
  typeKey: true,
  startsAt: true,
  endsAt: true,
  timezone: true,
  city: true,
  venueName: true,
  venueAddress: true,
  latitude: true,
  longitude: true,
  status: true,
  visibility: true,
  currency: true,
  theme: {
    select: { key: true, name: true, group: true, palette: true },
  },
} satisfies Prisma.EventSelect;

@Injectable()
export class PublicEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly modules: EventModulesService,
  ) {}

  /**
   * The access rules every guest route shares: the event must be published,
   * and a private one needs either a valid invitation token or the host's
   * access code. Returns the guest the token belongs to, when there is one.
   */
  async requireAccess(
    slug: string,
    rawToken?: string,
    accessCode?: string,
  ): Promise<{ eventId: string; guest: ResolvedGuest | null }> {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      select: { id: true, status: true, visibility: true, accessCode: true },
    });

    if (!event || event.status !== toDbEventStatus(EventStatus.PUBLISHED)) {
      throw new NotFoundException('Event not found');
    }

    const guest = rawToken ? await this.resolveGuest(event.id, rawToken) : null;

    if (
      event.visibility === toDbVisibility(EventVisibility.PRIVATE) &&
      !guest &&
      (!accessCode || accessCode !== event.accessCode)
    ) {
      throw new ForbiddenException('This event is private');
    }

    return { eventId: event.id, guest };
  }

  /**
   * The guest-facing view of an event: its enabled public modules plus, when a
   * valid invitation token is supplied, the guest that token belongs to.
   */
  async getBySlug(slug: string, rawToken?: string, accessCode?: string) {
    const { eventId, guest } = await this.requireAccess(slug, rawToken, accessCode);

    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      select: EVENT_VIEW_SELECT,
    });

    const modules = await this.modules.listEnabledPublic(eventId);
    const ceremonies = await this.ceremoniesFor(eventId, guest?.id);

    return { event, ceremonies, modules, guest };
  }

  /**
   * The same view, for the host, before anyone else can reach it. Publishing
   * is what opens an event to guests, so a draft has to be previewable some
   * other way or a host cannot see their own work until it is public.
   */
  async previewForHost(eventId: string, guestId?: string) {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      select: EVENT_VIEW_SELECT,
    });

    const guest = guestId ? await this.guestForHostPreview(eventId, guestId) : null;
    const modules = await this.modules.listEnabledPublic(eventId);
    const ceremonies = await this.ceremoniesFor(eventId, guest?.id);

    return { event, ceremonies, modules, guest };
  }

  /**
   * Adds someone to the guest list from the link a host shared. The event has
   * to be published, reachable by a general link and have the form switched on.
   * This never edits a matching name, because a name is not proof of identity.
   */
  async addSelfToGuestList(
    slug: string,
    input: { firstName: string; lastName?: string; email?: string; phone?: string },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      select: { id: true, status: true, visibility: true, guestListFormEnabled: true },
    });

    if (
      !event ||
      event.status !== 'published' ||
      event.visibility === 'private' ||
      !event.guestListFormEnabled
    ) {
      throw new NotFoundException('That list is not open');
    }

    await this.prisma.guest.create({
      data: {
        eventId: event.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        groupLabel: 'Added themselves',
      },
    });
    return { added: true };
  }

  async discardGeneralRespondent(eventId: string, guestId: string): Promise<void> {
    await this.prisma.guest.deleteMany({ where: { id: guestId, eventId, groupLabel: 'Shared link' } });
  }

  async createGeneralRespondent(
    slug: string,
    input: { firstName: string; lastName?: string; email?: string; phone?: string },
  ): Promise<{ eventId: string; guestId: string; invitationId: string; rawToken: string }> {
    const { eventId } = await this.requireAccess(slug);
    const rawToken = generateRawToken();
    const guest = await this.prisma.guest.create({
      data: {
        eventId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        groupLabel: 'Shared link',
        maxPartySize: 20,
        invitation: {
          create: {
            eventId,
            tokenHash: hashToken(rawToken),
            channel: toDbInvitationChannel(InvitationChannel.LINK),
            status: toDbInvitationStatus(InvitationStatus.OPENED),
            openedAt: new Date(),
          },
        },
      },
      select: { id: true, invitation: { select: { id: true } } },
    });

    if (!guest.invitation) {
      throw new NotFoundException('Invitation not created');
    }

    return {
      eventId,
      guestId: guest.id,
      invitationId: guest.invitation.id,
      rawToken,
    };
  }

  /** Guest context for host preview without opening or issuing an invitation. */
  private async guestForHostPreview(eventId: string, guestId: string): Promise<ResolvedGuest | null> {
    const guest = await this.prisma.guest.findFirst({
      where: { id: guestId, eventId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        maxPartySize: true,
        invitation: { select: { id: true } },
        rsvp: {
          select: {
            status: true,
            partySize: true,
            adults: true,
            children: true,
            attendeeNames: true,
            mealChoice: true,
            dietaryNotes: true,
            message: true,
          },
        },
      },
    });

    if (!guest) return null;

    return {
      id: guest.id,
      invitationId: guest.invitation?.id ?? 'preview',
      firstName: guest.firstName,
      lastName: guest.lastName,
      maxPartySize: guest.maxPartySize,
      rsvp: guest.rsvp,
    };
  }

  /** The photos on a published event, for the gallery section. */
  async gallery(eventId: string) {
    return this.prisma.mediaAsset.findMany({
      where: { eventId, kind: 'image', isHidden: false },
      select: { id: true, url: true, caption: true, altText: true, position: true, createdAt: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      take: 200,
    });
  }

  /**
   * The ceremonies this visitor is asked to. A guest we can identify sees only
   * theirs; anyone arriving without an invitation sees the whole programme,
   * since there is no one to narrow it down to.
   */
  private async ceremoniesFor(eventId: string, guestId: string | undefined) {
    const assigned =
      guestId === undefined
        ? []
        : await this.prisma.guestCeremony.findMany({
            where: { guestId },
            select: { ceremonyId: true },
          });

    return this.prisma.ceremony.findMany({
      where: {
        eventId,
        ...(assigned.length > 0 ? { id: { in: assigned.map((row) => row.ceremonyId) } } : {}),
      },
      select: {
        id: true,
        key: true,
        name: true,
        startsAt: true,
        endsAt: true,
        venueName: true,
        venueAddress: true,
        city: true,
        latitude: true,
        longitude: true,
        description: true,
        dressCode: true,
        position: true,
        theme: { select: { key: true, name: true, palette: true } },
      },
      orderBy: { position: 'asc' },
    });
  }

  /** Verifies an invitation token and marks the invitation opened. */
  async resolveGuest(eventId: string, rawToken: string): Promise<ResolvedGuest | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      select: {
        id: true,
        eventId: true,
        revokedAt: true,
        expiresAt: true,
        openedAt: true,
        status: true,
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            maxPartySize: true,
            rsvp: {
              select: {
                status: true,
                partySize: true,
                adults: true,
                children: true,
                attendeeNames: true,
                mealChoice: true,
                dietaryNotes: true,
                message: true,
              },
            },
          },
        },
      },
    });

    if (
      !invitation ||
      invitation.eventId !== eventId ||
      invitation.revokedAt !== null ||
      (invitation.expiresAt !== null && invitation.expiresAt.getTime() < Date.now())
    ) {
      return null;
    }

    if (!invitation.openedAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          openedAt: new Date(),
          status: toDbInvitationStatus(InvitationStatus.OPENED),
        },
      });
    }

    return {
      id: invitation.guest.id,
      invitationId: invitation.id,
      firstName: invitation.guest.firstName,
      lastName: invitation.guest.lastName,
      maxPartySize: invitation.guest.maxPartySize,
      rsvp: invitation.guest.rsvp,
    };
  }

  async requireGuest(slug: string, rawToken: string): Promise<{
    eventId: string;
    guest: ResolvedGuest;
  }> {
    const { eventId, guest } = await this.requireAccess(slug, rawToken);
    if (!guest) {
      throw new ForbiddenException('This invitation link is not valid');
    }

    return { eventId, guest };
  }
}
