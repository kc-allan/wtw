import {
  CeremonyKey as DbCeremonyKey,
  EventModuleKey as DbEventModuleKey,
  EventStatus as DbEventStatus,
  EventTypeKey as DbEventTypeKey,
  EventVisibility as DbEventVisibility,
  HostRole as DbHostRole,
  InvitationChannel as DbInvitationChannel,
  InvitationStatus as DbInvitationStatus,
  RsvpStatus as DbRsvpStatus,
  VendorCategoryKey as DbVendorCategoryKey,
  VendorStatus as DbVendorStatus,
} from '@prisma/client';
import {
  CeremonyKey,
  EventModuleKey,
  EventStatus,
  EventTypeKey,
  EventVisibility,
  HostRole,
  InvitationChannel,
  InvitationStatus,
  RsvpStatus,
  VendorCategoryKey,
  VendorStatus,
} from '@wtw/shared';

/**
 * The schema's enums and the contracts in @wtw/shared are written out twice —
 * Prisma cannot import them. These assertions fail the build if the two ever
 * drift, so the casts below stay safe.
 */
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Expect<T extends true> = T;

type _EventTypeKeysMatch = Expect<Equals<`${EventTypeKey}`, DbEventTypeKey>>;
type _EventModuleKeysMatch = Expect<Equals<`${EventModuleKey}`, DbEventModuleKey>>;
type _EventStatusesMatch = Expect<Equals<`${EventStatus}`, DbEventStatus>>;
type _EventVisibilitiesMatch = Expect<Equals<`${EventVisibility}`, DbEventVisibility>>;
type _CeremonyKeysMatch = Expect<Equals<`${CeremonyKey}`, DbCeremonyKey>>;
type _HostRolesMatch = Expect<Equals<`${HostRole}`, DbHostRole>>;
type _RsvpStatusesMatch = Expect<Equals<`${RsvpStatus}`, DbRsvpStatus>>;
type _InvitationChannelsMatch = Expect<Equals<`${InvitationChannel}`, DbInvitationChannel>>;
type _InvitationStatusesMatch = Expect<Equals<`${InvitationStatus}`, DbInvitationStatus>>;
type _VendorCategoriesMatch = Expect<Equals<`${VendorCategoryKey}`, DbVendorCategoryKey>>;
type _VendorStatusesMatch = Expect<Equals<`${VendorStatus}`, DbVendorStatus>>;

export const toDbEventType = (value: EventTypeKey): DbEventTypeKey => value;
export const toDbModuleKey = (value: EventModuleKey): DbEventModuleKey => value;
export const toDbEventStatus = (value: EventStatus): DbEventStatus => value;
export const toDbVisibility = (value: EventVisibility): DbEventVisibility => value;
export const toDbCeremonyKey = (value: CeremonyKey): DbCeremonyKey => value;
export const toDbHostRole = (value: HostRole): DbHostRole => value;
export const toDbRsvpStatus = (value: RsvpStatus): DbRsvpStatus => value;
export const toDbInvitationChannel = (value: InvitationChannel): DbInvitationChannel => value;
export const toDbInvitationStatus = (value: InvitationStatus): DbInvitationStatus => value;
export const toDbVendorCategory = (value: VendorCategoryKey): DbVendorCategoryKey => value;
export const toDbVendorStatus = (value: VendorStatus): DbVendorStatus => value;

export const fromDbEventType = (value: DbEventTypeKey): EventTypeKey =>
  value as unknown as EventTypeKey;
export const fromDbModuleKey = (value: DbEventModuleKey): EventModuleKey =>
  value as unknown as EventModuleKey;
export const fromDbCeremonyKey = (value: DbCeremonyKey): CeremonyKey =>
  value as unknown as CeremonyKey;
