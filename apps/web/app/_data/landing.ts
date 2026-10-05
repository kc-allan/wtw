export type NavLink = {
  label: string;
  href: string;
};

/** The wordmark is the way home, so the bar itself only carries the four pages. */
export const navLinks: NavLink[] = [
  { label: "Invitations", href: "/invitations" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Find a Vendor", href: "/vendors" },
  { label: "Plans", href: "/plans" },
  { label: "Our Story", href: "/our-story" },
];

export type TemplateCard = {
  /** The catalogue key, so the card links straight into that design. */
  id: string;
  eyebrow: string;
  /** Rendered on its own line so couple names break the way they do in the design. */
  names: string[];
  name: string;
  theme: "pine" | "gradient" | "ivory" | "boho";
};

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
 * Four designs per celebration, drawn from the catalogue so a visitor who taps
 * Birthdays sees birthday designs. The four card styles are the ones in the
 * design file; each celebration borrows them in the same order, which is what
 * keeps the band looking like one set rather than five.
 */
export const templatesByCategory: Record<string, TemplateCard[]> = {
  weddings: [
    {
      id: "wedding-emerald-green",
      eyebrow: "THE WEDDING OF",
      names: ["Amina & Brian"],
      name: "Emerald Green",
      theme: "pine",
    },
    {
      id: "wedding-kitenge-modern",
      eyebrow: "KARIBU",
      names: ["Wanjiru", "& Kip"],
      name: "Kitenge Modern",
      theme: "gradient",
    },
    {
      id: "wedding-ivory-and-champagne",
      eyebrow: "Together with their families",
      names: ["Grace", "& Daniel"],
      name: "Ivory & Champagne",
      theme: "ivory",
    },
    {
      id: "wedding-boho-pampas",
      eyebrow: "SAVE THE DATE",
      names: ["NIA", "& TOM"],
      name: "Boho Pampas",
      theme: "boho",
    },
  ],
  birthdays: [
    {
      id: "birthday-cocktail-party",
      eyebrow: "COME CELEBRATE",
      names: ["Amara turns 30"],
      name: "Cocktail Party",
      theme: "pine",
    },
    {
      id: "birthday-neon-party",
      eyebrow: "DOORS OPEN AT EIGHT",
      names: ["Jayden", "turns 15"],
      name: "Neon Party",
      theme: "gradient",
    },
    {
      id: "birthday-brunch-party",
      eyebrow: "Join us for brunch",
      names: ["Nadia", "turns 28"],
      name: "Brunch Party",
      theme: "ivory",
    },
    {
      id: "birthday-safari-animals",
      eyebrow: "COME CELEBRATE",
      names: ["ZAWADI", "TURNS 5"],
      name: "Safari Animals",
      theme: "boho",
    },
  ],
  graduations: [
    {
      id: "graduation-black-and-gold",
      eyebrow: "CELEBRATING",
      names: ["Brian Otieno"],
      name: "Black & Gold",
      theme: "pine",
    },
    {
      id: "graduation-future-begins",
      eyebrow: "WHAT COMES NEXT",
      names: ["Amani", "Njeri"],
      name: "Future Begins",
      theme: "gradient",
    },
    {
      id: "graduation-university-elegance",
      eyebrow: "With every congratulation",
      names: ["Wanjiru"],
      name: "University Elegance",
      theme: "ivory",
    },
    {
      id: "graduation-academic-excellence",
      eyebrow: "SAVE THE DATE",
      names: ["CLASS", "OF 2027"],
      name: "Academic Excellence",
      theme: "boho",
    },
  ],
  anniversaries: [
    {
      id: "anniversary-gold-celebration",
      eyebrow: "CELEBRATING",
      names: ["David & Fatuma"],
      name: "Gold Celebration",
      theme: "pine",
    },
    {
      id: "anniversary-elegant-dinner",
      eyebrow: "JOIN US FOR DINNER",
      names: ["Esther", "& Peter"],
      name: "Elegant Dinner",
      theme: "gradient",
    },
    {
      id: "anniversary-romantic-floral",
      eyebrow: "Ten years together",
      names: ["Grace", "& Daniel"],
      name: "Romantic Floral",
      theme: "ivory",
    },
    {
      id: "anniversary-silver-anniversary",
      eyebrow: "SAVE THE DATE",
      names: ["MARY", "& JOSEPH"],
      name: "Silver Anniversary",
      theme: "boho",
    },
  ],
  "baby-shower": [
    {
      id: "baby-shower-sage-green",
      eyebrow: "A BABY SHOWER FOR",
      names: ["Baby Mwangi"],
      name: "Sage Green",
      theme: "pine",
    },
    {
      id: "baby-shower-little-lion",
      eyebrow: "A BABY SHOWER FOR",
      names: ["Baby", "Nia"],
      name: "Little Lion",
      theme: "gradient",
    },
    {
      id: "baby-shower-blush-bloom",
      eyebrow: "A baby shower for",
      names: ["Baby", "Wanjiku"],
      name: "Blush Bloom",
      theme: "ivory",
    },
    {
      id: "baby-shower-modern-boho",
      eyebrow: "SAVE THE DATE",
      names: ["BABY", "KAMAU"],
      name: "Modern Boho",
      theme: "boho",
    },
  ],
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
        "Simple and elegant, plus digital games guests can play straight from the page",
      features: [
        "Gift registry",
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
      features: ["Digital invitation", "RSVP", "Event details", "Themed designs"],
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
        "Venue and maps",
        "Themed designs",
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
    body: "One tap opens the host's sharing app. The contrast with printing and hand-delivering cards is the point.",
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
      "No. Everything opens in a browser from a link. Guests tap, read and reply without installing anything.",
  },
  {
    question: "Is the beta free?",
    answer:
      "Yes. The beta is free while the invitation, RSVP and wedding website journeys are completed.",
  },
  {
    question: "Which celebrations have a registry?",
    answer:
      "Registries are available for weddings and baby showers during beta.",
  },
  {
    question: "What if I need to change details after sending?",
    answer:
      "Edit the event and everyone sees the update straight away. The link never changes, so nothing you have already shared breaks.",
  },
  {
    question: "I'm planning from abroad. Does that work?",
    answer:
      "It does. Everything runs in the browser wherever you are. Event times are shown with the event timezone.",
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
      { label: "Invitations", href: "/invitations" },
      { label: "Plans", href: "/plans" },
      { label: "Start beta", href: "/sign-up" },
    ],
  },
  {
    heading: "Celebration",
    links: [
      { label: "Wedding designs", href: "/invitations?type=wedding" },
      { label: "Birthday designs", href: "/invitations?type=birthday" },
      { label: "Baby shower designs", href: "/invitations?type=baby_shower" },
      { label: "Graduation designs", href: "/invitations?type=graduation" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our story", href: "/our-story" },
      { label: "Contact", href: "/our-story#contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
