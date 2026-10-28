import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { Env } from '../config/env';

interface SiteverifyResponse {
  success?: boolean;
  hostname?: string;
  action?: string;
  challenge_ts?: string;
  'error-codes'?: string[];
}

@Injectable()
export class TurnstileService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  async verify(token: string, expectedAction: string): Promise<boolean> {
    const secret = this.config.get('TURNSTILE_SECRET_KEY', { infer: true });
    const hostname = this.config.get('TURNSTILE_HOSTNAME', { infer: true });
    if (!secret || !hostname) return false;

    const idempotencyKey = randomUUID();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response: Response;
      try {
        response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret, response: token, idempotency_key: idempotencyKey }),
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        if (attempt === 0) continue;
        throw new ServiceUnavailableException('Security check is temporarily unavailable');
      }

      if (!response.ok) {
        if (attempt === 0 && response.status >= 500) continue;
        throw new ServiceUnavailableException('Security check is temporarily unavailable');
      }

      const result = (await response.json().catch(() => null)) as SiteverifyResponse | null;
      if (Array.isArray(result?.['error-codes']) && result['error-codes']!.includes('internal-error')) {
        if (attempt === 0) continue;
        throw new ServiceUnavailableException('Security check is temporarily unavailable');
      }
      if (!result?.success || result.hostname !== hostname || result.action !== expectedAction) {
        return false;
      }
      const challengeTime = result.challenge_ts ? Date.parse(result.challenge_ts) : NaN;
      return Number.isFinite(challengeTime) &&
        challengeTime <= Date.now() + 30_000 &&
        challengeTime >= Date.now() - 5 * 60_000;
    }
    throw new ServiceUnavailableException('Security check is temporarily unavailable');
  }
}
