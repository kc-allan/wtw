import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CEREMONIES, CreateStepKey, EventTypeKey, sortCeremonyKeys, typeAsksCreateStep } from '@wtw/shared';
import { Prisma } from '@prisma/client';
import { fromDbEventType, toDbCeremonyKey } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { ThemesService } from '../themes/themes.service';
import type { SetCeremoniesInput, UpdateCeremonyInput } from './ceremonies.schemas';

const ceremonySelect = {
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
  theme: { select: { key: true, name: true, group: true, palette: true, isPremium: true } },
} satisfies Prisma.CeremonySelect;

@Injectable()
export class CeremoniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly themes: ThemesService,
  ) {}

  /**
   * Only the types that ask for ceremonies on the way in can hold them, so a
   * birthday cannot quietly grow a dowry ceremony through the API.
   */
  assertTypeHasCeremonies(typeKey: EventTypeKey): void {
    if (!typeAsksCreateStep(typeKey, CreateStepKey.CEREMONIES)) {
      throw new BadRequestException(`Ceremonies are not available for ${typeKey} events`);
    }
  }


  async list(userId: string, eventId: string) {
    await this.events.assertCanManage(userId, eventId);
    return this.prisma.ceremony.findMany({
      where: { eventId },
      select: ceremonySelect,
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Reconciles the host's selection with what is stored. Ceremonies they keep
   * hold on to their date, venue and design; only the ones they clear are
   * removed, and with them the guest assignments that pointed at them.
   */
  async set(userId: string, eventId: string, input: SetCeremoniesInput) {
    const event = await this.events.assertCanManage(userId, eventId);
    this.assertTypeHasCeremonies(fromDbEventType(event.typeKey));

    const wanted = sortCeremonyKeys(input.keys);
    const existing = await this.prisma.ceremony.findMany({
      where: { eventId },
      select: { key: true },
    });
    const existingKeys = new Set(existing.map((row) => row.key));

    await this.prisma.$transaction([
      this.prisma.ceremony.deleteMany({
        where: { eventId, key: { notIn: wanted.map(toDbCeremonyKey) } },
      }),
      ...wanted
        .filter((key) => !existingKeys.has(toDbCeremonyKey(key)))
        .map((key) =>
          this.prisma.ceremony.create({
            data: {
              eventId,
              key: toDbCeremonyKey(key),
              name: CEREMONIES[key].name,
              position: CEREMONIES[key].position,
            },
          }),
        ),
    ]);

    return this.prisma.ceremony.findMany({
      where: { eventId },
      select: ceremonySelect,
      orderBy: { position: 'asc' },
    });
  }

  async update(userId: string, eventId: string, ceremonyId: string, input: UpdateCeremonyInput) {
    const event = await this.events.assertCanManage(userId, eventId);
    await this.assertBelongs(eventId, ceremonyId);

    // A ceremony picks from the same catalogue the wedding itself picks from.
    const themeId =
      input.themeKey === undefined
        ? undefined
        : input.themeKey === null
          ? null
          : ((await this.themes.resolveIdForEventType(
              input.themeKey,
              fromDbEventType(event.typeKey),
            )) ?? null);

    return this.prisma.ceremony.update({
      where: { id: ceremonyId },
      data: {
        ...(themeId !== undefined ? { themeId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
        ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
        ...(input.venueName !== undefined ? { venueName: input.venueName } : {}),
        ...(input.venueAddress !== undefined ? { venueAddress: input.venueAddress } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
        ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.dressCode !== undefined ? { dressCode: input.dressCode } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
      },
      select: ceremonySelect,
    });
  }

  private async assertBelongs(eventId: string, ceremonyId: string): Promise<void> {
    const found = await this.prisma.ceremony.findFirst({
      where: { id: ceremonyId, eventId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Ceremony not found');
    }
  }
}
