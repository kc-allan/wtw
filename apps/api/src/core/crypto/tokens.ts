import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Guest links carry a raw token; only its digest is stored, so a database
 * leak does not hand out working invitations.
 */
export function generateRawToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('base64url');
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export function tokensMatch(rawToken: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashToken(rawToken), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}
