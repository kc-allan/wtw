import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ALL_EVENT_TYPE_KEYS,
  EVENT_MODULES,
  EVENT_TYPES,
  EventTypeKey,
  type EventModuleDefinition,
  type EventTypeDefinition,
} from '@wtw/shared';

export interface EventTypeModuleView extends EventModuleDefinition {
  enabledByDefault: boolean;
  required: boolean;
}

export interface EventTypeView {
  key: EventTypeKey;
  name: string;
  plural: string;
  description: string;
  flagship: boolean;
  modules: EventTypeModuleView[];
}

@Injectable()
export class EventTypesService {
  list(): EventTypeView[] {
    return ALL_EVENT_TYPE_KEYS.map((key) => this.toView(EVENT_TYPES[key]));
  }

  findOne(key: string): EventTypeView {
    const definition = EVENT_TYPES[key as EventTypeKey];
    if (!definition) {
      throw new NotFoundException(`Unknown event type: ${key}`);
    }
    return this.toView(definition);
  }

  private toView(definition: EventTypeDefinition): EventTypeView {
    return {
      key: definition.key,
      name: definition.name,
      plural: definition.plural,
      description: definition.description,
      flagship: definition.flagship ?? false,
      modules: definition.modules.map((slot) => ({
        ...EVENT_MODULES[slot.key],
        enabledByDefault: slot.enabledByDefault,
        required: slot.required ?? false,
      })),
    };
  }
}
