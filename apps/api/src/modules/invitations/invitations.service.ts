import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvitationChannel, InvitationStatus } from '@wtw/shared';
import type { Env } from '../../core/config/env';
import { generateRawToken, hashToken } from '../../core/crypto/tokens';
import {
  toDbInvitationChannel,
  toDbInvitationStatus,
} from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { InvitationSender } from './invitation-sender';
import type { IssueInvitationInput, SendInvitationInput } from './invitations.schemas';

export interface IssuedInvitation {
  guestId: string;
  guestName: string;
  /** Present only in the response that mints it; only its hash is stored. */
  link: string | null;
  status: InvitationStatus;
}

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly config: ConfigService<Env, true>,
    private readonly sender: InvitationSender,
  ) {}

  async issue(
    userId: string,
    eventId: string,
    input: IssueInvitationInput,
  ): Promise<IssuedInvitation[]> {
    const event = await this.loadManageableEvent(userId, eventId);
    const guests = await this.loadGuests(eventId, input.guestIds);

    const issued: IssuedInvitation[] = [];
    for (const guest of guests) {
      const existing = await this.prisma.invitation.findUnique({
        where: { guestId: guest.id },
      });

      if (existing && !input.regenerate) {
        issued.push({
          guestId: guest.id,
          guestName: guest.firstName,
          link: null,
          status: existing.status as unknown as InvitationStatus,
        });
        continue;
      }

      const rawToken = generateRawToken();
      const data = {
        eventId,
        guestId: guest.id,
        tokenHash: hashToken(rawToken),
        channel: toDbInvitationChannel(input.channel),
        status: toDbInvitationStatus(InvitationStatus.DRAFT),
        sentAt: null,
        openedAt: null,
        respondedAt: null,
        revokedAt: null,
        expiresAt: null,
      };

      if (existing) {
        await this.prisma.invitation.update({ where: { id: existing.id }, data });
      } else {
        await this.prisma.invitation.create({ data });
      }

      issued.push({
        guestId: guest.id,
        guestName: guest.firstName,
        link: this.buildLink(event.slug, rawToken),
        status: InvitationStatus.DRAFT,
      });
    }

    return issued;
  }

  async send(userId: string, eventId: string, input: SendInvitationInput) {
    const event = await this.loadManageableEvent(userId, eventId);
    const guests = await this.loadGuests(eventId, input.guestIds);

    let sent = 0;
    const skipped: string[] = [];

    for (const guest of guests) {
      const invitation = await this.prisma.invitation.findUnique({
        where: { guestId: guest.id },
      });
      if (!invitation) {
        // A token has to exist before there is anything to share.
        skipped.push(guest.id);
        continue;
      }

      const destination =
        input.channel === InvitationChannel.EMAIL ? (guest.email ?? '') : (guest.phone ?? '');

      await this.sender.send({
        channel: input.channel,
        to: destination,
        guestName: [guest.firstName, guest.lastName].filter(Boolean).join(' '),
        eventTitle: event.title,
        // The raw token is not recoverable, so sending shares the event address
        // and the delivery integration attaches the guest's link.
        link: this.buildLink(event.slug),
      });

      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          channel: toDbInvitationChannel(input.channel),
          status: toDbInvitationStatus(InvitationStatus.SENT),
          sentAt: new Date(),
          sentCount: { increment: 1 },
        },
      });
      sent += 1;
    }

    return { sent, skipped };
  }

  async revoke(userId: string, eventId: string, guestId: string): Promise<void> {
    await this.events.assertCanManage(userId, eventId);
    await this.prisma.invitation.updateMany({
      where: { eventId, guestId, revokedAt: null },
      data: {
        revokedAt: new Date(),
        status: toDbInvitationStatus(InvitationStatus.REVOKED),
      },
    });
  }

  async list(userId: string, eventId: string) {
    await this.events.assertCanManage(userId, eventId);
    return this.prisma.invitation.findMany({
      where: { eventId },
      select: {
        id: true,
        status: true,
        channel: true,
        sentCount: true,
        sentAt: true,
        openedAt: true,
        respondedAt: true,
        guest: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  buildLink(slug: string, rawToken?: string): string {
    const base = this.config.get('WEB_APP_URL', { infer: true }).replace(/\/+$/, '');
    return rawToken ? `${base}/e/${slug}?t=${rawToken}` : `${base}/e/${slug}`;
  }

  private async loadManageableEvent(userId: string, eventId: string) {
    await this.events.assertCanManage(userId, eventId);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true, title: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  private async loadGuests(eventId: string, guestIds: string[]) {
    return this.prisma.guest.findMany({
      where: { eventId, id: { in: guestIds } },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    });
  }
}
