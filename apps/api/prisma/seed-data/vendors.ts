import { EventTypeKey, VendorCategoryKey, VendorStatus } from '@wtw/shared';

export interface SeedVendor {
  slug: string;
  name: string;
  tagline: string;
  categories: VendorCategoryKey[];
  eventTypes: EventTypeKey[];
  city: string;
  county: string;
  priceFrom: number;
  /** Reachable on WhatsApp, which is how hosts here actually get in touch. */
  whatsappNumber: string;
  phone: string;
  email: string;
  status: VendorStatus;
  isFeatured: boolean;
}

/**
 * A thin sample so vendor search returns something during frontend work. One
 * profile spans several categories and event types on purpose — that is the
 * behaviour the directory has to support.
 */
export const seedVendors: SeedVendor[] = [
  {
    slug: 'karura-gardens',
    name: 'Karura Gardens',
    tagline: 'Forest-edge garden venue for ceremonies and receptions.',
    categories: [VendorCategoryKey.VENUES],
    eventTypes: [EventTypeKey.WEDDING, EventTypeKey.BRIDAL_SHOWER, EventTypeKey.CORPORATE],
    city: 'Nairobi',
    county: 'Nairobi',
    priceFrom: 15000000,
    whatsappNumber: '+254720100000',
    phone: '+254720100000',
    email: 'hello@karuragardens.co.ke',
    status: VendorStatus.APPROVED,
    isFeatured: true,
  },
  {
    slug: 'sanaa-decor',
    name: 'Sanaa Decor & Rentals',
    tagline: 'Florals, draping, tents and table styling.',
    categories: [VendorCategoryKey.DECOR_AND_RENTALS],
    eventTypes: [
      EventTypeKey.WEDDING,
      EventTypeKey.BIRTHDAY,
      EventTypeKey.BABY_SHOWER,
      EventTypeKey.ANNIVERSARY,
    ],
    city: 'Nairobi',
    county: 'Nairobi',
    priceFrom: 4500000,
    whatsappNumber: '+254721111111',
    phone: '+254721111111',
    email: 'hello@sanaadecor.co.ke',
    status: VendorStatus.APPROVED,
    isFeatured: true,
  },
  {
    slug: 'mama-njeri-catering',
    name: 'Mama Njeri Catering',
    tagline: 'Kenyan and continental menus, plus celebration cakes.',
    categories: [VendorCategoryKey.CATERING_AND_CAKES],
    eventTypes: [
      EventTypeKey.WEDDING,
      EventTypeKey.BIRTHDAY,
      EventTypeKey.BABY_SHOWER,
      EventTypeKey.GRADUATION,
      EventTypeKey.CORPORATE,
    ],
    city: 'Nairobi',
    county: 'Kiambu',
    priceFrom: 180000,
    whatsappNumber: '+254722122222',
    phone: '+254722122222',
    email: 'hello@mamanjericatering.co.ke',
    status: VendorStatus.APPROVED,
    isFeatured: false,
  },
  {
    slug: 'pwani-frames',
    name: 'Pwani Frames',
    tagline: 'Coastal wedding photography and film.',
    categories: [VendorCategoryKey.PHOTO_AND_VIDEO],
    eventTypes: [EventTypeKey.WEDDING, EventTypeKey.ANNIVERSARY],
    city: 'Diani',
    county: 'Kwale',
    priceFrom: 9000000,
    whatsappNumber: '+254723133333',
    phone: '+254723133333',
    email: 'hello@pwaniframes.co.ke',
    status: VendorStatus.APPROVED,
    isFeatured: true,
  },
  {
    slug: 'glow-by-amina',
    name: 'Glow by Amina',
    tagline: 'Bridal hair, makeup and grooming.',
    categories: [VendorCategoryKey.BEAUTY],
    eventTypes: [EventTypeKey.WEDDING, EventTypeKey.BRIDAL_SHOWER, EventTypeKey.BIRTHDAY],
    city: 'Nairobi',
    county: 'Nairobi',
    priceFrom: 2500000,
    whatsappNumber: '+254724144444',
    phone: '+254724144444',
    email: 'hello@glowbyamina.co.ke',
    status: VendorStatus.APPROVED,
    isFeatured: false,
  },
  {
    slug: 'dj-kesh',
    name: 'DJ Kesh & The Live Room',
    tagline: 'MC, DJ and a five-piece band.',
    categories: [VendorCategoryKey.ENTERTAINMENT],
    eventTypes: [
      EventTypeKey.WEDDING,
      EventTypeKey.BIRTHDAY,
      EventTypeKey.CORPORATE,
      EventTypeKey.ANNIVERSARY,
    ],
    city: 'Nairobi',
    county: 'Nairobi',
    priceFrom: 6000000,
    whatsappNumber: '+254725155555',
    phone: '+254725155555',
    email: 'hello@djkesh.co.ke',
    status: VendorStatus.APPROVED,
    isFeatured: false,
  },
  {
    slug: 'atelier-wanjiru',
    name: 'Atelier Wanjiru',
    tagline: 'Bridal gowns, suits and kitenge tailoring.',
    categories: [VendorCategoryKey.FASHION],
    eventTypes: [EventTypeKey.WEDDING, EventTypeKey.GRADUATION],
    city: 'Nairobi',
    county: 'Nairobi',
    priceFrom: 12000000,
    whatsappNumber: '+254726166666',
    phone: '+254726166666',
    email: 'hello@atelierwanjiru.co.ke',
    status: VendorStatus.APPROVED,
    isFeatured: false,
  },
  {
    slug: 'siku-events',
    name: 'Siku Event Planners',
    tagline: 'Full planning, partial planning and day-of coordination.',
    categories: [VendorCategoryKey.EVENT_PLANNERS],
    eventTypes: [
      EventTypeKey.WEDDING,
      EventTypeKey.BABY_SHOWER,
      EventTypeKey.CORPORATE,
      EventTypeKey.GRADUATION,
    ],
    city: 'Nakuru',
    county: 'Nakuru',
    priceFrom: 20000000,
    whatsappNumber: '+254727177777',
    phone: '+254727177777',
    email: 'hello@sikuevents.co.ke',
    status: VendorStatus.APPROVED,
    isFeatured: true,
  },
];
