/** Numbers are stored in E.164 so one person has exactly one spelling of them. */
const E164 = /^\+[1-9]\d{6,14}$/;

/** Kenya, because that is where the first hosts and their guests are. */
export const DEFAULT_DIALLING_CODE = '+254';

/**
 * Accepts the ways someone actually types a number — with the country code,
 * with a leading zero, or with spaces in it — and returns one canonical form,
 * or null when it cannot be one.
 */
export function normalisePhone(
  raw: string,
  diallingCode: string = DEFAULT_DIALLING_CODE,
): string | null {
  const trimmed = raw.replace(/[\s\-().]/g, '');
  if (trimmed === '') return null;

  let candidate: string;
  if (trimmed.startsWith('+')) {
    candidate = trimmed;
  } else if (trimmed.startsWith('00')) {
    candidate = `+${trimmed.slice(2)}`;
  } else if (trimmed.startsWith('0')) {
    candidate = `${diallingCode}${trimmed.slice(1)}`;
  } else if (carriesCountryCode(trimmed, diallingCode)) {
    candidate = `+${trimmed}`;
  } else {
    candidate = `${diallingCode}${trimmed}`;
  }

  return E164.test(candidate) ? candidate : null;
}

/**
 * Someone who types 254712345678 has already given the country code and must
 * not be given it twice. The length check is what stops a local number that
 * happens to open with those digits from being mistaken for one.
 */
function carriesCountryCode(digits: string, diallingCode: string): boolean {
  const code = diallingCode.slice(1);
  return digits.startsWith(code) && digits.length - code.length >= 6;
}

/** Distinguishes the two things the sign-in field accepts. */
export function looksLikeEmail(value: string): boolean {
  return value.includes('@');
}
