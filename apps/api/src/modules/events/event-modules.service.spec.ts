import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import {
  ALL_EVENT_TYPE_KEYS,
  EVENT_TYPES,
  EventModuleKey,
  EventTypeKey,
  defaultModulesForType,
  isModuleAvailableForType,
} from '@wtw/shared';
import { fromDbModuleKey } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventModulesService } from './event-modules.service';

describe('EventModulesService', () => {
  const eventModule = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  };
  const prisma = { eventModule } as unknown as PrismaService;
  const service = new EventModulesService(prisma);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('buildDefaultModules', () => {
    it('starts a wedding with the modules its type enables by default', () => {
      const rows = service.buildDefaultModules(EventTypeKey.WEDDING);
      const enabled = rows.filter((row) => row.enabled).map((row) => fromDbModuleKey(row.key));

      expect(enabled).toEqual(defaultModulesForType(EventTypeKey.WEDDING));
      expect(enabled).toContain(EventModuleKey.REGISTRY);
      // The spec marks accommodation optional, so it is present but off.
      expect(
        rows.find((row) => fromDbModuleKey(row.key) === EventModuleKey.ACCOMMODATION)?.enabled,
      ).toBe(false);
    });

    it('keeps birthdays lightweight', () => {
      const rows = service.buildDefaultModules(EventTypeKey.BIRTHDAY);
      const keys = rows.map((row) => fromDbModuleKey(row.key));

      expect(keys).not.toContain(EventModuleKey.REGISTRY);
      expect(keys).not.toContain(EventModuleKey.GALLERY);
      expect(keys).not.toContain(EventModuleKey.WEBSITE);
    });

    it('fills each module config with its schema defaults', () => {
      const rows = service.buildDefaultModules(EventTypeKey.BABY_SHOWER);
      const rsvp = rows.find((row) => fromDbModuleKey(row.key) === EventModuleKey.RSVP);

      expect(rsvp?.config).toMatchObject({
        allowPlusOnes: false,
        allowMaybe: true,
        customQuestions: [],
      });
    });
  });

  describe('update', () => {
    it('refuses a module the event type does not offer', async () => {
      await expect(
        service.update('event-1', EventTypeKey.BIRTHDAY, EventModuleKey.REGISTRY, {
          enabled: true,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(eventModule.findUnique).not.toHaveBeenCalled();
    });

    it('refuses to switch off a required module', async () => {
      await expect(
        service.update('event-1', EventTypeKey.WEDDING, EventModuleKey.INVITATION, {
          enabled: false,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects config that fails the module schema', async () => {
      eventModule.findUnique.mockResolvedValue({ id: 'm1', config: {} });

      await expect(
        service.update('event-1', EventTypeKey.WEDDING, EventModuleKey.RSVP, {
          config: { maxPartySize: 999 },
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('merges a partial config onto what is stored', async () => {
      eventModule.findUnique.mockResolvedValue({
        id: 'm1',
        config: { allowPlusOnes: true, maxPartySize: 4, collectDietary: true },
      });
      eventModule.update.mockImplementation(({ data }: { data: { config: unknown } }) =>
        Promise.resolve({ enabled: true, position: 0, config: data.config }),
      );

      const result = await service.update(
        'event-1',
        EventTypeKey.WEDDING,
        EventModuleKey.RSVP,
        { config: { collectDietary: false } },
      );

      // The untouched keys survive the edit.
      expect(result.config).toMatchObject({
        allowPlusOnes: true,
        maxPartySize: 4,
        collectDietary: false,
      });
    });
  });
});

describe('event type definitions', () => {
  it.each(ALL_EVENT_TYPE_KEYS)('%s declares a coherent module set', (typeKey) => {
    const definition = EVENT_TYPES[typeKey];
    const keys = definition.modules.map((slot) => slot.key);

    expect(new Set(keys).size).toBe(keys.length);
    // A required module that defaults to off could never be satisfied.
    for (const slot of definition.modules) {
      if (slot.required) {
        expect(slot.enabledByDefault).toBe(true);
      }
      expect(isModuleAvailableForType(typeKey, slot.key)).toBe(true);
    }
    // Every event has something to send and something to read.
    expect(keys).toContain(EventModuleKey.INVITATION);
    expect(keys).toContain(EventModuleKey.EVENT_DETAILS);
  });
});
