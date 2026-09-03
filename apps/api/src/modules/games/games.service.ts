import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  EventModuleKey,
  GAMES,
  GameKey,
  parseGameConfig,
  parseGameSubmission,
  publicGameConfig,
} from '@wtw/shared';
import { Prisma } from '@prisma/client';
import { toDbModuleKey } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type { AddGameInput, SubmitGameInput, UpdateGameInput } from './games.schemas';

/**
 * Games guests play from a baby shower page. Hosts choose which to run and
 * supply the questions for quiz games; guests submit once the event's access
 * rules have been checked. Scoring is deliberately absent — every game here
 * either has no right answer or is settled after the baby arrives.
 */
@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  catalogue() {
    return Object.values(GAMES);
  }

  /** What guests see: enabled games only, with quiz answer keys stripped. */
  async listForGuests(eventId: string) {
    await this.assertModuleEnabled(eventId);
    const instances = await this.prisma.gameInstance.findMany({
      where: { eventId, enabled: true },
      orderBy: { position: 'asc' },
    });

    return instances.flatMap((instance) => {
      const definition = GAMES[instance.gameKey as GameKey];
      if (!definition) {
        return [];
      }
      return [
        {
          ...definition,
          id: instance.id,
          position: instance.position,
          config: publicGameConfig(definition.key, instance.config),
        },
      ];
    });
  }

  /** Everything the host has set up, enabled or not, for the builder. */
  async listForHost(userId: string, eventId: string) {
    await this.events.assertCanManage(userId, eventId);
    const instances = await this.prisma.gameInstance.findMany({
      where: { eventId },
      orderBy: { position: 'asc' },
      include: { _count: { select: { submissions: true } } },
    });

    return instances.map((instance) => ({
      ...(GAMES[instance.gameKey as GameKey] ?? { key: instance.gameKey }),
      id: instance.id,
      enabled: instance.enabled,
      position: instance.position,
      config: instance.config,
      submissionCount: instance._count.submissions,
    }));
  }

  async add(userId: string, eventId: string, input: AddGameInput) {
    await this.events.assertCanManage(userId, eventId);
    await this.assertModuleEnabled(eventId);

    const definition = GAMES[input.gameKey];
    const config = this.parseConfig(definition.key, input.config);

    const existing = await this.prisma.gameInstance.findUnique({
      where: { eventId_gameKey: { eventId, gameKey: input.gameKey } },
    });
    if (existing) {
      throw new BadRequestException(`${definition.name} is already on this event`);
    }

    return this.prisma.gameInstance.create({
      data: {
        eventId,
        gameKey: input.gameKey,
        position: input.position,
        config,
      },
    });
  }

  async update(userId: string, eventId: string, gameInstanceId: string, input: UpdateGameInput) {
    await this.events.assertCanManage(userId, eventId);
    const instance = await this.assertInstanceBelongs(eventId, gameInstanceId);
    const definition = GAMES[instance.gameKey as GameKey];

    return this.prisma.gameInstance.update({
      where: { id: instance.id },
      data: {
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
        ...(input.config !== undefined
          ? { config: this.parseConfig(definition.key, input.config) }
          : {}),
      },
    });
  }

  async remove(userId: string, eventId: string, gameInstanceId: string): Promise<void> {
    await this.events.assertCanManage(userId, eventId);
    const instance = await this.assertInstanceBelongs(eventId, gameInstanceId);
    await this.prisma.gameInstance.delete({ where: { id: instance.id } });
  }

  async submit(
    eventId: string,
    gameInstanceId: string,
    guestId: string | null,
    input: SubmitGameInput,
  ) {
    await this.assertModuleEnabled(eventId);
    const instance = await this.prisma.gameInstance.findFirst({
      where: { id: gameInstanceId, eventId, enabled: true },
    });
    if (!instance) {
      throw new NotFoundException('Game not found on this event');
    }

    const definition = GAMES[instance.gameKey as GameKey];
    if (!definition) {
      throw new BadRequestException('This game is no longer supported');
    }

    const guest = guestId
      ? await this.prisma.guest.findFirst({ where: { id: guestId, eventId } })
      : null;

    const guestName = guest
      ? [guest.firstName, guest.lastName].filter(Boolean).join(' ')
      : input.guestName?.trim();

    if (!guestName) {
      throw new BadRequestException('Tell us who this is from');
    }

    return this.prisma.gameSubmission.create({
      data: {
        gameInstanceId: instance.id,
        guestId: guest?.id ?? null,
        guestName,
        // Validated against the schema for this game's response kind.
        payload: parseGameSubmission(definition.key, input.payload),
      },
    });
  }

  /** Host-side export of everything guests submitted. */
  async responses(userId: string, eventId: string) {
    await this.events.assertCanManage(userId, eventId);
    const instances = await this.prisma.gameInstance.findMany({
      where: { eventId },
      include: { submissions: { orderBy: { createdAt: 'asc' } } },
      orderBy: { position: 'asc' },
    });

    return instances.map((instance) => ({
      gameKey: instance.gameKey,
      name: GAMES[instance.gameKey as GameKey]?.name ?? instance.gameKey,
      submissions: instance.submissions.map((submission) => ({
        guestName: submission.guestName,
        payload: submission.payload,
        createdAt: submission.createdAt,
      })),
    }));
  }

  private parseConfig(key: GameKey, value: unknown): Prisma.InputJsonValue {
    try {
      return parseGameConfig(key, value);
    } catch {
      throw new BadRequestException(
        `${GAMES[key].name} needs its questions filling in before it can run`,
      );
    }
  }

  private async assertInstanceBelongs(eventId: string, gameInstanceId: string) {
    const instance = await this.prisma.gameInstance.findFirst({
      where: { id: gameInstanceId, eventId },
    });
    if (!instance) {
      throw new NotFoundException('Game not found on this event');
    }
    return instance;
  }

  private async assertModuleEnabled(eventId: string): Promise<void> {
    const row = await this.prisma.eventModule.findUnique({
      where: { eventId_key: { eventId, key: toDbModuleKey(EventModuleKey.GAMES) } },
      select: { enabled: true },
    });
    if (!row?.enabled) {
      throw new BadRequestException('This event does not have games');
    }
  }
}
