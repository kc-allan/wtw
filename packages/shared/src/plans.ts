/**
 * What a host is subscribed to. Every account starts free; nothing moves an
 * account off that yet, because there is no way to pay, but the designs and
 * the catalogue both need to know which plan a person is on.
 */
export enum PlanKey {
  FREE = 'free',
  CELEBRATION = 'celebration',
  PROFESSIONAL = 'professional',
}

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  /** Whether the designs kept for paying hosts are included. */
  includesPremiumDesigns: boolean;
}

export const PLANS: Record<PlanKey, PlanDefinition> = {
  [PlanKey.FREE]: {
    key: PlanKey.FREE,
    name: 'Free',
    includesPremiumDesigns: false,
  },
  [PlanKey.CELEBRATION]: {
    key: PlanKey.CELEBRATION,
    name: 'Celebration',
    includesPremiumDesigns: true,
  },
  [PlanKey.PROFESSIONAL]: {
    key: PlanKey.PROFESSIONAL,
    name: 'Professional',
    includesPremiumDesigns: true,
  },
};

/** The cheapest plan that includes the designs kept for paying hosts. */
export const PLAN_WITH_PREMIUM_DESIGNS = PlanKey.CELEBRATION;

export function planIncludesPremiumDesigns(plan: PlanKey): boolean {
  return PLANS[plan].includesPremiumDesigns;
}

export function isPlanKey(value: string): value is PlanKey {
  return value in PLANS;
}
