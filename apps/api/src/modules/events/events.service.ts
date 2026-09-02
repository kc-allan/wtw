import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus, EventTypeKey } from '@wtw/shared';
import { Prisma } from '@prisma/client';
import {
  fromDbEventType,
  toDbEventStatus,
  toDbEventType,
  toDbVisibility,
} from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { paginate, skipTake, type Paginated } from '../../common/pagination';
import { slugify, uniqueSlug } from '../../common/slug';
import { ThemesService } from '../themes/themes.service';
import { EventModulesService } from './event-modules.service';
import type { CreateEventInput, ListEventsQuery, UpdateEventInput } from './events.schemas';

const eventSelect = {
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
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  theme: { select: { key: true, name: true, group: true, palette: true, isPremium: true } },
} satisfies Prisma.EventSelect;

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly modules: EventModulesService,
    private readonly themes: ThemesService,
  ) {}

  async create(userId: string, input: CreateEventInput) {
    const accountId = await this.primaryAccountId(userId);
    const themeId = await this.themes.resolveIdForEventType(input.themeKey, input.typeKey);

    const slug = await uniqueSlug(input.slug ?? slugify(input.title), (candidate) =>
      this.prisma.event.findUnique({ where: { slug: candidate } }).then(Boolean),
    );

    return this.prisma.event.create({
      data: {
        accountId,
        createdById: userId,
        typeKey: toDbEventType(input.typeKey),
        themeId,
        slug,
        title: input.title,
        tagline: input.tagline,
        description: input.description,
        hostNames: input.hostNames,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        timezone: input.timezone,
        venueName: input.venueName,
        venueAddress: input.venueAddress,
        latitude: input.latitude,
        longitude: input.longitude,
        visibility: toDbVisibility(input.visibility),
        currency: input.currency,
        // The type definition decides which modules the event starts with.
        modules: { create: this.modules.buildDefaultModules(input.typeKey) },
      },
      select: eventSelect,
    });
  }

  async list(userId: string, query: ListEventsQuery): Promise<Paginated<unknown>> {
    const accountIds = await this.accountIds(userId);
    const where: Prisma.EventWhereInput = {
      accountId: { in: accountIds },
      ...(query.status ? { status: toDbEventStatus(query.status) } : {}),
      ...(query.typeKey ? { typeKey: toDbEventType(query.typeKey) } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        select: eventSelect,
        orderBy: { startsAt: 'asc' },
        ...skipTake(query),
      }),
      this.prisma.event.count({ where }),
    ]);

    return paginate(rows, total, query);
  }

  async findOne(userId: string, eventId: string) {
    const event = await this.assertCanManage(userId, eventId);
    const modules = await this.modules.list(event.id, fromDbEventType(event.typeKey));
    const detail = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      select: eventSelect,
    });
    return { ...detail, modules };
  }

  async update(userId: string, eventId: string, input: UpdateEventInput) {
    const event = await this.assertCanManage(userId, eventId);
    const typeKey = fromDbEventType(event.typeKey);

    const themeId =
      input.themeKey === undefined
        ? undefined
        : await this.themes.resolveIdForEventType(input.themeKey, typeKey);

    const slug =
      input.slug === undefined
        ? undefined
        : await uniqueSlug(input.slug, async (candidate) => {
            if (candidate === event.slug) {
              return false;
            }
            return this.prisma.event.findUnique({ where: { slug: candidate } }).then(Boolean);
          });

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...(slug !== undefined ? { slug } : {}),
        ...(themeId !== undefined ? { themeId } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.tagline !== undefined ? { tagline: input.tagline } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.hostNames !== undefined ? { hostNames: input.hostNames } : {}),
        ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
        ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.venueName !== undefined ? { venueName: input.venueName } : {}),
        ...(input.venueAddress !== undefined ? { venueAddress: input.venueAddress } : {}),
        ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
        ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.accessCode !== undefined ? { accessCode: input.accessCode } : {}),
        ...(input.visibility !== undefined
          ? { visibility: toDbVisibility(input.visibility) }
          : {}),
      },
      select: eventSelect,
    });
  }

  async publish(userId: string, eventId: string) {
    await this.assertCanManage(userId, eventId);
    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: toDbEventStatus(EventStatus.PUBLISHED),
        publishedAt: new Date(),
      },
      select: eventSelect,
    });
  }

  async unpublish(userId: string, eventId: string) {
    await this.assertCanManage(userId, eventId);
    return this.prisma.event.update({
      where: { id: eventId },
      data: { status: toDbEventStatus(EventStatus.DRAFT) },
      select: eventSelect,
    });
  }

  async remove(userId: string, eventId: string): Promise<void> {
    await this.assertCanManage(userId, eventId);
    await this.prisma.event.delete({ where: { id: eventId } });
  }

  async listModules(userId: string, eventId: string) {
    const event = await this.assertCanManage(userId, eventId);
    return this.modules.list(event.id, fromDbEventType(event.typeKey));
  }

  async updateModule(
    userId: string,
    eventId: string,
    moduleKey: Parameters<EventModulesService['update']>[2],
    input: Parameters<EventModulesService['update']>[3],
  ) {
    const event = await this.assertCanManage(userId, eventId);
    return this.modules.update(event.id, fromDbEventType(event.typeKey), moduleKey, input);
  }

  /** Throws unless the user is a member of the account that owns the event. */
  async assertCanManage(
    userId: string,
    eventId: string,
  ): Promise<{ id: string; slug: string; typeKey: Prisma.EventGetPayload<object>['typeKey'] }> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true, typeKey: true, accountId: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const membership = await this.prisma.accountMember.findUnique({
      where: { accountId_userId: { accountId: event.accountId, userId } },
      select: { id: true },
    });
    if (!membership) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return { id: event.id, slug: event.slug, typeKey: event.typeKey };
  }

  private async accountIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.accountMember.findMany({
      where: { userId },
      select: { accountId: true },
    });
    return memberships.map((membership) => membership.accountId);
  }

  private async primaryAccountId(userId: string): Promise<string> {
    const membership = await this.prisma.accountMember.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { accountId: true },
    });
    if (!membership) {
      throw new NotFoundException('No workspace found for this account');
    }
    return membership.accountId;
  }

  /** Exposed for modules that need the event's type without re-querying. */
  typeKeyOf(event: { typeKey: Prisma.EventGetPayload<object>['typeKey'] }): EventTypeKey {
    return fromDbEventType(event.typeKey);
  }
}
