import { EventTypeKey, VendorCategoryKey } from '@wtw/shared';
import { z } from 'zod';

const csvEnum = <T extends string>(values: readonly T[]) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((raw) => (Array.isArray(raw) ? raw : raw.split(',')))
    .transform((entries) => entries.map((entry) => entry.trim()).filter(Boolean))
    .pipe(z.array(z.enum(values as unknown as [T, ...T[]])));

export const listVendorsSchema = z.object({
  /** Repeatable or comma separated, e.g. ?category=venues,beauty */
  category: csvEnum(Object.values(VendorCategoryKey)).optional(),
  eventType: csvEnum(Object.values(EventTypeKey)).optional(),
  county: z.string().max(80).optional(),
  q: z.string().max(120).optional(),
  featuredFirst: z.coerce.boolean().default(true),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(60).default(24),
});

export type ListVendorsQuery = z.infer<typeof listVendorsSchema>;
