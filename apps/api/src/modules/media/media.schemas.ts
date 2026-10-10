import { z } from 'zod';

export const updateMediaSchema = z.object({
  caption: z.string().max(300).nullable().optional(),
  altText: z.string().max(200).nullable().optional(),
  position: z.number().int().min(0).max(500).optional(),
  isHidden: z.boolean().optional(),
});

export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
