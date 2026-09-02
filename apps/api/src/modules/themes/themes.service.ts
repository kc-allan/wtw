import { Injectable, NotFoundException } from '@nestjs/common';
import { EventTypeKey, type ThemeSummary } from '@wtw/shared';
import { toDbEventType, fromDbEventType } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { ListThemesQuery } from './themes.schemas';

export interface ThemeGroupView {
  group: string;
  themes: ThemeSummary[];
}

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListThemesQuery): Promise<ThemeSummary[]> {
    const themes = await this.prisma.theme.findMany({
      where: {
        isActive: true,
        ...(query.eventType ? { eventTypeKey: toDbEventType(query.eventType) } : {}),
        ...(query.group ? { group: query.group } : {}),
        ...(query.includePremium ? {} : { isPremium: false }),
      },
      orderBy: [{ eventTypeKey: 'asc' }, { sortOrder: 'asc' }],
    });
    return themes.map((theme) => this.toSummary(theme));
  }

  /** Grouped the way the picker renders it, e.g. "Kenyan inspired". */
  async listGrouped(query: ListThemesQuery): Promise<ThemeGroupView[]> {
    const themes = await this.list(query);
    const groups = new Map<string, ThemeSummary[]>();
    for (const theme of themes) {
      const bucket = groups.get(theme.group);
      if (bucket) {
        bucket.push(theme);
      } else {
        groups.set(theme.group, [theme]);
      }
    }
    return [...groups.entries()].map(([group, entries]) => ({ group, themes: entries }));
  }

  async findByKey(key: string): Promise<ThemeSummary> {
    const theme = await this.prisma.theme.findUnique({ where: { key } });
    if (!theme || !theme.isActive) {
      throw new NotFoundException(`Unknown theme: ${key}`);
    }
    return this.toSummary(theme);
  }

  /** Resolves a theme key to its id, rejecting themes from another event type. */
  async resolveIdForEventType(
    key: string | undefined,
    eventType: EventTypeKey,
  ): Promise<string | undefined> {
    if (!key) {
      return undefined;
    }
    const theme = await this.prisma.theme.findUnique({ where: { key } });
    if (!theme || !theme.isActive) {
      throw new NotFoundException(`Unknown theme: ${key}`);
    }
    if (fromDbEventType(theme.eventTypeKey) !== eventType) {
      throw new NotFoundException(`Theme ${key} is not available for ${eventType} events`);
    }
    return theme.id;
  }

  private toSummary(theme: {
    key: string;
    name: string;
    group: string;
    eventTypeKey: Parameters<typeof fromDbEventType>[0];
    palette: unknown;
    previewImageUrl: string | null;
    isPremium: boolean;
  }): ThemeSummary {
    return {
      key: theme.key,
      name: theme.name,
      group: theme.group,
      eventTypeKey: fromDbEventType(theme.eventTypeKey),
      palette: theme.palette as ThemeSummary['palette'],
      previewImageUrl: theme.previewImageUrl,
      isPremium: theme.isPremium,
    };
  }
}
