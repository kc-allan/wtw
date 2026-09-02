import { EventTypeKey } from '@wtw/shared';
import { z } from 'zod';

export const listThemesSchema = z.object({
  eventType: z.nativeEnum(EventTypeKey).optional(),
  group: z.string().max(120).optional(),
  includePremium: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((value) => value === true || value === 'true')
    .default(true),
});

export type ListThemesQuery = z.infer<typeof listThemesSchema>;
