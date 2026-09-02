import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  EVENT_MODULES,
  EVENT_TYPES,
  EventModuleKey,
  EventTypeKey,
  formatZodIssues,
  isModuleAvailableForType,
  isModuleRequiredForType,
  isZodError,
  moduleConfigSchemas,
} from '@wtw/shared';
import { Prisma } from '@prisma/client';
import { toDbModuleKey, fromDbModuleKey } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { UpdateModuleInput } from './events.schemas';

export interface EventModuleView {
  key: EventModuleKey;
  name: string;
  description: string;
  tier: 'free' | 'premium';
  enabled: boolean;
  required: boolean;
  position: number;
  config: Record<string, unknown>;
}

/**
 * Owns the rule that an event may only run the modules its type declares.
 * Every path that turns a module on or edits its settings goes through here,
 * so adding an event type never means auditing controllers for special cases.
 */
@Injectable()
export class EventModulesService {
  constructor(private readonly prisma: PrismaService) {}

  /** The rows a newly created event starts with, straight from its type. */
  buildDefaultModules(typeKey: EventTypeKey): Prisma.EventModuleCreateWithoutEventInput[] {
    return EVENT_TYPES[typeKey].modules.map((slot, index) => ({
      key: toDbModuleKey(slot.key),
      enabled: slot.enabledByDefault,
      position: index,
      config: this.parseConfig(slot.key, {}),
    }));
  }

  async list(eventId: string, typeKey: EventTypeKey): Promise<EventModuleView[]> {
    const rows = await this.prisma.eventModule.findMany({
      where: { eventId },
      orderBy: { position: 'asc' },
    });

    return rows.map((row) => {
      const key = fromDbModuleKey(row.key);
      return {
        ...EVENT_MODULES[key],
        key,
        enabled: row.enabled,
        required: isModuleRequiredForType(typeKey, key),
        position: row.position,
        config: row.config as Record<string, unknown>,
      };
    });
  }

  async update(
    eventId: string,
    typeKey: EventTypeKey,
    moduleKey: EventModuleKey,
    input: UpdateModuleInput,
  ): Promise<EventModuleView> {
    if (!isModuleAvailableForType(typeKey, moduleKey)) {
      throw new BadRequestException(
        `${EVENT_MODULES[moduleKey].name} is not available for ${EVENT_TYPES[typeKey].name} events`,
      );
    }
    if (input.enabled === false && isModuleRequiredForType(typeKey, moduleKey)) {
      throw new BadRequestException(
        `${EVENT_MODULES[moduleKey].name} cannot be switched off for ${EVENT_TYPES[typeKey].name} events`,
      );
    }

    const existing = await this.prisma.eventModule.findUnique({
      where: { eventId_key: { eventId, key: toDbModuleKey(moduleKey) } },
    });
    if (!existing) {
      throw new NotFoundException('Module is not attached to this event');
    }

    const data: Prisma.EventModuleUpdateInput = {};
    if (input.enabled !== undefined) {
      data.enabled = input.enabled;
    }
    if (input.position !== undefined) {
      data.position = input.position;
    }
    if (input.config !== undefined) {
      // Merged onto what is stored so a partial edit does not drop settings.
      data.config = this.parseConfig(moduleKey, {
        ...(existing.config as Record<string, unknown>),
        ...input.config,
      });
    }

    const updated = await this.prisma.eventModule.update({
      where: { id: existing.id },
      data,
    });

    return {
      ...EVENT_MODULES[moduleKey],
      key: moduleKey,
      enabled: updated.enabled,
      required: isModuleRequiredForType(typeKey, moduleKey),
      position: updated.position,
      config: updated.config as Record<string, unknown>,
    };
  }

  /** The enabled, guest-facing modules in render order. */
  async listEnabledPublic(eventId: string): Promise<EventModuleView[]> {
    const rows = await this.prisma.eventModule.findMany({
      where: { eventId, enabled: true },
      orderBy: { position: 'asc' },
    });

    return rows
      .map((row) => {
        const key = fromDbModuleKey(row.key);
        return {
          ...EVENT_MODULES[key],
          key,
          enabled: row.enabled,
          required: false,
          position: row.position,
          config: row.config as Record<string, unknown>,
        };
      })
      .filter((module) => module.surface === 'public');
  }

  private parseConfig(key: EventModuleKey, value: unknown): Prisma.InputJsonValue {
    try {
      return moduleConfigSchemas[key].parse(value ?? {});
    } catch (error) {
      if (isZodError(error)) {
        throw new BadRequestException({
          message: `Invalid settings for the ${EVENT_MODULES[key].name} module`,
          errors: formatZodIssues(error),
        });
      }
      throw error;
    }
  }
}
