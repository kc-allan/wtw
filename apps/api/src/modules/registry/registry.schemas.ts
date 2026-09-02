import { z } from 'zod';

export const registryItemSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  /** Minor units of the event currency. */
  price: z.number().int().nonnegative().optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  externalUrl: z.string().url().optional(),
  position: z.number().int().min(0).max(500).default(0),
});

export const updateRegistryItemSchema = registryItemSchema.partial();

export const claimRegistryItemSchema = z.object({
  guestName: z.string().min(1).max(120).trim(),
  guestEmail: z.string().email().optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  message: z.string().max(1000).optional(),
  isCashGift: z.boolean().default(false),
  amount: z.number().int().nonnegative().optional(),
});

export type RegistryItemInput = z.infer<typeof registryItemSchema>;
export type UpdateRegistryItemInput = z.infer<typeof updateRegistryItemSchema>;
export type ClaimRegistryItemInput = z.infer<typeof claimRegistryItemSchema>;
