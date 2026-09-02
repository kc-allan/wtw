import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  EventModuleKey,
  GAMES,
  GameKey,
  parseGameSubmission,
} from '@wtw/shared';
import { toDbModuleKey } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventsService } from '../events/events.service';

/**
 * Scaffold. Game definitions, submission validation and host export work; the
 * scoring and winner logic for quiz games is still to come.
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

  async list(eventId: string) {
    await this.assertModuleEnabled(eventId);
    const instances = await this.prisma.gameInstance.findMany({
      where: { eventId, enabled: true },
      orderBy: { position: 'asc' },
    });

    return instances.map((instance) => ({
      id: instance.id,
      config: instance.config,
      position: instance.position,
      ...(GAMES[instance.gameKey as GameKey] ?? { key: instance.gameKey }),
    }));
  }

  async submit(eventId: string, gameInstanceId: string, guestId: string | null, payload: unknown) {
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

    return this.prisma.gameSubmission.create({
      data: {
        gameInstanceId: instance.id,
        guestId: guest?.id ?? null,
        guestName: guest ? [guest.firstName, guest.lastName].filter(Boolean).join(' ') : 'Guest',
        // Validated against the schema for this game's response kind.
        payload: parseGameSubmission(definition.key, payload),
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
