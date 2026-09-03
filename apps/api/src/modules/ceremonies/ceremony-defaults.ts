import { CEREMONIES, CeremonyKey, sortCeremonyKeys } from '@wtw/shared';
import type { Prisma } from '@prisma/client';
import { toDbCeremonyKey } from '../../core/prisma/enums';

/**
 * The rows a host's selection turns into, in the usual sequence rather than
 * the order the boxes were ticked. Kept free of injection so an event can be
 * created with its ceremonies in one write.
 */
export function buildCeremonies(
  keys: readonly CeremonyKey[],
): Prisma.CeremonyCreateWithoutEventInput[] {
  return sortCeremonyKeys(keys).map((key) => ({
    key: toDbCeremonyKey(key),
    name: CEREMONIES[key].name,
    position: CEREMONIES[key].position,
  }));
}
