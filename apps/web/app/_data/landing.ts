export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
];

export type TemplateCard = {
  id: string;
  eyebrow: string;
  /** Rendered on its own line so couple names break the way they do in the design. */
  names: string[];
  palette: string;
  theme: "pine" | "gradient" | "ivory" | "boho";
};

const weddingTemplates: TemplateCard[] = [
  {
    id: "emerald-gold",
    eyebrow: "THE WEDDING OF",
    names: ["Amina & Brian"],
    palette: "Emerald & Gold",
    theme: "pine",
  },
  {
    id: "kitenge-modern",
    eyebrow: "KARIBU",
    names: ["Wanjiru", "& Kip"],
    palette: "KITENGE MODERN",
    theme: "gradient",
  },
  {
    id: "ivory-champagne",
    eyebrow: "Together with their families",
    names: ["Grace", "& Daniel"],
    palette: "Ivory and Champage",
    theme: "ivory",
  },
  {
    id: "boho-pampas",
    eyebrow: "SAVE THE DATE",
    names: ["NIA", "& TOM"],
    palette: "Boho Pampas",
    theme: "boho",
  },
];

export type Category = {
  id: string;
  label: string;
};

export const categories: Category[] = [
  { id: "weddings", label: "Weddings" },
  { id: "birthdays", label: "Birthdays" },
  { id: "graduations", label: "Graduations" },
  { id: "anniversaries", label: "Anniversaries" },
  { id: "baby-shower", label: "Baby shower" },
];

/**
 * Only the wedding set has been designed so far; the remaining categories fall
 * back to it until their own card artwork exists.
 */
export const templatesByCategory: Record<string, TemplateCard[]> = {
  weddings: weddingTemplates,
  birthdays: weddingTemplates,
  graduations: weddingTemplates,
  anniversaries: weddingTemplates,
  "baby-shower": weddingTemplates,
};

export type Celebration = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Revealed over the photo on hover or keyboard focus. */
  detail: {
    title: string;
    summary: string;
    features: string[];
  };
};

export const celebrations: Record<
  "wedding" | "babyShower" | "graduation" | "birthday",
  Celebration
> = {
  wedding: {
    src: "/images/celebrations/wedding.jpg",
    alt: "Beachfront wedding aisle lined with floral arrangements and candles at sunset",
    width: 736,
    height: 1203,
    detail: {
      title: "Weddings",
      summary:
        "Our flagship. Full wedding website, registry, timeline, accommodation and countdown",
      features: [
        "Digital invitation",
        "RSVP management",
        "Gift registry",
        "Venue and maps",
      ],
    },
  },
  babyShower: {
    src: "/images/celebrations/baby-shower.jpg",
    alt: "Baby shower balloon arch reading Oh Baby with a teddy bear at its centre",
    width: 736,
    height: 1104,
    detail: {
      title: "Baby showers",
      summary:
        "Simple and elegant , plus digital games guests can play straight from the page",
      features: [
        "Wishlist/ registry",
        "Shower games",
        "RSVP",
        "Venue and maps",
      ],
    },
  },
  graduation: {
    src: "/images/celebrations/graduation.jpg",
    alt: "Graduates throwing their caps into the air at dusk",
    width: 736,
    height: 981,
    detail: {
      title: "Other celebrations",
      summary:
        "Graduations, anniversaries, bridal showers and corporate events.",
      features: ["Digital inivation", "RSVP", "Event details", "Themed designs"],
    },
  },
  birthday: {
    src: "/images/celebrations/birthday.jpg",
    alt: "Gold and cream balloon display beside illuminated marquee numbers reading 23",
    width: 679,
    height: 849,
    // Placeholder: this is the one panel the prototype never opens, so the copy
    // below is a stand-in and still needs the real wording.
    detail: {
      title: "Birthdays",
      summary:
        "Milestone or low-key, with a page that carries the mood and keeps the list tidy.",
      features: [
        "Digital invitation",
        "RSVP",
        "Wishlist/ registry",
        "Venue and maps",
      ],
    },
  },
};

export type Step = {
  number: string;
  title: string;
  body: string;
  illustration: string;
  /** Illustrations are exported at their designed size and scale as one unit. */
  width: number;
  height: number;
};

export const steps: Step[] = [
  {
    number: "01",
    title: "Pick an events (2 minutes)",
    body: "Choosing the type plus the basics: event name, date, city, rough guest count.",
    illustration: "/illustrations/pick-an-event.svg",
    width: 385,
    height: 308,
  },
  {
    number: "02",
    title: "Choose a design (20 minutes)",
    body: "The only step that takes real time. Browsing is quick, but writing your story, adding the timeline, venue details and dress code is where people actually linger.",
    illustration: "/illustrations/choose-a-design.svg",
    width: 384,
    height: 307,
  },
  {
    number: "03",
    title: "Share the link (1 minute)",
    body: "Genuinely one tap. The number being this small is the point — it's the contrast with printing and hand-delivering cards.",
    illustration: "/illustrations/share-the-link.svg",
    width: 384,
    height: 307,
  },
  {
    number: "04",
    title: "Watch RSVPs land",
    body: "Every reply arrives on its own and counts itself. See who's coming, who's gone quiet, and how many seats you'll need, no chasing, no spreadsheets.",
    illustration: "/illustrations/watch-rsvps-land.svg",
    width: 385,
    height: 307,
  },
];

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  meta: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "amina",
    quote:
      "Our guests RSVPd in hours. The Gift registry made it so easy to manage expectations.",
    name: "Amina Wanjiku",
    meta: "Wedding. Nairobi",
  },
  {
    id: "david-fatuma",
    quote:
      "Worth The Wait made our 10- year celebration feel world-class. Setup took 20 minutes",
    name: "David & Fatuma",
    meta: "Anniversary. Mombasa",
  },
  {
    id: "grace",
    quote:
      "The vendor directory found us an amazing caterer and photographer in one afternoon",
    name: "Grace Atieno",
    meta: "Baby Shower. Nakuru",
  },
  {
    id: "grace-2",
    quote:
      "The vendor directory found us an amazing caterer and photographer in one afternoon",
    name: "Grace Atieno",
    meta: "Baby Shower. Nakuru",
  },
  {
    id: "grace-3",
    quote:
      "The vendor directory found us an amazing caterer and photographer in one afternoon",
    name: "Grace Atieno",
    meta: "Baby Shower. Nakuru",
  },
];

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "Do my guests need to download an app?",
    answer:
      "No. Everything opens in a browser from a link. Whatsapp, SMS or email .guests tap, read, and RSVP in under a minute.",
  },
  {
    question: "Can I pay with M-Pesa?",
    answer:
      "Yes. M-Pesa sits alongside card payment at checkout, so you can pay the way you already do.",
  },
  {
    question: "Is there a free options?",
    answer:
      "Yes. You can build an event, pick a design and share it for free. Paid plans add the extras like the gift registry and unlimited guests.",
  },
  {
    question: "What if I need to change details after sending?",
    answer:
      "Edit the event and everyone sees the update straight away. The link never changes, so nothing you have already shared breaks.",
  },
  {
    question: "I'm planning from abroad. Does that work?",
    answer:
      "It does. Everything runs in the browser wherever you are, and guests see times in their own timezone.",
  },
];

export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/pricing" },
      { label: "Guest experience", href: "/guest-experience" },
    ],
  },
  {
    heading: "Celebration",
    links: [
      { label: "Weddings", href: "/celebrations/weddings" },
      { label: "Birthdays", href: "/celebrations/birthdays" },
      { label: "Baby showers", href: "/celebrations/baby-showers" },
      { label: "Graduations", href: "/celebrations/graduations" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contacts", href: "/contacts" },
      { label: "For professionals", href: "/professionals" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy.", href: "/privacy" },
  { label: "Terms.", href: "/terms" },
];
