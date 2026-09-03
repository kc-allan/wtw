/**
 * How the person setting up the event stands in relation to it. It decides the
 * wording the host sees and which defaults we pre-fill, and it is the seam a
 * professional workspace grows from later: a planner is the only role that
 * belongs to someone else's celebration.
 */
export enum HostRole {
  BRIDE = 'bride',
  GROOM = 'groom',
  PLANNER = 'planner',
  OTHER = 'other',
}

export interface HostRoleDefinition {
  key: HostRole;
  name: string;
  /** True when the host is running the day on behalf of someone else. */
  onBehalfOfOthers?: boolean;
}

export const HOST_ROLES: Record<HostRole, HostRoleDefinition> = {
  [HostRole.BRIDE]: { key: HostRole.BRIDE, name: 'Bride' },
  [HostRole.GROOM]: { key: HostRole.GROOM, name: 'Groom' },
  [HostRole.PLANNER]: { key: HostRole.PLANNER, name: 'Planner', onBehalfOfOthers: true },
  [HostRole.OTHER]: { key: HostRole.OTHER, name: 'Other' },
};

/** The order the roles are offered in. */
export const HOST_ROLE_ORDER: HostRole[] = [
  HostRole.BRIDE,
  HostRole.GROOM,
  HostRole.PLANNER,
  HostRole.OTHER,
];

export function isHostRole(value: string): value is HostRole {
  return value in HOST_ROLES;
}
