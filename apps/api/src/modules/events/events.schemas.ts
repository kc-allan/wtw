import { EventModuleKey, EventStatus, EventTypeKey, EventVisibility } from '@wtw/shared';
import { z } from 'zod';

export const createEventSchema = z.object({
  typeKey: z.nativeEnum(EventTypeKey),
  title: z.string().min(1).max(200).trim(),
  tagline: z.string().max(300).trim().optional(),
  description: z.string().max(5000).optional(),
  hostNames: z.array(z.string().min(1).max(120)).max(10).default([]),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  timezone: z.string().min(1).max(60).default('Africa/Nairobi'),
  /** Rough headcount the host gives before there is a guest list. */
  expectedGuests: z.number().int().min(1).max(100_000).optional(),
  city: z.string().max(120).optional(),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  /** Optional preferred address; a unique one is derived from the title otherwise. */
  slug: z.string().min(3).max(60).regex(/^[a-z0-9-]+$/).optional(),
  themeKey: z.string().max(120).optional(),
  visibility: z.nativeEnum(EventVisibility).default(EventVisibility.UNLISTED),
  currency: z.string().length(3).default('KES'),
});

export const updateEventSchema = createEventSchema
  .omit({ typeKey: true })
  .partial()
  .extend({
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
