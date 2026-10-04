export enum VendorCategoryKey {
  VENUES = 'venues',
  DECOR_AND_RENTALS = 'decor_and_rentals',
  CATERING_AND_CAKES = 'catering_and_cakes',
  PHOTO_AND_VIDEO = 'photo_and_video',
  BEAUTY = 'beauty',
  ENTERTAINMENT = 'entertainment',
  FASHION = 'fashion',
  EVENT_PLANNERS = 'event_planners',
}

export interface VendorCategoryDefinition {
  key: VendorCategoryKey;
  name: string;
  /** What fits on a filter chip, where the full name would wrap. */
  shortName: string;
  description: string;
}

export const VENDOR_CATEGORIES: Record<VendorCategoryKey, VendorCategoryDefinition> = {
  [VendorCategoryKey.VENUES]: {
    key: VendorCategoryKey.VENUES,
    name: 'Venues',
    shortName: 'Venues',
    description: 'Gardens, halls, hotels and private grounds.',
  },
  [VendorCategoryKey.DECOR_AND_RENTALS]: {
    key: VendorCategoryKey.DECOR_AND_RENTALS,
    name: 'Decor and event rentals',
    shortName: 'Decor and rentals',
    description: 'Décor, florals, furniture, tents, lighting, table styling and backdrops.',
  },
  [VendorCategoryKey.CATERING_AND_CAKES]: {
    key: VendorCategoryKey.CATERING_AND_CAKES,
    name: 'Catering and cakes',
    shortName: 'Catering and cakes',
    description: 'Caterers, bakers, bar service and dessert tables.',
  },
  [VendorCategoryKey.PHOTO_AND_VIDEO]: {
    key: VendorCategoryKey.PHOTO_AND_VIDEO,
    name: 'Photography and videography',
    shortName: 'Photos and videos',
    description: 'Photographers, videographers, photo booths and drone coverage.',
  },
  [VendorCategoryKey.BEAUTY]: {
    key: VendorCategoryKey.BEAUTY,
    name: 'Beauty services',
    shortName: 'Beauty',
    description: 'Hair, makeup and grooming.',
  },
  [VendorCategoryKey.ENTERTAINMENT]: {
    key: VendorCategoryKey.ENTERTAINMENT,
    name: 'Entertainment',
    shortName: 'Entertainment',
    description: 'MCs, DJs, live bands, dancers and performers.',
  },
  [VendorCategoryKey.FASHION]: {
    key: VendorCategoryKey.FASHION,
    name: 'Fashion',
    shortName: 'Fashion',
    description: 'Bridal gowns, suits, tailoring and styling.',
  },
  [VendorCategoryKey.EVENT_PLANNERS]: {
    key: VendorCategoryKey.EVENT_PLANNERS,
    name: 'Event planners',
    shortName: 'Planner',
    description: 'Full planning, partial planning and day-of coordination.',
  },
};

export const ALL_VENDOR_CATEGORY_KEYS = Object.values(VendorCategoryKey);

export enum VendorStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
}

export function isVendorCategoryKey(value: string): value is VendorCategoryKey {
  return value in VENDOR_CATEGORIES;
}
