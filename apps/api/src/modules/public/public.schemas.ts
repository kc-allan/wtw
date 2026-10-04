import { z } from 'zod';

/** What someone tells us when they add themselves to a host's guest list. */
export const joinGuestListSchema = z.object({
  firstName: z.string().min(1).max(80).trim(),
  lastName: z.string().max(80).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().min(7).max(20).trim().optional(),
});

export type JoinGuestListInput = z.infer<typeof joinGuestListSchema>;
