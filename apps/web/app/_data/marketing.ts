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
    title: "Select a template",
    description:
      "Browse by style; Classic & Elegant, Luxury, Nature or Kenyan Inspired, and preview it with your own names before you commit.",
  },
  {
    title: "Customize it",
    description:
      "Names, dates, venue, colors, your story, your photos. Everything updates live as you type.",
  },
  {
    title: "Publish",
    description:
      "You get a personal link; worththewait.co.ke/amina-brian- that works on every phone",
  },
  {
    title: "Share invitation",
    description:
      "One tap to WhatsApp, SMS or email. Send to everyone at once, or personalize per guest",
  },
  {
    title: "Collect RSVPs",
    description:
      "Guests reply on their phone in under a minute. Meal choices, plus-ones and notes come with it.",
  },
  {
    title: "Manage your guests",
    description:
      "Live counts, categories, reminders for anyone who hasn't replied, and an export whenever you need one.",
  },
  {
    title: "Celebrate",
    description:
      "Turn up knowing exactly who's coming. Your event stays live as a keepsake afterwards.",
  },
];

export type AboutCard = { emoji: string; title: string; body: string };

export const aboutIntro =
  "Aunties who confirm the week of. Cousins flying from three countries. A guest list that somehow grows by forty people. We grew up around these celebrations, so we built something that works the way they really happen; not the way an app somewhere else assumed they would.";

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
    id: "free",
    eyebrow: "Free",
    price: "KES 0",
    summary: "Try it properly before you pay.",
    included: [
      "1 event",
      "3 starter templates",
      "Digital invitation",
      "RSVP collection (up to 30 guests)",
    ],
    excluded: ["Premium templates", "Custom link", "Gift registry"],
    cta: { label: "Start free", href: "/sign-up" },
  },
  {
    id: "celebration",
    eyebrow: "Celebration",
    price: "KES 4,000",
    period: "/Event",
    summary: "Everything most weddings and parties need",
    included: [
      "All templates, all styles",
      "Full event website",
      "Unlimited guests & RSVP",
      "Custom link & countdown",
      "Gift registry/ wishlist",
      "WhatsApp, SMS & email sharing",
      "Guest list export",
    ],
    cta: { label: "Choose celebration", href: "/sign-up?plan=celebration" },
    featured: true,
  },
  {
    id: "professional",
    eyebrow: "Professional",
    price: "KES 7,500",
    period: "/Month",
    summary: "For planners, venues and decor companies",
    included: [
      "Unlimited events",
      "Create events for clients",
      "Multi-event dashboard",
      "Team access",
      "Your branding on invites",
      "Advanced guest analytics",
      "Priority support",
    ],
    cta: { label: "Talk to us", href: "/about#contact" },
  },
];

export const pricingFaqs = [
  {
    question: "Is the payment really one off?",
    answer:
      "For hosts, yes; you pay per celebration, not monthly. The monthly plan exists for professionals running many events a year.",
  },
  {
    question: "What happens to my site after event?",
    answer:
      "It stays live as a keepsake. Your guest list, RSVPs and photos remain in your account, and you can unpublish the page at any time.",
  },
  {
    question: "Can I upgrade after publishing for free?",
    answer:
      "Yes. Upgrading unlocks the premium templates, the registry and the custom link on the event you have already built — nothing needs rebuilding.",
  },
];
