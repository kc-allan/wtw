import { z } from 'zod';

/**
 * Every capability an event page can expose. Event types are assembled from
 * these rather than each type carrying its own bespoke code, so a new type is
 * a data change and a new capability is one entry here plus its config schema.
 */
export enum EventModuleKey {
  INVITATION = 'invitation',
  EVENT_DETAILS = 'event_details',
  RSVP = 'rsvp',
  WEBSITE = 'website',
  OUR_STORY = 'our_story',
  TIMELINE = 'timeline',
  VENUE_MAP = 'venue_map',
  REGISTRY = 'registry',
  FAQ = 'faq',
  DRESS_CODE = 'dress_code',
  ACCOMMODATION = 'accommodation',
  COUNTDOWN = 'countdown',
  SHARING = 'sharing',
  GAMES = 'games',
  GALLERY = 'gallery',
}

/** Determines whether the module needs a paid plan to switch on. */
export type ModuleTier = 'free' | 'premium';

const link = z.object({ label: z.string().min(1), url: z.string().url() });

const money = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3).default('KES'),
});

export const moduleConfigSchemas = {
  [EventModuleKey.INVITATION]: z.object({
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    headline: z.string().max(120).optional(),
    message: z.string().max(2000).optional(),
    /** Shown on the invite card, e.g. "Kindly respond by 14 June". */
    rsvpByLabel: z.string().max(80).optional(),
    envelopeAnimation: z.boolean().default(true),
  }),

  [EventModuleKey.EVENT_DETAILS]: z.object({
    description: z.string().max(4000).optional(),
    hostedByLabel: z.string().max(160).optional(),
    showAddToCalendar: z.boolean().default(true),
  }),

  [EventModuleKey.RSVP]: z.object({
    deadline: z.coerce.date().optional(),
    allowPlusOnes: z.boolean().default(false),
    maxPartySize: z.number().int().min(1).max(20).default(1),
    allowMaybe: z.boolean().default(true),
    collectDietary: z.boolean().default(false),
    collectMessage: z.boolean().default(true),
    /** Asks how much of the party are adults and how many are children. */
    collectHeadcountBreakdown: z.boolean().default(false),
    /**
     * Meal options guests pick from. The host owns the wording, so the guest
     * list can total them without the platform prescribing a fixed menu.
     */
    mealOptions: z.array(z.string().min(1).max(60)).max(10).default([]),
    /** Extra host-defined questions appended to the response form. */
    customQuestions: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1).max(200),
          type: z.enum(['text', 'select', 'boolean']),
          required: z.boolean().default(false),
          options: z.array(z.string()).default([]),
        }),
      )
      .default([]),
  }),

  [EventModuleKey.WEBSITE]: z.object({
    /** Public page section order; unknown keys are ignored at render time. */
    sectionOrder: z.array(z.nativeEnum(EventModuleKey)).default([]),
    coverStyle: z.enum(['full-bleed', 'framed', 'split']).default('full-bleed'),
    showCoupleNames: z.boolean().default(true),
  }),

  [EventModuleKey.OUR_STORY]: z.object({
    sections: z
      .array(
        z.object({
          title: z.string().max(160),
          body: z.string().max(4000),
          date: z.coerce.date().optional(),
          imageId: z.string().optional(),
        }),
      )
      .default([]),
  }),

  [EventModuleKey.TIMELINE]: z.object({
    entries: z
      .array(
        z.object({
          startsAt: z.coerce.date(),
          endsAt: z.coerce.date().optional(),
          title: z.string().min(1).max(160),
          description: z.string().max(1000).optional(),
          location: z.string().max(240).optional(),
        }),
      )
      .default([]),
  }),

  [EventModuleKey.VENUE_MAP]: z.object({
    venues: z
      .array(
        z.object({
          label: z.string().min(1).max(160),
          address: z.string().max(500),
          latitude: z.number().min(-90).max(90).optional(),
          longitude: z.number().min(-180).max(180).optional(),
          directionsNote: z.string().max(1000).optional(),
          parkingNote: z.string().max(1000).optional(),
        }),
      )
      .default([]),
  }),

  [EventModuleKey.REGISTRY]: z.object({
    currency: z.string().length(3).default('KES'),
    allowCashGifts: z.boolean().default(true),
    cashGiftNote: z.string().max(1000).optional(),
    /**
     * Where a guest sends money, in the host's own words — a paybill, a bank
     * account, a code for anyone sending from abroad. Nothing is processed
     * here; the details are shown and the guest pays their own way.
     */
    cashGiftMethods: z
      .array(
        z.object({
          kind: z.enum(['mobile_money', 'bank', 'international']).default('bank'),
          label: z.string().min(1).max(80),
          detail: z.string().max(120).optional(),
        }),
      )
      .max(6)
      .default([]),
    /** Registries hosted elsewhere that guests should still see. */
    externalRegistries: z.array(link).default([]),
    hideClaimedItems: z.boolean().default(false),
  }),

  [EventModuleKey.FAQ]: z.object({
    items: z
      .array(
        z.object({
          question: z.string().min(1).max(300),
          answer: z.string().min(1).max(2000),
        }),
      )
      .default([]),
  }),

  [EventModuleKey.DRESS_CODE]: z.object({
    title: z.string().max(120).optional(),
    description: z.string().max(2000).optional(),
    /** Hex swatches rendered as the palette guests should dress to. */
    palette: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).default([]),
  }),

  [EventModuleKey.ACCOMMODATION]: z.object({
    options: z
      .array(
        z.object({
          name: z.string().min(1).max(200),
          address: z.string().max(500).optional(),
          bookingUrl: z.string().url().optional(),
          phone: z.string().max(40).optional(),
          nightlyRate: money.optional(),
          note: z.string().max(1000).optional(),
        }),
      )
      .default([]),
  }),

  [EventModuleKey.COUNTDOWN]: z.object({
    /** Defaults to the event start when omitted. */
    targetAt: z.coerce.date().optional(),
    style: z.enum(['digits', 'words', 'minimal']).default('digits'),
    hideWhenPassed: z.boolean().default(true),
  }),

  [EventModuleKey.SHARING]: z.object({
    channels: z
      .array(z.enum(['whatsapp', 'sms', 'email', 'copy_link']))
      .default(['whatsapp', 'sms', 'email', 'copy_link']),
    /** `{{guestName}}` and `{{eventUrl}}` are substituted before sending. */
    messageTemplate: z.string().max(1000).optional(),
  }),

  [EventModuleKey.GAMES]: z.object({
    enabledGames: z.array(z.string()).default([]),
    requireGuestName: z.boolean().default(true),
    closeAt: z.coerce.date().optional(),
  }),

  [EventModuleKey.GALLERY]: z.object({
    maxPhotos: z.number().int().min(1).max(500).default(50),
    allowGuestUploads: z.boolean().default(false),
    /** Stands in for the photos until there are any, e.g. when to come back. */
    pendingNote: z.string().max(300).optional(),
  }),
} as const satisfies Record<EventModuleKey, z.ZodTypeAny>;

export type ModuleConfigSchemas = typeof moduleConfigSchemas;
export type ModuleConfig<K extends EventModuleKey> = z.infer<ModuleConfigSchemas[K]>;

export interface EventModuleDefinition {
  key: EventModuleKey;
  name: string;
  description: string;
  tier: ModuleTier;
  /** Public modules render a section on the guest-facing page. */
  surface: 'public' | 'host';
}

export const EVENT_MODULES: Record<EventModuleKey, EventModuleDefinition> = {
  [EventModuleKey.INVITATION]: {
    key: EventModuleKey.INVITATION,
    name: 'Digital invitation',
    description: 'The shareable invite card guests receive.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.EVENT_DETAILS]: {
    key: EventModuleKey.EVENT_DETAILS,
    name: 'Event details',
    description: 'Date, time, hosts and the description guests read first.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.RSVP]: {
    key: EventModuleKey.RSVP,
    name: 'RSVP',
    description: 'Collect responses, party sizes and guest questions.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.WEBSITE]: {
    key: EventModuleKey.WEBSITE,
    name: 'Event website',
    description: 'A multi-section site at its own address rather than a single card.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.OUR_STORY]: {
    key: EventModuleKey.OUR_STORY,
    name: 'Our story',
    description: 'A dated narrative of how the couple got here.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.TIMELINE]: {
    key: EventModuleKey.TIMELINE,
    name: 'Timeline',
    description: 'The order of the day, from arrival to send-off.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.VENUE_MAP]: {
    key: EventModuleKey.VENUE_MAP,
    name: 'Venue and maps',
    description: 'Locations with directions and parking notes.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.REGISTRY]: {
    key: EventModuleKey.REGISTRY,
    name: 'Gift registry',
    description: 'A wishlist guests can claim from, with optional cash gifts.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.FAQ]: {
    key: EventModuleKey.FAQ,
    name: 'FAQ',
    description: 'Answers to what guests keep asking.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.DRESS_CODE]: {
    key: EventModuleKey.DRESS_CODE,
    name: 'Dress code',
    description: 'What to wear, with a colour palette.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.ACCOMMODATION]: {
    key: EventModuleKey.ACCOMMODATION,
    name: 'Accommodation',
    description: 'Where guests travelling in can stay.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.COUNTDOWN]: {
    key: EventModuleKey.COUNTDOWN,
    name: 'Countdown',
    description: 'Time remaining until the celebration.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.SHARING]: {
    key: EventModuleKey.SHARING,
    name: 'Sharing',
    description: 'Send the event over WhatsApp, SMS or email.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.GAMES]: {
    key: EventModuleKey.GAMES,
    name: 'Games',
    description: 'Guest games played from the event page, exportable afterwards.',
    tier: 'free',
    surface: 'public',
  },
  [EventModuleKey.GALLERY]: {
    key: EventModuleKey.GALLERY,
    name: 'Gallery',
    description: 'Photos from the day, optionally contributed by guests.',
    tier: 'premium',
    surface: 'public',
  },
};

export const ALL_MODULE_KEYS = Object.values(EventModuleKey);

export function getModuleDefinition(key: EventModuleKey): EventModuleDefinition {
  return EVENT_MODULES[key];
}

/** Validates and fills defaults for one module's config blob. */
export function parseModuleConfig<K extends EventModuleKey>(
  key: K,
  value: unknown,
): ModuleConfig<K> {
  return moduleConfigSchemas[key].parse(value ?? {}) as ModuleConfig<K>;
}
