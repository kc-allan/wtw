import { PlanKey, isPlanKey } from "@wtw/shared";
import { api } from "./api";
import { readAccessToken } from "./session";
import type { CurrentUser } from "./types";

/**
 * The plan of whoever is reading. Someone signed out is on the free plan for
 * the purpose of what they may use, which is the same answer as a host who has
 * not upgraded — so the browse grid does not need to tell the two apart.
 */
export async function viewerPlan(): Promise<PlanKey> {
  if ((await readAccessToken()) === undefined) {
    return PlanKey.FREE;
  }

  const user = await api<CurrentUser>("/auth/me").catch(() => null);
  return user && isPlanKey(user.plan) ? user.plan : PlanKey.FREE;
}
