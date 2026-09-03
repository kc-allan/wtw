import { z } from 'zod';
import { normalisePhone } from '../../common/phone';

const password = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(200)
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number');

/**
 * Hosts give the dialling code and the local number separately, so the two are
 * put together and canonicalised here rather than anywhere further in.
 */
const phone = z
  .object({
    diallingCode: z.string().regex(/^\+\d{1,4}$/, 'Pick a country').default('+254'),
    number: z.string().min(4).max(20),
  })
  .transform((value, ctx) => {
    const normalised = normalisePhone(value.number, value.diallingCode);
    if (normalised === null) {
      ctx.addIssue({ code: 'custom', message: 'Enter a valid phone number' });
      return z.NEVER;
    }
    return normalised;
  });

export const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password,
  /** Optional: the sign-up form asks for it nowhere, so it is derived. */
  name: z.string().min(1).max(120).trim().optional(),
  phone: phone.optional(),
});

export const loginSchema = z.object({
  /** Either the email or the phone number the account was created with. */
  identifier: z.string().min(1).max(200).trim(),
  password: z.string().min(1),
});

/**
 * The authorization code from Google, exchanged server side. The redirect URI
 * travels with it because Google checks the two match.
 */
export const googleAuthSchema = z.object({
  code: z.string().min(1).max(2000),
  redirectUri: z.string().url(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
