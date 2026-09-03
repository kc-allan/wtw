import { describe, expect, it } from 'vitest';
import { looksLikeEmail, normalisePhone } from './phone';

describe('normalisePhone', () => {
  it('accepts the ways a Kenyan number is actually written', () => {
    for (const written of [
      '0712345678',
      '712345678',
      '+254712345678',
      '254712345678',
      '00254712345678',
      '0712 345 678',
      '(0712) 345-678',
    ]) {
      expect(normalisePhone(written)).toBe('+254712345678');
    }
  });

  it('keeps a number that already names another country', () => {
    expect(normalisePhone('+447700900123')).toBe('+447700900123');
  });

  it('applies the dialling code the host picked', () => {
    expect(normalisePhone('0755123456', '+255')).toBe('+255755123456');
  });

  it('refuses what cannot be a number', () => {
    for (const rubbish of ['', '   ', 'not a phone', '12', '+0712345678']) {
      expect(normalisePhone(rubbish)).toBeNull();
    }
  });

  it('separates the two things the sign-in field accepts', () => {
    expect(looksLikeEmail('amina@example.com')).toBe(true);
    expect(looksLikeEmail('0712345678')).toBe(false);
  });
});
