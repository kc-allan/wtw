import { EventModuleKey } from './event-modules';

export enum EventTypeKey {
  WEDDING = 'wedding',
  BIRTHDAY = 'birthday',
  BABY_SHOWER = 'baby_shower',
  GRADUATION = 'graduation',
  ANNIVERSARY = 'anniversary',
  BRIDAL_SHOWER = 'bridal_shower',
  CORPORATE = 'corporate',
}

export interface EventTypeModuleSlot {
  key: EventModuleKey;
  /** Enabled when the event is created. */
  enabledByDefault: boolean;
  /** Cannot be switched off — the event makes no sense without it. */
  required?: boolean;
}

/**
 * The extra questions a type asks on the way in, beyond the name, date and
 * place every event needs. Each one is a screen in the create flow, so a type
 * gains a step by listing it here rather than by branching in the UI.
 */
export enum CreateStepKey {
  /** Where the host stands in relation to the day. */
  HOST_ROLE = 'host_role',
  /** Which gatherings the celebration is made up of. */
  CEREMONIES = 'ceremonies',
}

export interface EventTypeDefinition {
  key: EventTypeKey;
  name: string;
  plural: string;
  description: string;
  /** Weddings get the deepest feature set and lead the marketing site. */
  flagship?: boolean;
  /**
   * The only modules this type may enable, in the order they render on the
   * public page unless the website module overrides it.
   */
  modules: EventTypeModuleSlot[];
  /** Asked between choosing the type and picking a design. */
  createSteps: CreateStepKey[];
}

const required = (key: EventModuleKey): EventTypeModuleSlot => ({
  key,
  enabledByDefault: true,
  required: true,
});
const on = (key: EventModuleKey): EventTypeModuleSlot => ({ key, enabledByDefault: true });
const off = (key: EventModuleKey): EventTypeModuleSlot => ({ key, enabledByDefault: false });

/** Shared by graduations, anniversaries, bridal showers and corporate events. */
const simpleCelebrationModules: EventTypeModuleSlot[] = [
  required(EventModuleKey.INVITATION),
  required(EventModuleKey.EVENT_DETAILS),
  on(EventModuleKey.RSVP),
  on(EventModuleKey.VENUE_MAP),
  on(EventModuleKey.COUNTDOWN),
  on(EventModuleKey.SHARING),
];

export const EVENT_TYPES: Record<EventTypeKey, EventTypeDefinition> = {
  [EventTypeKey.WEDDING]: {
    key: EventTypeKey.WEDDING,
    name: 'Wedding',
    plural: 'Weddings',
    description: 'Choose a simple invitation or a wedding website with registry and guest management.',
    flagship: true,
    createSteps: [CreateStepKey.HOST_ROLE],
    modules: [
      required(EventModuleKey.INVITATION),
      required(EventModuleKey.EVENT_DETAILS),
      off(EventModuleKey.WEBSITE),
      on(EventModuleKey.RSVP),
      off(EventModuleKey.OUR_STORY),
      off(EventModuleKey.TIMELINE),
      on(EventModuleKey.VENUE_MAP),
      on(EventModuleKey.REGISTRY),
      off(EventModuleKey.FAQ),
      off(EventModuleKey.DRESS_CODE),
      // The spec marks accommodation optional, so hosts opt in.
      off(EventModuleKey.ACCOMMODATION),
      on(EventModuleKey.COUNTDOWN),
      on(EventModuleKey.SHARING),
      off(EventModuleKey.GALLERY),
    ],
  },

  [EventTypeKey.BIRTHDAY]: {
    key: EventTypeKey.BIRTHDAY,
    name: 'Birthday',
    plural: 'Birthdays',
    description: 'Lightweight by design — an invitation, the details and an RSVP.',
    // Deliberately no registry, gallery or website sections beyond the essentials.
    createSteps: [],
    modules: [
      required(EventModuleKey.INVITATION),
      required(EventModuleKey.EVENT_DETAILS),
      on(EventModuleKey.RSVP),
      on(EventModuleKey.VENUE_MAP),
      on(EventModuleKey.COUNTDOWN),
      on(EventModuleKey.SHARING),
    ],
  },

  [EventTypeKey.BABY_SHOWER]: {
    key: EventTypeKey.BABY_SHOWER,
    name: 'Baby shower',
    plural: 'Baby showers',
    description: 'Simple and elegant, with a wishlist and games guests play from the page.',
    createSteps: [],
    modules: [
      required(EventModuleKey.INVITATION),
      required(EventModuleKey.EVENT_DETAILS),
      on(EventModuleKey.RSVP),
      on(EventModuleKey.REGISTRY),
      on(EventModuleKey.GAMES),
      on(EventModuleKey.VENUE_MAP),
      on(EventModuleKey.COUNTDOWN),
      on(EventModuleKey.SHARING),
    ],
  },

  [EventTypeKey.GRADUATION]: {
    key: EventTypeKey.GRADUATION,
    name: 'Graduation',
    plural: 'Graduations',
    description: 'Mark the milestone and get everyone to the ceremony.',
    createSteps: [],
    modules: simpleCelebrationModules,
  },

  [EventTypeKey.ANNIVERSARY]: {
    key: EventTypeKey.ANNIVERSARY,
    name: 'Anniversary',
    plural: 'Anniversaries',
    description: 'Celebrate the years, from the first to the diamond.',
    createSteps: [],
    modules: simpleCelebrationModules,
  },

  [EventTypeKey.BRIDAL_SHOWER]: {
    key: EventTypeKey.BRIDAL_SHOWER,
    name: 'Bridal shower',
    plural: 'Bridal showers',
    description: 'Gather the bride’s people before the day.',
    createSteps: [],
    modules: simpleCelebrationModules,
  },

  [EventTypeKey.CORPORATE]: {
    key: EventTypeKey.CORPORATE,
    name: 'Corporate event',
    plural: 'Corporate events',
    description: 'Conferences, launches, galas and end-of-year parties.',
    createSteps: [],
    modules: simpleCelebrationModules,
  },
};

export const ALL_EVENT_TYPE_KEYS = Object.values(EventTypeKey);

export function getEventTypeDefinition(key: EventTypeKey): EventTypeDefinition {
  return EVENT_TYPES[key];
}

export function isModuleAvailableForType(
  typeKey: EventTypeKey,
  moduleKey: EventModuleKey,
): boolean {
  return EVENT_TYPES[typeKey].modules.some((slot) => slot.key === moduleKey);
}

export function isModuleRequiredForType(
  typeKey: EventTypeKey,
  moduleKey: EventModuleKey,
): boolean {
  return EVENT_TYPES[typeKey].modules.some(
    (slot) => slot.key === moduleKey && slot.required === true,
  );
}

export function createStepsForType(typeKey: EventTypeKey): CreateStepKey[] {
  return EVENT_TYPES[typeKey].createSteps;
}

export function typeAsksCreateStep(typeKey: EventTypeKey, step: CreateStepKey): boolean {
  return EVENT_TYPES[typeKey].createSteps.includes(step);
}

export function defaultModulesForType(typeKey: EventTypeKey): EventModuleKey[] {
  return EVENT_TYPES[typeKey].modules
    .filter((slot) => slot.enabledByDefault)
    .map((slot) => slot.key);
}
