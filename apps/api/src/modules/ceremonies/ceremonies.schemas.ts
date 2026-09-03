import { CeremonyKey } from '@wtw/shared';
import { z } from 'zod';

/** The whole set a host keeps, sent at once so removals are unambiguous. */
export const setCeremoniesSchema = z.object({
  keys: z.array(z.nativeEnum(CeremonyKey)).max(20),
});

export const updateCeremonySchema = z.object({
  name: z.string().min(1).max(120).trim().optional(),
  themeKey: z.string().max(120).nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  venueName: z.string().max(200).nullable().optional(),
  venueAddress: z.string().max(500).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  dressCode: z.string().max(200).nullable().optional(),
  position: z.number().int().min(0).max(100).optional(),
});

export type SetCeremoniesInput = z.infer<typeof setCeremoniesSchema>;
export type UpdateCeremonyInput = z.infer<typeof updateCeremonySchema>;
