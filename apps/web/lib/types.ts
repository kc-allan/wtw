import type {
  CeremonyKey,
  EventModuleKey,
  EventStatus,
  EventTypeKey,
  EventVisibility,
  InvitationChannel,
  PlanKey,
  RsvpStatus,
  VendorCategoryKey,
} from "@wtw/shared";

/** Design tokens a theme renders from; every template reads these five. */
export interface ThemePalette {
  background: string;
  surface: string;
  ink: string;
  accent: string;
  muted: string;
}

export interface Theme {
  /** The theme's identity everywhere: the API exposes no separate id. */
  key: string;
  name: string;
  group: string;
  eventTypeKey: EventTypeKey;
  palette: ThemePalette;
  previewImageUrl: string | null;
  isPremium: boolean;
}

export interface EventModuleView {
  key: EventModuleKey;
  name: string;
  description: string;
  tier: "free" | "premium";
  surface: "public" | "host";
  enabled: boolean;
  required: boolean;
  position: number;
  config: Record<string, unknown>;
}

/** One gathering within an event, with its own date, place and design. */
export interface Ceremony {
  id: string;
  key: CeremonyKey;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
  venueName: string | null;
  venueAddress: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  dressCode: string | null;
  position: number;
  theme: Pick<Theme, "key" | "name" | "palette"> | null;
}

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  hostNames: string[];
  typeKey: EventTypeKey;
  /** Null while the host is still deciding when. */
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
  expectedGuests: number | null;
  city: string | null;
  venueName: string | null;
  venueAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  status: EventStatus;
  visibility: EventVisibility;
  /** Whether people can add themselves to the guest list from a shared link. */
  guestListFormEnabled: boolean;
  currency: string;
  coverImageId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  theme: Pick<Theme, "key" | "name" | "group" | "palette"> & { isPremium: boolean } | null;
}

export interface EventDetail extends EventSummary {
  modules: EventModuleView[];
  ceremonies: Ceremony[];
}

/** Matches the API's envelope: rows under `data`, paging under `meta`. */
export interface Paginated<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  groupLabel: string | null;
  /** Empty means asked to every ceremony. */
  ceremonyKeys: CeremonyKey[];
  maxPartySize: number;
  notes: string | null;
  createdAt: string;
  rsvp: {
    status: RsvpStatus;
    partySize: number;
    mealChoice: string | null;
    dietaryNotes: string | null;
    respondedAt: string;
  } | null;
  invitation: {
    status: string;
    channel: InvitationChannel;
    sentAt: string | null;
    openedAt: string | null;
  } | null;
}

export interface RsvpSummary {
  attending: number;
  notAttending: number;
  maybe: number;
  pending: number;
  totalGuests: number;
  totalAttendees: number;
  plusOnes: number;
  meals: { choice: string; count: number }[];
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  /** The most generous plan among the workspaces they belong to. */
  plan: PlanKey;
}

/** The guest-facing view returned by `GET /e/:slug`. */
export interface PublicEvent {
  event: Omit<EventSummary, "coverImageId" | "publishedAt" | "createdAt" | "updatedAt"> & {
    theme: Pick<Theme, "key" | "name" | "group" | "palette"> | null;
  };
  /** Narrowed to the ceremonies this guest is asked to, when we know them. */
  ceremonies: Ceremony[];
  modules: EventModuleView[];
  guest: {
    id: string;
    invitationId: string;
    firstName: string;
    lastName: string | null;
    maxPartySize: number;
    rsvp: {
      status: RsvpStatus;
      partySize: number;
      /** Null unless the host asked how the party splits. */
      adults: number | null;
      children: number | null;
      attendeeNames: string[];
      mealChoice: string | null;
      dietaryNotes: string | null;
      message: string | null;
    } | null;
  } | null;
}

/** A vendor as the directory lists them; the profile carries more. */
export interface VendorSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  categories: VendorCategoryKey[];
  eventTypes: EventTypeKey[];
  city: string | null;
  county: string | null;
  /** Minor units of `currency`; the lowest a vendor quotes. */
  priceFrom: number | null;
  currency: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  rating: number | null;
  reviewCount: number;
  isFeatured: boolean;
}

export interface VendorProfile extends VendorSummary {
  description: string | null;
  phone: string | null;
  email: string | null;
  whatsappNumber: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  reviews: {
    authorName: string;
    rating: number;
    body: string | null;
    createdAt: string;
  }[];
}

/** One gift on the list, as a guest sees it. */
export interface RegistryItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  /** Minor units of the registry's currency. */
  price: number | null;
  quantity: number;
  quantityClaimed: number;
  externalUrl: string | null;
  status: string;
}

/** Everything the gifting section needs, in one guest-facing payload. */
export interface RegistryForGuests {
  allowCashGifts: boolean;
  cashGiftNote: string | null;
  cashGiftMethods: {
    kind: "mobile_money" | "bank" | "international";
    label: string;
    detail?: string;
  }[];
  externalRegistries: { label: string; url: string }[];
  currency: string;
  items: (RegistryItem & { remaining: number })[];
}

export interface GalleryPhoto {
  id: string;
  url: string;
  createdAt: string;
}
