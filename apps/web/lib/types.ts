import type {
  CeremonyKey,
  EventModuleKey,
  EventStatus,
  EventTypeKey,
  EventVisibility,
  InvitationChannel,
  RsvpStatus,
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
      attendeeNames: string[];
      message: string | null;
    } | null;
  } | null;
}
