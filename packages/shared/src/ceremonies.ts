/**
 * A wedding in the region is rarely one gathering. Couples run a sequence of
 * ceremonies over weeks or months, each with its own date, venue, guest list
 * and look, so the platform models them as parts of a single wedding rather
 * than as separate events the couple would have to keep in step by hand.
 */
export enum CeremonyKey {
  INTRODUCTIONS = 'introductions',
  DOWRY = 'dowry',
  TRADITIONAL = 'traditional',
  RELIGIOUS = 'religious',
  RECEPTION = 'reception',
  SEND_OFF = 'send_off',
}

export interface CeremonyDefinition {
  key: CeremonyKey;
  /** The label a host picks from, and the default name of the ceremony. */
  name: string;
  /**
   * What the same ceremony is called across the communities we serve. Shown
   * beside the name so a host recognises their own word for it; the list is
   * not exhaustive and a host can rename the ceremony afterwards.
   */
  alsoKnownAs: string[];
  /** Where it falls in the usual sequence, and so the default render order. */
  position: number;
}

export const CEREMONIES: Record<CeremonyKey, CeremonyDefinition> = {
  [CeremonyKey.INTRODUCTIONS]: {
    key: CeremonyKey.INTRODUCTIONS,
    name: 'Introductions',
    alsoKnownAs: ['Kũmenya mũcĩ', 'Kwanjula', 'First visit'],
    position: 0,
  },
  [CeremonyKey.DOWRY]: {
    key: CeremonyKey.DOWRY,
    name: 'Dowry ceremony',
    alsoKnownAs: ['Rũracio', 'Ayie', 'Koito', 'Ntheo', 'Nyombo'],
    position: 1,
  },
  [CeremonyKey.TRADITIONAL]: {
    key: CeremonyKey.TRADITIONAL,
    name: 'Traditional wedding',
    alsoKnownAs: [],
    position: 2,
  },
  [CeremonyKey.RELIGIOUS]: {
    key: CeremonyKey.RELIGIOUS,
    name: 'Church or Religious ceremony',
    alsoKnownAs: [],
    position: 3,
  },
  [CeremonyKey.RECEPTION]: {
    key: CeremonyKey.RECEPTION,
    name: 'Reception',
    alsoKnownAs: [],
    position: 4,
  },
  [CeremonyKey.SEND_OFF]: {
    key: CeremonyKey.SEND_OFF,
    name: 'Send off',
    alsoKnownAs: [],
    position: 5,
  },
};

/** The ceremonies in the order they are offered, and normally happen. */
export const CEREMONY_ORDER: CeremonyKey[] = Object.values(CEREMONIES)
  .sort((a, b) => a.position - b.position)
  .map((ceremony) => ceremony.key);

export function isCeremonyKey(value: string): value is CeremonyKey {
  return value in CEREMONIES;
}

/**
 * Sorts a host's selection back into the ceremonial sequence, so the order
 * they tapped the checkboxes never decides the order of their day.
 */
export function sortCeremonyKeys(keys: readonly CeremonyKey[]): CeremonyKey[] {
  return [...new Set(keys)].sort((a, b) => CEREMONIES[a].position - CEREMONIES[b].position);
}
