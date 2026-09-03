import { CeremonyKey, RsvpStatus } from '@wtw/shared';
import { z } from 'zod';

export const guestSchema = z.object({
  firstName: z.string().min(1).max(80).trim(),
  lastName: z.string().max(80).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().min(7).max(20).trim().optional(),
  groupLabel: z.string().max(120).trim().optional(),
  maxPartySize: z.number().int().min(1).max(20).default(1),
  notes: z.string().max(2000).optional(),
  /**
   * Which ceremonies this guest is asked to. Omitted or empty means all of
   * them, so a couple who invites everyone to everything fills in nothing.
   */
  ceremonyKeys: z.array(z.nativeEnum(CeremonyKey)).max(20).optional(),
});

export const updateGuestSchema = guestSchema.partial();

export const bulkGuestsSchema = z.object({
  guests: z.array(guestSchema).min(1).max(500),
});

export const listGuestsSchema = z.object({
  search: z.string().max(120).optional(),
  groupLabel: z.string().max(120).optional(),
  /** `pending` also covers guests who have not responded at all. */
  status: z.nativeEnum(RsvpStatus).optional(),
  /** Narrows the list to the guests asked to one ceremony. */
  ceremonyKey: z.nativeEnum(CeremonyKey).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
});

export type GuestInput = z.infer<typeof guestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type BulkGuestsInput = z.infer<typeof bulkGuestsSchema>;
export type ListGuestsQuery = z.infer<typeof listGuestsSchema>;
