import { BadRequestException, Injectable } from '@nestjs/common';
import {
  EventModuleKey,
  RsvpStatus,
  moduleConfigSchemas,
  type ModuleConfig,
} from '@wtw/shared';
import { Prisma } from '@prisma/client';
import { toDbModuleKey, toDbRsvpStatus } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { paginate, skipTake, type Paginated } from '../../common/pagination';
import { EventsService } from '../events/events.service';
import type { ListRsvpsQuery, SubmitRsvpInput } from './rsvp.schemas';

export interface RsvpSummary {
  attending: number;
  notAttending: number;
  maybe: number;
  pending: number;
  totalGuests: number;
  totalAttendees: number;
}

@Injectable()
export class RsvpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  /**
   * Records a guest's response. Called from the public route once the guest's
   * invitation token has been verified.
   */
  async submit(
    eventId: string,
    guestId: string,
    invitationId: string | null,
    input: SubmitRsvpInput,
  ) {
    const config = await this.rsvpConfig(eventId);

    if (config.deadline && config.deadline.getTime() < Date.now()) {
      throw new BadRequestException('The RSVP deadline has passed');
    }
    if (input.status === RsvpStatus.MAYBE && !config.allowMaybe) {
      throw new BadRequestException('This event asks for a yes or no');
    }

    const guest = await this.prisma.guest.findFirstOrThrow({
      where: { id: guestId, eventId },
      select: { maxPartySize: true },
    });

    const ceiling = config.allowPlusOnes
      ? Math.min(guest.maxPartySize, config.maxPartySize)
      : 1;
    if (input.status === RsvpStatus.ATTENDING && input.partySize > ceiling) {
      throw new BadRequestException(
        ceiling === 1
          ? 'This invitation admits one guest'
          : `This invitation admits up to ${ceiling} guests`,
      );
    }

    const partySize = input.status === RsvpStatus.ATTENDING ? input.partySize : 0;
    const data = {
      status: toDbRsvpStatus(input.status),
      partySize,
      attendeeNames: input.attendeeNames,
      dietaryNotes: config.collectDietary ? input.dietaryNotes : undefined,
      message: config.collectMessage ? input.message : undefined,
      answers: input.answers as Prisma.InputJsonValue,
      respondedAt: new Date(),
    };

    const response = await this.prisma.rsvpResponse.upsert({
      where: { guestId },
      create: { eventId, guestId, invitationId, ...data },
      update: data,
    });

    if (invitationId) {
      await this.prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'responded', respondedAt: new Date() },
      });
    }

    return response;
  }

  async list(userId: string, eventId: string, query: ListRsvpsQuery): Promise<Paginated<unknown>> {
    await this.events.assertCanManage(userId, eventId);

    const where: Prisma.RsvpResponseWhereInput = {
      eventId,
      ...(query.status ? { status: toDbRsvpStatus(query.status) } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.rsvpResponse.findMany({
        where,
        select: {
          id: true,
          status: true,
          partySize: true,
          attendeeNames: true,
          dietaryNotes: true,
          message: true,
          answers: true,
          respondedAt: true,
          guest: {
            select: { id: true, firstName: true, lastName: true, email: true, groupLabel: true },
          },
        },
        orderBy: { respondedAt: 'desc' },
        ...skipTake(query),
      }),
      this.prisma.rsvpResponse.count({ where }),
    ]);

    return paginate(rows, total, query);
  }

  async summary(userId: string, eventId: string): Promise<RsvpSummary> {
    await this.events.assertCanManage(userId, eventId);

    // Read-only, so these run concurrently rather than in a transaction —
    // which also keeps Prisma's groupBy count typed as a plain number.
    const [grouped, totalGuests, attendingAggregate] = await Promise.all([
      this.prisma.rsvpResponse.groupBy({
        by: ['status'],
        where: { eventId },
        orderBy: { status: 'asc' },
        _count: true,
      }),
      this.prisma.guest.count({ where: { eventId } }),
      this.prisma.rsvpResponse.aggregate({
        where: { eventId, status: 'attending' },
        _sum: { partySize: true },
      }),
    ]);

    const counts = new Map(grouped.map((row) => [row.status, row._count]));
    const responded = [...counts.values()].reduce((total, count) => total + count, 0);

    return {
      attending: counts.get('attending') ?? 0,
      notAttending: counts.get('not_attending') ?? 0,
      maybe: counts.get('maybe') ?? 0,
      // Everyone invited who has not answered yet.
      pending: Math.max(0, totalGuests - responded),
      totalGuests,
      totalAttendees: attendingAggregate._sum.partySize ?? 0,
    };
  }

  /** The event's RSVP settings, with the module's schema defaults applied. */
  private async rsvpConfig(eventId: string): Promise<ModuleConfig<EventModuleKey.RSVP>> {
    const row = await this.prisma.eventModule.findUnique({
      where: { eventId_key: { eventId, key: toDbModuleKey(EventModuleKey.RSVP) } },
      select: { enabled: true, config: true },
    });

    if (!row || !row.enabled) {
      throw new BadRequestException('This event is not collecting RSVPs');
    }

    return moduleConfigSchemas[EventModuleKey.RSVP].parse(row.config ?? {});
  }
}
