import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class PublicEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly modules: EventModulesService,
  ) {}

  /**
   * The guest-facing view of an event: its enabled public modules plus, when a
   * valid invitation token is supplied, the guest that token belongs to.
   */
  async getBySlug(slug: string, rawToken?: string, accessCode?: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      select: {
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
        accessCode: true,
        currency: true,
        theme: {
          select: { key: true, name: true, group: true, palette: true },
        },
      },
    });

    if (!event || event.status !== toDbEventStatus(EventStatus.PUBLISHED)) {
      throw new NotFoundException('Event not found');
    }

    const guest = rawToken ? await this.resolveGuest(event.id, rawToken) : null;

    if (event.visibility === toDbVisibility(EventVisibility.PRIVATE) && !guest) {
      // A private event needs either a guest token or the host's access code.
      if (!accessCode || accessCode !== event.accessCode) {
        throw new ForbiddenException('This event is private');
      }
    }

    const modules = await this.modules.listEnabledPublic(event.id);
    const { accessCode: _accessCode, ...publicEvent } = event;

    return { event: publicEvent, modules, guest };
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
    const event = await this.prisma.event.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!event || event.status !== toDbEventStatus(EventStatus.PUBLISHED)) {
      throw new NotFoundException('Event not found');
    }

    const guest = await this.resolveGuest(event.id, rawToken);
    if (!guest) {
      throw new ForbiddenException('This invitation link is not valid');
    }

    return { eventId: event.id, guest };
  }
}
