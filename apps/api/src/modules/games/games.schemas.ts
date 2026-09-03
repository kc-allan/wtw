import { ALL_GAME_KEYS, GameKey } from '@wtw/shared';
import { z } from 'zod';

export const addGameSchema = z.object({
  gameKey: z.nativeEnum(GameKey),
  /** Validated against the schema for this game's response kind. */
  config: z.record(z.string(), z.unknown()).default({}),
  position: z.number().int().min(0).max(50).default(0),
});

export const updateGameSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  position: z.number().int().min(0).max(50).optional(),
});

export const submitGameSchema = z.object({
  /** Falls back to the invited guest's name when the token identifies one. */
  guestName: z.string().min(1).max(120).trim().optional(),
  payload: z.unknown(),
});

export const ALL_GAME_KEY_VALUES = ALL_GAME_KEYS;

export type AddGameInput = z.infer<typeof addGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type SubmitGameInput = z.infer<typeof submitGameSchema>;
