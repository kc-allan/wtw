import { CreateStepKey, EventTypeKey, createStepsForType } from "@wtw/shared";

/**
 * The steps between choosing what to celebrate and picking a design. Which
 * ones appear depends on the event type and on whether the visitor already has
 * an account, so the strip along the top and the moves between the pages are
 * both read from one place.
 */
export interface CreateStep {
  id: string;
  label: string;
  href: string;
}

const TYPE_STEP: CreateStep = { id: "type", label: "Event Type", href: "/create" };
const ROLE_STEP: CreateStep = { id: "role", label: "Who are you?", href: "/create/who" };
const ACCOUNT_STEP: CreateStep = {
  id: "account",
  label: "Sign up/ Login",
  href: "/create/account",
};
const CEREMONIES_STEP: CreateStep = {
  id: "ceremonies",
  // Only weddings ask this today, which is why the label names one.
  label: "Wedding ceremony type",
  href: "/create/ceremonies",
};

/** Every step this event type can have, in order, whoever is walking it. */
function allSteps(typeKey: EventTypeKey): CreateStep[] {
  const asks = createStepsForType(typeKey);
  return [
    TYPE_STEP,
    ...(asks.includes(CreateStepKey.HOST_ROLE) ? [ROLE_STEP] : []),
    ACCOUNT_STEP,
    ...(asks.includes(CreateStepKey.CEREMONIES) ? [CEREMONIES_STEP] : []),
  ];
}

/** Someone already signed in has nothing to answer on the account step. */
function isHidden(step: CreateStep, signedIn: boolean): boolean {
  return step.id === ACCOUNT_STEP.id && signedIn;
}

export function createSteps(typeKey: EventTypeKey, signedIn: boolean): CreateStep[] {
  return allSteps(typeKey).filter((step) => !isHidden(step, signedIn));
}

/**
 * Where a step hands over to, or null when it is the last one. Walking the
 * full list rather than the visible one matters on the account step itself:
 * by the time it finishes, the person signing up is signed in, and the step
 * they just completed has vanished from the list they came in on.
 */
export function stepAfter(
  typeKey: EventTypeKey,
  signedIn: boolean,
  currentId: string,
): CreateStep | null {
  const steps = allSteps(typeKey);
  const index = steps.findIndex((step) => step.id === currentId);
  if (index < 0) return null;

  return steps.slice(index + 1).find((step) => !isHidden(step, signedIn)) ?? null;
}
