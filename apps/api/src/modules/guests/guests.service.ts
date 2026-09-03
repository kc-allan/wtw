import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RsvpStatus } from '@wtw/shared';
import { toDbRsvpStatus } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { paginate, skipTake, type Paginated } from '../../common/pagination';
import { EventsService } from '../events/events.service';
import type {
  BulkGuestsInput,
  GuestInput,
  ListGuestsQuery,
  UpdateGuestInput,
} from './guests.schemas';

const guestSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  groupLabel: true,
  maxPartySize: true,
  notes: true,
  createdAt: true,
  rsvp: {
    select: {
      status: true,
      partySize: true,
      mealChoice: true,
      dietaryNotes: true,
      respondedAt: true,
    },
  },
  invitation: { select: { status: true, channel: true, sentAt: true, openedAt: true } },
} satisfies Prisma.GuestSelect;

@Injectable()
export class GuestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async list(
    userId: string,
    eventId: string,
    query: ListGuestsQuery,
  ): Promise<Paginated<unknown>> {
    await this.events.assertCanManage(userId, eventId);

    const where = this.buildWhere(eventId, query);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.guest.findMany({
        where,
        select: guestSelect,
        orderBy: [{ groupLabel: 'asc' }, { firstName: 'asc' }],
        ...skipTake(query),
      }),
      this.prisma.guest.count({ where }),
    ]);

    return paginate(rows, total, query);
  }


  /**
   * The filters the guest list offers. `pending` has to include guests with no
   * response row at all, which is why it is not a plain status equality.
   */
  private buildWhere(eventId: string, query: ListGuestsQuery): Prisma.GuestWhereInput {
    return {
      eventId,
      ...(query.groupLabel ? { groupLabel: query.groupLabel } : {}),
      ...(query.status
        ? query.status === RsvpStatus.PENDING
          ? { OR: [{ rsvp: { is: null } }, { rsvp: { status: 'pending' } }] }
          : { rsvp: { status: toDbRsvpStatus(query.status) } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    };
  }

  /** The group labels in use, for the filter pills above the table. */
  async groups(userId: string, eventId: string): Promise<string[]> {
    await this.events.assertCanManage(userId, eventId);
    const rows = await this.prisma.guest.findMany({
      where: { eventId, groupLabel: { not: null } },
      distinct: ['groupLabel'],
      select: { groupLabel: true },
      orderBy: { groupLabel: 'asc' },
    });
    return rows.flatMap((row) => (row.groupLabel ? [row.groupLabel] : []));
  }

  /** Every guest as spreadsheet rows, ignoring pagination. */
  async exportRows(userId: string, eventId: string, query: ListGuestsQuery) {
    await this.events.assertCanManage(userId, eventId);

    const guests = await this.prisma.guest.findMany({
      where: this.buildWhere(eventId, query),
      select: guestSelect,
      orderBy: [{ groupLabel: 'asc' }, { firstName: 'asc' }],
    });

    return guests.map((guest) => ({
      name: [guest.firstName, guest.lastName].filter(Boolean).join(' '),
      email: guest.email ?? '',
      phone: guest.phone ?? '',
      group: guest.groupLabel ?? '',
      rsvp: guest.rsvp?.status ?? 'pending',
      party: guest.rsvp?.partySize ?? '',
      meal: guest.rsvp?.mealChoice ?? '',
      dietaryNotes: guest.rsvp?.dietaryNotes ?? '',
      invitedVia: guest.invitation?.channel ?? '',
      invitationStatus: guest.invitation?.status ?? 'not sent',
    }));
  }

  async create(userId: string, eventId: string, input: GuestInput) {
    await this.events.assertCanManage(userId, eventId);
    return this.prisma.guest.create({
      data: { eventId, ...input },
      select: guestSelect,
    });
  }

  /** Bulk entry for hosts pasting a list rather than typing one at a time. */
  async createMany(userId: string, eventId: string, input: BulkGuestsInput) {
    await this.events.assertCanManage(userId, eventId);
    const result = await this.prisma.guest.createMany({
      data: input.guests.map((guest) => ({ eventId, ...guest })),
    });
    return { created: result.count };
  }

  async update(userId: string, eventId: string, guestId: string, input: UpdateGuestInput) {
    await this.events.assertCanManage(userId, eventId);
    await this.assertBelongs(eventId, guestId);
    return this.prisma.guest.update({
      where: { id: guestId },
      data: input,
      select: guestSelect,
    });
  }

  async remove(userId: string, eventId: string, guestId: string): Promise<void> {
    await this.events.assertCanManage(userId, eventId);
    await this.assertBelongs(eventId, guestId);
    await this.prisma.guest.delete({ where: { id: guestId } });
  }

  private async assertBelongs(eventId: string, guestId: string): Promise<void> {
    const guest = await this.prisma.guest.findFirst({
      where: { id: guestId, eventId },
      select: { id: true },
    });
    if (!guest) {
      throw new NotFoundException('Guest not found on this event');
    }
  }
}
