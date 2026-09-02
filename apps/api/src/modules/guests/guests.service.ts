import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
  rsvp: { select: { status: true, partySize: true, respondedAt: true } },
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

    const where: Prisma.GuestWhereInput = {
      eventId,
      ...(query.groupLabel ? { groupLabel: query.groupLabel } : {}),
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
