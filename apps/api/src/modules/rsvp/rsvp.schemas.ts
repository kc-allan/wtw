import { RsvpStatus } from '@wtw/shared';
import { z } from 'zod';

export const submitRsvpSchema = z.object({
  status: z.nativeEnum(RsvpStatus).refine((value) => value !== RsvpStatus.PENDING, {
    message: 'Choose whether you are attending',
  }),
  partySize: z.number().int().min(1).max(20).default(1),
  attendeeNames: z.array(z.string().min(1).max(120)).max(20).default([]),
  /** Must be one of the options the host set on the RSVP module. */
  mealChoice: z.string().max(60).optional(),
  dietaryNotes: z.string().max(1000).optional(),
  message: z.string().max(2000).optional(),
  /** Answers to the host's custom questions, keyed by question id. */
  answers: z.record(z.string(), z.unknown()).default({}),
});

export const listRsvpsSchema = z.object({
  status: z.nativeEnum(RsvpStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
});

export type SubmitRsvpInput = z.infer<typeof submitRsvpSchema>;
export type ListRsvpsQuery = z.infer<typeof listRsvpsSchema>;
