import { EventModuleKey } from './event-modules';
import { EventTypeKey } from './event-types';

export enum CelebrationPresentation {
  INVITATION = 'invitation',
  WEDDING_WEBSITE = 'wedding_website',
}

export interface BetaCapabilityDefaults {
  presentation: CelebrationPresentation[];
  defaultPresentation: CelebrationPresentation;
  modules: EventModuleKey[];
  optionalModules: EventModuleKey[];
  excludedModules: EventModuleKey[];
  allowsRegistry: boolean;
  allowsDownload: boolean;
  paidUpgradeAvailable: false;
}

const SIMPLE_MODULES = [
  EventModuleKey.INVITATION,
  EventModuleKey.EVENT_DETAILS,
  EventModuleKey.RSVP,
  EventModuleKey.VENUE_MAP,
  EventModuleKey.COUNTDOWN,
  EventModuleKey.SHARING,
];

const WEDDING_INVITATION_MODULES = [
  ...SIMPLE_MODULES,
  EventModuleKey.REGISTRY,
];

const WEDDING_WEBSITE_MODULES = [
  EventModuleKey.INVITATION,
  EventModuleKey.EVENT_DETAILS,
  EventModuleKey.WEBSITE,
  EventModuleKey.RSVP,
  EventModuleKey.OUR_STORY,
  EventModuleKey.TIMELINE,
  EventModuleKey.VENUE_MAP,
  EventModuleKey.REGISTRY,
  EventModuleKey.FAQ,
  EventModuleKey.DRESS_CODE,
  EventModuleKey.COUNTDOWN,
  EventModuleKey.SHARING,
];

export const BETA_CAPABILITIES: Record<EventTypeKey, BetaCapabilityDefaults> = {
  [EventTypeKey.WEDDING]: {
    presentation: [
      CelebrationPresentation.INVITATION,
      CelebrationPresentation.WEDDING_WEBSITE,
    ],
    defaultPresentation: CelebrationPresentation.INVITATION,
    modules: WEDDING_INVITATION_MODULES,
    optionalModules: [
      EventModuleKey.ACCOMMODATION,
      EventModuleKey.GALLERY,
      EventModuleKey.OUR_STORY,
      EventModuleKey.TIMELINE,
      EventModuleKey.FAQ,
      EventModuleKey.DRESS_CODE,
      EventModuleKey.WEBSITE,
    ],
    excludedModules: [EventModuleKey.GAMES],
    allowsRegistry: true,
    allowsDownload: true,
    paidUpgradeAvailable: false,
  },
  [EventTypeKey.BIRTHDAY]: {
    presentation: [CelebrationPresentation.INVITATION],
    defaultPresentation: CelebrationPresentation.INVITATION,
    modules: SIMPLE_MODULES,
    optionalModules: [],
    excludedModules: [
      EventModuleKey.WEBSITE,
      EventModuleKey.OUR_STORY,
      EventModuleKey.TIMELINE,
      EventModuleKey.REGISTRY,
      EventModuleKey.FAQ,
      EventModuleKey.DRESS_CODE,
      EventModuleKey.ACCOMMODATION,
      EventModuleKey.GAMES,
      EventModuleKey.GALLERY,
    ],
    allowsRegistry: false,
    allowsDownload: true,
    paidUpgradeAvailable: false,
  },
  [EventTypeKey.BABY_SHOWER]: {
    presentation: [CelebrationPresentation.INVITATION],
    defaultPresentation: CelebrationPresentation.INVITATION,
    modules: [
      ...SIMPLE_MODULES,
      EventModuleKey.REGISTRY,
      EventModuleKey.GAMES,
    ],
    optionalModules: [EventModuleKey.REGISTRY, EventModuleKey.GAMES],
    excludedModules: [
      EventModuleKey.WEBSITE,
      EventModuleKey.OUR_STORY,
      EventModuleKey.TIMELINE,
      EventModuleKey.FAQ,
      EventModuleKey.DRESS_CODE,
      EventModuleKey.ACCOMMODATION,
      EventModuleKey.GALLERY,
    ],
    allowsRegistry: true,
    allowsDownload: true,
    paidUpgradeAvailable: false,
  },
  [EventTypeKey.GRADUATION]: simpleInvitationDefaults(),
  [EventTypeKey.ANNIVERSARY]: simpleInvitationDefaults(),
  [EventTypeKey.BRIDAL_SHOWER]: simpleInvitationDefaults(),
  [EventTypeKey.CORPORATE]: simpleInvitationDefaults(),
};

export function betaCapabilitiesFor(typeKey: EventTypeKey): BetaCapabilityDefaults {
  return BETA_CAPABILITIES[typeKey];
}

export function registryAllowedInBeta(typeKey: EventTypeKey): boolean {
  return BETA_CAPABILITIES[typeKey].allowsRegistry;
}

function simpleInvitationDefaults(): BetaCapabilityDefaults {
  return {
    presentation: [CelebrationPresentation.INVITATION],
    defaultPresentation: CelebrationPresentation.INVITATION,
    modules: SIMPLE_MODULES,
    optionalModules: [],
    excludedModules: [
      EventModuleKey.WEBSITE,
      EventModuleKey.OUR_STORY,
      EventModuleKey.TIMELINE,
      EventModuleKey.REGISTRY,
      EventModuleKey.FAQ,
      EventModuleKey.DRESS_CODE,
      EventModuleKey.ACCOMMODATION,
      EventModuleKey.GAMES,
      EventModuleKey.GALLERY,
    ],
    allowsRegistry: false,
    allowsDownload: true,
    paidUpgradeAvailable: false,
  };
}
