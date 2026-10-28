import { z } from 'zod';

const csv = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

/**
 * A setting that is simply not configured. An empty value counts as absent, so
 * a key left blank in a copied .env reads the same as one that is not there.
 */
const unset = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value));

const booleanFromString = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return value;
}, z.boolean().default(false));

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4100),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_REPLAY_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  INVITATION_TOKEN_SECRET: z.string().min(16),
  RSVP_IDEMPOTENCY_SECRET: z.string().min(32).default('local-rsvp-idempotency-secret-change-me'),
  TURNSTILE_SITE_KEY: unset,
  TURNSTILE_SECRET_KEY: unset,
  TURNSTILE_HOSTNAME: unset,
  TURNSTILE_DEV_BYPASS: booleanFromString,

  WEB_APP_URL: z.string().url().default('http://localhost:3000'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform(csv),

  /** Absent until the credentials exist; the sign-in button follows suit. */
  GOOGLE_CLIENT_ID: unset,
  GOOGLE_CLIENT_SECRET: unset,

  /** Where uploaded images are written, and the path they are served from. */
  MEDIA_STORAGE_DIR: z.string().default('var/media'),
  MEDIA_PUBLIC_PATH: z.string().default('/media'),
  MEDIA_STORAGE_DRIVER: z.enum(['local', 'r2']).default('local'),
  R2_ACCOUNT_ID: unset,
  R2_ACCESS_KEY_ID: unset,
  R2_SECRET_ACCESS_KEY: unset,
  R2_BUCKET: unset,
  MEDIA_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(600).default(600),
  MEDIA_MAX_BYTES: z.coerce.number().int().positive().max(8 * 1024 * 1024).default(8 * 1024 * 1024),

  THROTTLE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),
});

export type Env = z.infer<typeof envSchema>;

/** Fails fast at boot rather than at the first request that needs a value. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${detail}`);
  }
  if (
    result.data.NODE_ENV === 'production' &&
    result.data.JWT_REFRESH_REPLAY_SECRET === 'local-refresh-replay-secret-change-me'
  ) {
    throw new Error('JWT_REFRESH_REPLAY_SECRET must be set to a private production secret');
  }
  if (
    result.data.NODE_ENV === 'production' &&
    result.data.RSVP_IDEMPOTENCY_SECRET === 'local-rsvp-idempotency-secret-change-me'
  ) {
    throw new Error('RSVP_IDEMPOTENCY_SECRET must be set to a private production secret');
  }
  if (
    result.data.NODE_ENV === 'production' &&
    (!result.data.TURNSTILE_SITE_KEY || !result.data.TURNSTILE_SECRET_KEY || !result.data.TURNSTILE_HOSTNAME)
  ) {
    throw new Error('Turnstile credentials and hostname are required in production');
  }
  if (result.data.TURNSTILE_DEV_BYPASS && result.data.NODE_ENV === 'production') {
    throw new Error('Turnstile development bypass cannot be enabled in production');
  }
  if (result.data.NODE_ENV === 'production' && result.data.MEDIA_STORAGE_DRIVER !== 'r2') {
    throw new Error('MEDIA_STORAGE_DRIVER must be r2 in production');
  }
  if (result.data.MEDIA_STORAGE_DRIVER === 'r2' && (!result.data.R2_ACCOUNT_ID || !result.data.R2_ACCESS_KEY_ID || !result.data.R2_SECRET_ACCESS_KEY || !result.data.R2_BUCKET)) {
    throw new Error('R2 account, credentials, and bucket are required when MEDIA_STORAGE_DRIVER=r2');
  }
  return result.data;
}
