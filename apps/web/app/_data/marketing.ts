/**
 * Copy for the marketing pages, transcribed from the design file. Clear
 * spelling slips in the mockups have been corrected here (M-Pesa, WhatsApp,
 * "clients", "the way they really happen"); wording is otherwise untouched.
 */

export type HowItWorksStep = { title: string; description: string };

export const howItWorksSteps: HowItWorksStep[] = [
  {
    title: "Create your event",
    description: "Sign up with a phone number or email. No credit card to start",
  },
  {
    title: "Choose your event type",
    description:
      "Wedding, birthday, baby shower or another celebration. This decides which tools you get; a wedding unlocks the registry and timeline; a birthday keeps things simple",
  },
  {
    title: "Choose your design",
    description:
      "Browse by celebration and by style, including designs inspired by Kenya, and preview one with your own names before you commit.",
  },
  {
    title: "Customize it",
    description:
      "Names, dates, venue, colors and optional details. Save, preview and adjust before sharing.",
  },
  {
    title: "Publish",
    description:
      "You get a personal link; worththewait.co.ke/amina-brian- that works on every phone",
  },
  {
    title: "Share invitation",
    description:
      "Open WhatsApp, SMS or email with your event link, or create a private link for one guest.",
  },
  {
    title: "Collect RSVPs",
    description:
      "Guests reply on their phone in under a minute. Meal choices, plus-ones and notes come with it.",
  },
  {
    title: "Manage your guests",
    description:
      "Live replies, people attending, guest corrections and an export whenever you need one.",
  },
  {
    title: "Celebrate",
    description:
      "Turn up knowing exactly who's coming. Your event stays live as a keepsake afterwards.",
  },
];

export type AboutCard = { emoji: string; title: string; body: string };

export const aboutIntro =
  "Aunties who confirm the week off. Cousins flying from three countries. A guest list that somehow grows by forty people. We grew up around these celebrations, so we built something that works the way they really happen.";

export const aboutCards: AboutCard[] = [
  {
    emoji: "🎈",
    title: "It works how you already do",
    body: "Pay with M-Pesa. Share on WhatsApp. Do the whole thing from your phone. Nothing you'll need to learn",
  },
  {
    emoji: "🎉",
    title: "Not just for weddings",
    body: "A first birthday, a graduation, a baby shower, an anniversary. If it's worth gathering people for, it's worth doing properly.",
  },
  {
    emoji: "🏅",
    title: "You come first not vendors",
    body: "We are not another directory trying to sell you a photographer. We're here to make the planning part easier.",
  },
];

export type PricingPlan = {
  id: string;
  eyebrow: string;
  price: string;
  /** Rendered smaller, after the price. */
  period?: string;
  summary: string;
  included: string[];
  excluded?: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "beta",
    eyebrow: "Free beta",
    price: "KES 0",
    summary: "Create and share celebrations while the beta is open.",
    included: [
      "Create wedding, birthday, baby shower and other invitations",
      "Digital invitation",
      "RSVP collection",
      "Registry for weddings and baby showers",
      "Manual WhatsApp, SMS and email sharing",
      "Guest list export",
    ],
    excluded: ["Checkout", "paid plans", "professional workspaces"],
    cta: { label: "Start beta", href: "/sign-up" },
    featured: true,
  },
  {
    id: "later",
    eyebrow: "Coming later",
    price: "Paid plans",
    summary: "For hosts and professionals who need more after beta.",
    included: [
      "Professional accounts",
      "Provider delivery integrations",
      "More publishing and design options",
      "Commercial support",
    ],
    cta: { label: "Join the beta", href: "/sign-up" },
  },
];

export const pricingFaqs = [
  {
    question: "Is the beta free?",
    answer:
      "Yes. The beta is free while the core invitation, RSVP and website journeys are being completed.",
  },
  {
    question: "Can I publish without a date?",
    answer:
      "Yes. Guests will see Date to be announced until you add one.",
  },
  {
    question: "Which celebrations get a registry?",
    answer:
      "Registries are available for weddings and baby showers in the beta.",
  },
];
