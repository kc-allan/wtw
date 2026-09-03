import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CEREMONIES, CeremonyKey, RsvpStatus } from '@wtw/shared';
import { fromDbCeremonyKey, toDbCeremonyKey, toDbRsvpStatus } from '../../core/prisma/enums';
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
  ceremonies: { select: { ceremony: { select: { key: true } } } },
} satisfies Prisma.GuestSelect;

/** The spreadsheet spells ceremonies out rather than exporting their keys. */
const CEREMONY_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(CEREMONIES).map((ceremony) => [ceremony.key, ceremony.name]),
);

type GuestRow = Prisma.GuestGetPayload<{ select: typeof guestSelect }>;

/** Flattens the join rows into the list of keys the clients work in. */
function withCeremonyKeys(guest: GuestRow) {
  const { ceremonies, ...rest } = guest;
  return {
    ...rest,
    ceremonyKeys: ceremonies.map((row) => fromDbCeremonyKey(row.ceremony.key)),
  };
}

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

    return paginate(rows.map(withCeremonyKeys), total, query);
  }


  /**
   * The filters the guest list offers. `pending` has to include guests with no
   * response row at all, which is why it is not a plain status equality.
   */
  private buildWhere(eventId: string, query: ListGuestsQuery): Prisma.GuestWhereInput {
    return {
      eventId,
      ...(query.groupLabel ? { groupLabel: query.groupLabel } : {}),
      ...(query.ceremonyKey
        ? { ceremonies: { some: { ceremony: { key: toDbCeremonyKey(query.ceremonyKey) } } } }
        : {}),
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
      invitedTo:
        guest.ceremonies.length === 0
          ? 'All ceremonies'
          : guest.ceremonies.map((row) => CEREMONY_LABELS[row.ceremony.key]).join(', '),
      invitedVia: guest.invitation?.channel ?? '',
      invitationStatus: guest.invitation?.status ?? 'not sent',
    }));
  }

  async create(userId: string, eventId: string, input: GuestInput) {
    await this.events.assertCanManage(userId, eventId);
    const { ceremonyKeys, ...guest } = input;
    const created = await this.prisma.guest.create({
      data: {
        eventId,
        ...guest,
        ceremonies: { create: await this.ceremonyLinks(eventId, ceremonyKeys) },
      },
      select: guestSelect,
    });
    return withCeremonyKeys(created);
  }

  /** Bulk entry for hosts pasting a list rather than typing one at a time. */
  async createMany(userId: string, eventId: string, input: BulkGuestsInput) {
    await this.events.assertCanManage(userId, eventId);
    const result = await this.prisma.guest.createMany({
      data: input.guests.map(({ ceremonyKeys: _ceremonies, ...guest }) => ({ eventId, ...guest })),
    });
    return { created: result.count };
  }

  async update(userId: string, eventId: string, guestId: string, input: UpdateGuestInput) {
    await this.events.assertCanManage(userId, eventId);
    await this.assertBelongs(eventId, guestId);
    const { ceremonyKeys, ...guest } = input;

    // Sending the list at all replaces it; omitting it leaves it untouched.
    const updated = await this.prisma.guest.update({
      where: { id: guestId },
      data: {
        ...guest,
        ...(ceremonyKeys === undefined
          ? {}
          : {
              ceremonies: {
                deleteMany: {},
                create: await this.ceremonyLinks(eventId, ceremonyKeys),
              },
            }),
      },
      select: guestSelect,
    });
    return withCeremonyKeys(updated);
  }

  /**
   * Turns the ceremony keys a host chose into join rows, dropping any that do
   * not belong to this event. An empty result means "asked to everything".
   */
  private async ceremonyLinks(eventId: string, keys: readonly CeremonyKey[] | undefined) {
    if (!keys || keys.length === 0) return [];
    const rows = await this.prisma.ceremony.findMany({
      where: { eventId, key: { in: keys.map(toDbCeremonyKey) } },
      select: { id: true },
    });
    return rows.map((row) => ({ ceremonyId: row.id }));
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
