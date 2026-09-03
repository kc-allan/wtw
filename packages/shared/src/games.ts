import { z } from 'zod';

/** Games guests play straight from a baby shower page; hosts export the results. */
export enum GameKey {
  GUESS_BIRTH_DATE = 'guess_birth_date',
  GUESS_WEIGHT = 'guess_weight',
  NAME_SUGGESTIONS = 'name_suggestions',
  WHO_KNOWS_MUM_BEST = 'who_knows_mum_best',
  BABY_TRIVIA = 'baby_trivia',
  BABY_EMOJI_QUIZ = 'baby_emoji_quiz',
  ADVICE_FOR_PARENTS = 'advice_for_parents',
  WISHES_FOR_BABY = 'wishes_for_baby',
  BABY_PREDICTIONS = 'baby_predictions',
}

/**
 * How a game collects an answer. Games sharing a kind share their submission
 * schema, so adding a game is usually data rather than new validation code.
 */
export type GameResponseKind = 'date' | 'weight' | 'text' | 'quiz' | 'predictions';

export const gameSubmissionSchemas = {
  date: z.object({ guess: z.coerce.date() }),
  weight: z.object({
    grams: z.number().int().min(500).max(8000),
  }),
  text: z.object({ text: z.string().min(1).max(1000) }),
  quiz: z.object({
    answers: z.record(z.string(), z.string().max(500)),
  }),
  predictions: z.object({
    eyeColour: z.string().max(60).optional(),
    hairColour: z.string().max(60).optional(),
    looksLike: z.enum(['mum', 'dad', 'both']).optional(),
    arrivesEarlyOrLate: z.enum(['early', 'on_time', 'late']).optional(),
    lengthCm: z.number().min(20).max(70).optional(),
    note: z.string().max(1000).optional(),
  }),
} as const satisfies Record<GameResponseKind, z.ZodTypeAny>;

/**
 * What the host fills in before a game can run. Quiz games are the only ones
 * that carry questions; the rest just take an optional reworded prompt, so a
 * host can ask for advice in their own voice without a new game definition.
 */
const quizQuestion = z.object({
  id: z.string().min(1).max(60),
  prompt: z.string().min(1).max(300),
  /** Empty means a free-text answer rather than a multiple choice. */
  options: z.array(z.string().min(1).max(200)).max(8).default([]),
  /** Kept host-side; used to score submissions, never sent to guests. */
  correctAnswer: z.string().max(200).optional(),
});

const basePrompt = z.object({ prompt: z.string().max(300).optional() });

export const gameConfigSchemas = {
  date: basePrompt,
  weight: basePrompt,
  text: basePrompt,
  quiz: basePrompt.extend({
    questions: z.array(quizQuestion).min(1).max(20),
  }),
  predictions: basePrompt,
} as const satisfies Record<GameResponseKind, z.ZodTypeAny>;

export type GameConfig<K extends GameResponseKind> = z.infer<
  (typeof gameConfigSchemas)[K]
>;
export type QuizQuestion = z.infer<typeof quizQuestion>;

export type GameSubmission<K extends GameResponseKind> = z.infer<
  (typeof gameSubmissionSchemas)[K]
>;

export interface GameDefinition {
  key: GameKey;
  name: string;
  prompt: string;
  responseKind: GameResponseKind;
  /** Quiz games need host-supplied questions before they can be switched on. */
  requiresHostContent: boolean;
}

export const GAMES: Record<GameKey, GameDefinition> = {
  [GameKey.GUESS_BIRTH_DATE]: {
    key: GameKey.GUESS_BIRTH_DATE,
    name: "Guess baby's birth date",
    prompt: 'When do you think the little one will arrive?',
    responseKind: 'date',
    requiresHostContent: false,
  },
  [GameKey.GUESS_WEIGHT]: {
    key: GameKey.GUESS_WEIGHT,
    name: "Guess baby's weight",
    prompt: 'How heavy will baby be at birth?',
    responseKind: 'weight',
    requiresHostContent: false,
  },
  [GameKey.NAME_SUGGESTIONS]: {
    key: GameKey.NAME_SUGGESTIONS,
    name: 'Baby name suggestions',
    prompt: 'What should they call the baby?',
    responseKind: 'text',
    requiresHostContent: false,
  },
  [GameKey.WHO_KNOWS_MUM_BEST]: {
    key: GameKey.WHO_KNOWS_MUM_BEST,
    name: 'Who knows mum best?',
    prompt: 'How well do you really know the mum-to-be?',
    responseKind: 'quiz',
    requiresHostContent: true,
  },
  [GameKey.BABY_TRIVIA]: {
    key: GameKey.BABY_TRIVIA,
    name: 'Baby trivia quiz',
    prompt: 'Test what you know about babies.',
    responseKind: 'quiz',
    requiresHostContent: true,
  },
  [GameKey.BABY_EMOJI_QUIZ]: {
    key: GameKey.BABY_EMOJI_QUIZ,
    name: 'Baby emoji quiz',
    prompt: 'Work out the baby word from the emoji.',
    responseKind: 'quiz',
    requiresHostContent: true,
  },
  [GameKey.ADVICE_FOR_PARENTS]: {
    key: GameKey.ADVICE_FOR_PARENTS,
    name: 'Advice for the parents',
    prompt: 'Share one piece of advice for the new parents.',
    responseKind: 'text',
    requiresHostContent: false,
  },
  [GameKey.WISHES_FOR_BABY]: {
    key: GameKey.WISHES_FOR_BABY,
    name: 'Wishes for baby',
    prompt: 'What do you wish for the little one?',
    responseKind: 'text',
    requiresHostContent: false,
  },
  [GameKey.BABY_PREDICTIONS]: {
    key: GameKey.BABY_PREDICTIONS,
    name: 'Baby predictions card',
    prompt: 'Make your predictions about baby.',
    responseKind: 'predictions',
    requiresHostContent: false,
  },
};

export const ALL_GAME_KEYS = Object.values(GameKey);

export function parseGameSubmission(key: GameKey, value: unknown) {
  return gameSubmissionSchemas[GAMES[key].responseKind].parse(value);
}

/** Validates the host's setup for a game before its instance is written. */
export function parseGameConfig(key: GameKey, value: unknown) {
  return gameConfigSchemas[GAMES[key].responseKind].parse(value ?? {});
}

/**
 * The questions a quiz game asks, with answers stripped. Guests are sent this
 * rather than the raw config so the answer key never leaves the host's side.
 */
export function publicGameConfig(key: GameKey, config: unknown) {
  const kind = GAMES[key].responseKind;
  if (kind !== 'quiz') {
    return gameConfigSchemas[kind].parse(config ?? {});
  }

  const { questions, ...rest } = gameConfigSchemas.quiz.parse(config ?? {});
  return {
    ...rest,
    questions: questions.map(({ correctAnswer: _answer, ...question }) => question),
  };
}
