import {
  CeremonyKey,
  EventModuleKey,
  EventStatus,
  EventTypeKey,
  EventVisibility,
  HostRole,
} from '@wtw/shared';
import { z } from 'zod';

export const createEventSchema = z.object({
  typeKey: z.nativeEnum(EventTypeKey),
  title: z.string().min(1).max(200).trim(),
  tagline: z.string().max(300).trim().optional(),
  description: z.string().max(5000).optional(),
  hostNames: z.array(z.string().min(1).max(120)).max(10).default([]),
  /** Left out while the host is still deciding when. */
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  timezone: z.string().min(1).max(60).default('Africa/Nairobi'),
  /** Rough headcount the host gives before there is a guest list. */
  expectedGuests: z.number().int().min(1).max(100_000).optional(),
  /** How the person setting the event up relates to it. */
  hostRole: z.nativeEnum(HostRole).optional(),
  /** Only meaningful for types whose create flow asks for them. */
  ceremonies: z.array(z.nativeEnum(CeremonyKey)).max(20).default([]),
  city: z.string().max(120).optional(),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  /** Optional preferred address; a unique one is derived from the title otherwise. */
  slug: z.string().min(3).max(60).regex(/^[a-z0-9-]+$/).optional(),
  themeKey: z.string().max(120).optional(),
  visibility: z.nativeEnum(EventVisibility).default(EventVisibility.UNLISTED),
  /** Lets people add themselves to the guest list from a shared link. */
  guestListFormEnabled: z.boolean().optional(),
  currency: z.string().length(3).default('KES'),
});

export const updateEventSchema = createEventSchema
  // Ceremonies are reconciled through their own endpoint, not folded in here.
  .omit({ typeKey: true, ceremonies: true })
  .partial()
  .extend({
    tagline: z.string().max(300).trim().nullable().optional(),
    description: z.string().max(5000).nullable().optional(),
    startsAt: z.coerce.date().nullable().optional(),
    endsAt: z.coerce.date().nullable().optional(),
    city: z.string().max(120).nullable().optional(),
    venueName: z.string().max(200).nullable().optional(),
    venueAddress: z.string().max(500).nullable().optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    accessCode: z.string().min(4).max(40).nullable().optional(),
    /** A MediaAsset on this event; null clears the cover. */
    coverImageId: z.string().min(1).max(60).nullable().optional(),
  });

export const listEventsSchema = z.object({
  status: z.nativeEnum(EventStatus).optional(),
  typeKey: z.nativeEnum(EventTypeKey).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateModuleSchema = z.object({
  enabled: z.boolean().optional(),
  position: z.number().int().min(0).max(100).optional(),
  /** Validated against the module's own schema in @wtw/shared. */
  config: z.record(z.string(), z.unknown()).optional(),
});

export const moduleKeyParamSchema = z.nativeEnum(EventModuleKey);

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
