import { ALL_EVENT_TYPE_KEYS } from '@wtw/shared';
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  /** The form asks for "phone or email" as one field, so accept either. */
  contact: z.string().min(5).max(200).trim(),
  /** One of the event type keys, or free text for anything else. */
  planning: z.string().max(120).trim().optional(),
  message: z.string().min(1).max(4000).trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const KNOWN_PLANNING_VALUES = ALL_EVENT_TYPE_KEYS;
