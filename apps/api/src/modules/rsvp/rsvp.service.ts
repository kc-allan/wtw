import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EventModuleKey,
  RsvpStatus,
  moduleConfigSchemas,
  type ModuleConfig,
} from '@wtw/shared';
import { Prisma } from '@prisma/client';
import { createHmac } from 'node:crypto';
import type { Env } from '../../core/config/env';
import { hashToken } from '../../core/crypto/tokens';
import {
  toDbInvitationChannel,
  toDbInvitationStatus,
  toDbModuleKey,
  toDbRsvpStatus,
} from '../../core/prisma/enums';
import { InvitationChannel, InvitationStatus } from '@wtw/shared';
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
  /** Plus-ones brought by attending guests, over and above the invitees. */
  plusOnes: number;
  /** How many chose each meal option, for the catering headcount. */
  meals: { choice: string; count: number }[];
}

@Injectable()
export class RsvpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly config: ConfigService<Env, true>,
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
    return this.prisma.$transaction((tx) =>
      this.submitInTransaction(tx, eventId, guestId, invitationId, input),
    );
  }

  async submitPublicLink(
    eventId: string,
    input: SubmitRsvpInput & { firstName: string; lastName?: string; email?: string; phone?: string },
    idempotencyKey: string,
  ) {
    const secret = this.config.get('RSVP_IDEMPOTENCY_SECRET', { infer: true });
    const keyHash = createHmac('sha256', secret).update(`key:${idempotencyKey}`).digest('hex');
    const returnToken = createHmac('sha256', secret)
      .update(`return:${idempotencyKey}`)
      .digest('base64url');

    const existing = () => this.prisma.publicRsvpSubmission.findUnique({
      where: { eventId_keyHash: { eventId, keyHash } },
      include: { guest: { include: { rsvp: true } } },
    });

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const prior = await tx.publicRsvpSubmission.findUnique({
          where: { eventId_keyHash: { eventId, keyHash } },
          include: { guest: { include: { rsvp: true } } },
        });
        if (prior) return { response: prior.guest.rsvp, returnToken };

        const guest = await tx.guest.create({
          data: {
            eventId,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            groupLabel: 'Shared link',
            maxPartySize: 20,
          },
          select: { id: true },
        });
        const invitation = await tx.invitation.create({
          data: {
            eventId,
            guestId: guest.id,
            tokenHash: hashToken(returnToken),
            channel: toDbInvitationChannel(InvitationChannel.LINK),
            status: toDbInvitationStatus(InvitationStatus.OPENED),
            openedAt: new Date(),
          },
          select: { id: true },
        });
        const response = await this.submitInTransaction(
          tx,
          eventId,
          guest.id,
          invitation.id,
          input,
        );
        await tx.publicRsvpSubmission.create({
          data: { eventId, guestId: guest.id, keyHash },
        });
        return { response, returnToken };
      });
      return result;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const prior = await existing();
        if (prior) return { response: prior.guest.rsvp, returnToken };
      }
      throw error;
    }
  }

  private async submitInTransaction(
    tx: Prisma.TransactionClient,
    eventId: string,
    guestId: string,
    invitationId: string | null,
    input: SubmitRsvpInput,
  ) {
    const config = await this.rsvpConfig(tx, eventId);

    if (config.deadline && config.deadline.getTime() < Date.now()) {
      throw new BadRequestException('The RSVP deadline has passed');
    }
    if (input.status === RsvpStatus.MAYBE && !config.allowMaybe) {
      throw new BadRequestException('This event asks for a yes or no');
    }

    const guest = await tx.guest.findFirstOrThrow({
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

    if (
      input.mealChoice !== undefined &&
      !config.mealOptions.includes(input.mealChoice)
    ) {
      throw new BadRequestException('Choose one of the meal options offered');
    }

    const breakdown =
      config.collectHeadcountBreakdown &&
      input.adults !== undefined &&
      input.children !== undefined
        ? { adults: input.adults, children: input.children }
        : null;

    // A split that does not add up would make the totals on the guest list lie.
    if (breakdown && breakdown.adults + breakdown.children !== input.partySize) {
      throw new BadRequestException(
        'The number of adults and children should add up to the size of your party',
      );
    }

    const attending = input.status === RsvpStatus.ATTENDING;
    const partySize = attending ? input.partySize : 0;
    const data = {
      status: toDbRsvpStatus(input.status),
      partySize,
      adults: breakdown && attending ? breakdown.adults : null,
      children: breakdown && attending ? breakdown.children : null,
      attendeeNames: input.attendeeNames,
      mealChoice: config.mealOptions.length > 0 ? input.mealChoice : undefined,
      dietaryNotes: config.collectDietary ? input.dietaryNotes : undefined,
      message: config.collectMessage ? input.message : undefined,
      answers: input.answers as Prisma.InputJsonValue,
      respondedAt: new Date(),
    };

    const response = await tx.rsvpResponse.upsert({
      where: { guestId },
      create: { eventId, guestId, invitationId, ...data },
      update: data,
    });

    if (invitationId) {
      await tx.invitation.update({
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
          mealChoice: true,
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
    const [grouped, totalGuests, attendingAggregate, mealGroups] = await Promise.all([
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
      this.prisma.rsvpResponse.groupBy({
        by: ['mealChoice'],
        where: { eventId, status: 'attending', mealChoice: { not: null } },
        orderBy: { mealChoice: 'asc' },
        _count: true,
      }),
    ]);

    const counts = new Map(grouped.map((row) => [row.status, row._count]));
    const responded = [...counts.values()].reduce((total, count) => total + count, 0);

    const attending = counts.get('attending') ?? 0;
    const totalAttendees = attendingAggregate._sum.partySize ?? 0;

    return {
      attending,
      notAttending: counts.get('not_attending') ?? 0,
      maybe: counts.get('maybe') ?? 0,
      // Everyone invited who has not answered yet.
      pending: Math.max(0, totalGuests - responded),
      totalGuests,
      totalAttendees,
      plusOnes: Math.max(0, totalAttendees - attending),
      meals: mealGroups.map((row) => ({
        choice: row.mealChoice as string,
        count: row._count,
      })),
    };
  }

  /** The event's RSVP settings, with the module's schema defaults applied. */
  private async rsvpConfig(
    tx: Prisma.TransactionClient,
    eventId: string,
  ): Promise<ModuleConfig<EventModuleKey.RSVP>> {
    const row = await tx.eventModule.findUnique({
      where: { eventId_key: { eventId, key: toDbModuleKey(EventModuleKey.RSVP) } },
      select: { enabled: true, config: true },
    });

    if (!row || !row.enabled) {
      throw new BadRequestException('This event is not collecting RSVPs');
    }

    return moduleConfigSchemas[EventModuleKey.RSVP].parse(row.config ?? {});
  }
}
