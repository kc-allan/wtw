import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TurnstileService } from './turnstile.service';

describe('TurnstileService', () => {
  const get = vi.fn((key: string) => ({
    TURNSTILE_SECRET_KEY: 'secret',
    TURNSTILE_HOSTNAME: 'example.test',
  }[key]));
  const service = new TurnstileService({ get } as never);

  beforeEach(() => {
    vi.restoreAllMocks();
    get.mockClear();
  });

  it('accepts only a recent successful response for the expected hostname and action', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      hostname: 'example.test',
      action: 'contact',
      challenge_ts: new Date().toISOString(),
    }), { status: 200 })));

    await expect(service.verify('response-token', 'contact')).resolves.toBe(true);
  });

  it('rejects a response issued for a different hostname or action', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      hostname: 'other.test',
      action: 'login',
      challenge_ts: new Date().toISOString(),
    }), { status: 200 })));

    await expect(service.verify('response-token', 'contact')).resolves.toBe(false);
  });

  it('retries a transport failure with the same Siteverify idempotency key', async () => {
    const fetch = vi.fn()
      .mockRejectedValueOnce(new Error('network failure'))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        hostname: 'example.test',
        action: 'contact',
        challenge_ts: new Date().toISOString(),
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    await expect(service.verify('response-token', 'contact')).resolves.toBe(true);
    const first = JSON.parse(fetch.mock.calls[0][1].body as string);
    const second = JSON.parse(fetch.mock.calls[1][1].body as string);
    expect(first.idempotency_key).toBe(second.idempotency_key);
    expect(first.response).toBe('response-token');
  });

  it('rejects responses older than five minutes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      hostname: 'example.test',
      action: 'contact',
      challenge_ts: new Date(Date.now() - 6 * 60_000).toISOString(),
    }), { status: 200 })));

    await expect(service.verify('response-token', 'contact')).resolves.toBe(false);
  });
});
