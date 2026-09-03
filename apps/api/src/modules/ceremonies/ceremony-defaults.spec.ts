import { describe, expect, it } from 'vitest';
import {
  ALL_EVENT_TYPE_KEYS,
  CEREMONIES,
  CEREMONY_ORDER,
  CeremonyKey,
  CreateStepKey,
  EventTypeKey,
  createStepsForType,
  typeAsksCreateStep,
} from '@wtw/shared';
import { buildCeremonies } from './ceremony-defaults';

describe('buildCeremonies', () => {
  it('puts a selection back into the ceremonial sequence', () => {
    const rows = buildCeremonies([
      CeremonyKey.RECEPTION,
      CeremonyKey.INTRODUCTIONS,
      CeremonyKey.DOWRY,
    ]);

    expect(rows.map((row) => row.key)).toEqual(['introductions', 'dowry', 'reception']);
    expect(rows.map((row) => row.position)).toEqual([0, 1, 4]);
  });

  it('names each ceremony after its definition', () => {
    const [row] = buildCeremonies([CeremonyKey.DOWRY]);
    expect(row.name).toBe(CEREMONIES[CeremonyKey.DOWRY].name);
  });

  it('drops a ceremony chosen twice', () => {
    const rows = buildCeremonies([CeremonyKey.RECEPTION, CeremonyKey.RECEPTION]);
    expect(rows).toHaveLength(1);
  });

  it('has nothing to build from an empty selection', () => {
    expect(buildCeremonies([])).toEqual([]);
  });
});

describe('create steps', () => {
  it('asks weddings, and only weddings, about ceremonies', () => {
    const asked = ALL_EVENT_TYPE_KEYS.filter((key) =>
      typeAsksCreateStep(key, CreateStepKey.CEREMONIES),
    );
    expect(asked).toEqual([EventTypeKey.WEDDING]);
  });

  it('asks the role question alongside it', () => {
    expect(createStepsForType(EventTypeKey.WEDDING)).toEqual([
      CreateStepKey.HOST_ROLE,
      CreateStepKey.CEREMONIES,
    ]);
  });

  it('sends every other type straight from the basics to a design', () => {
    for (const key of ALL_EVENT_TYPE_KEYS.filter((k) => k !== EventTypeKey.WEDDING)) {
      expect(createStepsForType(key)).toEqual([]);
    }
  });

  it('offers every defined ceremony, in order, exactly once', () => {
    expect(CEREMONY_ORDER).toHaveLength(Object.keys(CEREMONIES).length);
    expect(new Set(CEREMONY_ORDER).size).toBe(CEREMONY_ORDER.length);
    expect(CEREMONY_ORDER.map((key) => CEREMONIES[key].position)).toEqual(
      [...CEREMONY_ORDER.map((key) => CEREMONIES[key].position)].sort((a, b) => a - b),
    );
  });
});
