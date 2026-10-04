import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventStatus, EventVisibility, InvitationStatus } from '@wtw/shared';
import { hashToken } from '../../core/crypto/tokens';
import {
  toDbEventStatus,
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
    attendeeNames: string[];
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
  async previewForHost(eventId: string) {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      select: EVENT_VIEW_SELECT,
    });

    const modules = await this.modules.listEnabledPublic(eventId);
    const ceremonies = await this.ceremoniesFor(eventId, undefined);

    return { event, ceremonies, modules, guest: null };
  }

  /**
   * Adds someone to the guest list from the link a host shared. The event has
   * to be published and have the form switched on, and a name that is already
   * on the list is matched rather than duplicated, so a guest who submits
   * twice does not appear twice.
   */
  async addSelfToGuestList(
    slug: string,
    input: { firstName: string; lastName?: string; email?: string; phone?: string },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      select: { id: true, status: true, guestListFormEnabled: true },
    });

    if (!event || event.status !== 'published' || !event.guestListFormEnabled) {
      throw new NotFoundException('That list is not open');
    }

    const existing = await this.prisma.guest.findFirst({
      where: {
        eventId: event.id,
        firstName: { equals: input.firstName, mode: 'insensitive' },
        ...(input.lastName
          ? { lastName: { equals: input.lastName, mode: 'insensitive' } }
          : {}),
      },
      select: { id: true },
    });

    if (existing) {
      await this.prisma.guest.update({
        where: { id: existing.id },
        data: {
          ...(input.email ? { email: input.email } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
        },
      });
      return { added: false };
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

  /** The photos on a published event, for the gallery section. */
  async gallery(eventId: string) {
    return this.prisma.mediaAsset.findMany({
      where: { eventId, kind: 'image' },
      select: { id: true, url: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
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
