import type { ThemePalette } from "./types";
import { EventTypeKey } from "@wtw/shared";

export const DESIGN_CATEGORIES = [
  { key: EventTypeKey.WEDDING, label: "Weddings" },
  { key: EventTypeKey.BIRTHDAY, label: "Birthdays" },
  { key: EventTypeKey.BABY_SHOWER, label: "Baby showers" },
  { key: EventTypeKey.GRADUATION, label: "Graduations" },
  { key: EventTypeKey.ANNIVERSARY, label: "Anniversaries" },
  { key: EventTypeKey.BRIDAL_SHOWER, label: "Bridal showers" },
  { key: EventTypeKey.CORPORATE, label: "Corporate" },
];

export type InvitationDesign = {
  key: string;
  name: string;
  kind: "coastal" | "garden" | "brunch" | "blacktie" | "tropical" | "monochrome" | "space" | "neon" | "sky" | "explorer" | "scholar" | "heirloom" | "roses" | "conference";
  category: EventTypeKey;
  image: string;
  description: string;
  palette: ThemePalette;
  accents: { name: string; color: string }[];
  eyebrow?: string;
  subtitle?: string;
  replyHeading?: string;
  sectionLabels?: Partial<Record<string, string>>;
};

export const INVITATION_DESIGNS: InvitationDesign[] = [
  {
    key: "wedding-coastal-diani-and-lamu", name: "Coastal", kind: "coastal", category: EventTypeKey.WEDDING,
    image: "/images/invitations/coast.png",
    description: "A destination journal with open horizons, editorial chapters and a coastal itinerary.",
    palette: { background: "#eef7f8", surface: "#ffffff", ink: "#153b43", muted: "#4d676c", accent: "#216574" },
    accents: [{ name: "Ocean", color: "#216574" }, { name: "Coral", color: "#a84138" }, { name: "Palm", color: "#3a6044" }],
  },
  {
    key: "wedding-garden-wedding", name: "Garden Wedding", kind: "garden", category: EventTypeKey.WEDDING,
    image: "/images/invitations/garden.png",
    description: "Painted wildflowers, romantic typography and a garden that grows around your story.",
    palette: { background: "#fff6f7", surface: "#fffafb", ink: "#343d32", muted: "#666158", accent: "#7f344b" },
    accents: [{ name: "Rose", color: "#7f344b" }, { name: "Leaf", color: "#406343" }, { name: "Cornflower", color: "#375c89" }],
  },
  {
    key: "birthday-brunch-party", name: "Brunch Party", kind: "brunch", category: EventTypeKey.BIRTHDAY,
    image: "/images/invitations/brunch-table.png",
    description: "A cheerful bistro invitation with painted tableware, menu typography and picnic checks.",
    palette: { background: "#fffbe9", surface: "#ffffff", ink: "#283d32", muted: "#576357", accent: "#ad342d" },
    accents: [{ name: "Tomato", color: "#ad342d" }, { name: "Basil", color: "#356144" }, { name: "Blueberry", color: "#414a8b" }],
  },
  {
    key: "wedding-black-tie", name: "Black Tie", kind: "blacktie", category: EventTypeKey.WEDDING,
    image: "/images/invitations/calla.jpg", description: "Sculptural lilies, fine double rules and a formal evening programme.",
    palette: { background: "#f3f2ef", surface: "#ffffff", ink: "#252523", muted: "#65645d", accent: "#79612e" },
    accents: [{ name: "Antique gold", color: "#79612e" }, { name: "Merlot", color: "#813847" }, { name: "Graphite", color: "#454545" }],
    eyebrow: "Together with our families", subtitle: "Request the pleasure of your company", replyHeading: "Kindly reply",
    sectionLabels: { timeline: "The evening's programme", event_details: "An invitation" },
  },
  {
    key: "wedding-tropical-greenery", name: "Tropical Greenery", kind: "tropical", category: EventTypeKey.WEDDING,
    image: "/images/invitations/palms.jpg", description: "A lush botanical folio with oversized italic names and open-air chapters.",
    palette: { background: "#edf4e8", surface: "#fbfdf8", ink: "#263c2c", muted: "#536451", accent: "#386038" },
    accents: [{ name: "Fern", color: "#386038" }, { name: "Hibiscus", color: "#a13657" }, { name: "Lagoon", color: "#216776" }],
    eyebrow: "Together is a beautiful place", subtitle: "Join us as we begin forever", replyHeading: "Celebrate with us",
  },
  {
    key: "wedding-modern-monochrome", name: "Modern Monochrome", kind: "monochrome", category: EventTypeKey.WEDDING,
    image: "/images/invitations/calla.jpg", description: "An art-book invitation with oversized type, sculptural photography and precise editorial grids.",
    palette: { background: "#f0f0ed", surface: "#ffffff", ink: "#202020", muted: "#646464", accent: "#252525" },
    accents: [{ name: "Ink", color: "#252525" }, { name: "Cobalt", color: "#214c9a" }, { name: "Vermilion", color: "#a33a2a" }],
    eyebrow: "The wedding of", subtitle: "One day. Our favourite people.", replyHeading: "Be part of our day",
  },
  {
    key: "birthday-space-explorer", name: "Space Explorer", kind: "space", category: EventTypeKey.BIRTHDAY,
    image: "/images/invitations/space.png", description: "A paper-cut space mission with flight-log details and a launch countdown.",
    palette: { background: "#edf6fb", surface: "#ffffff", ink: "#263c50", muted: "#4d6577", accent: "#a43c32" },
    accents: [{ name: "Rocket red", color: "#a43c32" }, { name: "Mission blue", color: "#285b87" }, { name: "Orbit green", color: "#316951" }],
    eyebrow: "Calling all space explorers", subtitle: "An out-of-this-world celebration", replyHeading: "Joining the crew?",
    sectionLabels: { event_details: "The mission", venue_map: "Mission coordinates", countdown: "Countdown to launch" },
  },
  {
    key: "birthday-neon-party", name: "Neon Party", kind: "neon", category: EventTypeKey.BIRTHDAY,
    image: "/images/invitations/stage.jpg", description: "A music-poster invitation with acid-yellow type, pink ticket rules and a bold party countdown.",
    palette: { background: "#f3f4eb", surface: "#ffffff", ink: "#22251f", muted: "#62675c", accent: "#a32666" },
    accents: [{ name: "Hot pink", color: "#a32666" }, { name: "Electric green", color: "#3a641e" }, { name: "Ultramarine", color: "#354ea3" }],
    eyebrow: "Good people. Loud music.", subtitle: "Let's make some memories", replyHeading: "Are you in?",
    sectionLabels: { event_details: "The party", venue_map: "Meet us here", countdown: "Until we turn it up" },
  },
  {
    key: "baby-shower-blue-sky", name: "Blue Sky", kind: "sky", category: EventTypeKey.BABY_SHOWER,
    image: "/images/invitations/sky.jpg", description: "Cloud-blue correspondence with fine double rules, airy lettering and a gentle afternoon flow.",
    palette: { background: "#edf6fc", surface: "#fffdf8", ink: "#33475c", muted: "#586b7b", accent: "#39698d" },
    accents: [{ name: "Cornflower", color: "#39698d" }, { name: "Rose", color: "#925364" }, { name: "Sage", color: "#50684a" }],
    eyebrow: "A little love on the way", subtitle: "So much joy on the horizon", replyHeading: "We'd love to see you",
    sectionLabels: { event_details: "A little celebration", venue_map: "Meet us under the sky", countdown: "Until we're together" },
  },
  {
    key: "baby-shower-little-explorer", name: "Little Explorer", kind: "explorer", category: EventTypeKey.BABY_SHOWER,
    image: "/images/invitations/explorer.jpg", description: "A watercolor storybook landscape with dotted trail borders and field-note details.",
    palette: { background: "#eef4ec", surface: "#fcfdf9", ink: "#354b3d", muted: "#59675c", accent: "#4d6745" },
    accents: [{ name: "Moss", color: "#4d6745" }, { name: "Wild rose", color: "#96536a" }, { name: "Mountain blue", color: "#3e6580" }],
    eyebrow: "The biggest little adventure", subtitle: "A whole world of love awaits", replyHeading: "Come share the adventure",
    sectionLabels: { event_details: "A new chapter", venue_map: "Our gathering place", countdown: "The adventure is getting closer" },
  },
  {
    key: "graduation-academic-excellence", name: "Academic Excellence", kind: "scholar", category: EventTypeKey.GRADUATION,
    image: "/images/invitations/library.jpg", description: "A literary broadside with a bookish masthead, chapter rules and a celebratory colophon.",
    palette: { background: "#f2f4ec", surface: "#fffefa", ink: "#293b32", muted: "#5e695f", accent: "#3a5e48" },
    accents: [{ name: "Laurel", color: "#3a5e48" }, { name: "Ox-blood", color: "#7f303b" }, { name: "Oxford blue", color: "#2e5075" }],
    eyebrow: "The next chapter begins", subtitle: "For the work, the dreams, and everyone who believed", replyHeading: "Celebrate the next chapter",
    sectionLabels: { event_details: "A moment worth marking", timeline: "The programme" },
  },
  {
    key: "anniversary-romantic-floral", name: "Romantic Floral", kind: "heirloom", category: EventTypeKey.ANNIVERSARY,
    image: "/images/invitations/peonies.jpg", description: "A floral love letter with keepsake borders, tender serif type and generous space for memories.",
    palette: { background: "#f9edf0", surface: "#fffafb", ink: "#49333d", muted: "#78626b", accent: "#86435b" },
    accents: [{ name: "Rosewood", color: "#86435b" }, { name: "Olive", color: "#53633d" }, { name: "Mulberry", color: "#714f7e" }],
    eyebrow: "Still our favourite story", subtitle: "Here's to all the years, and all the years to come", replyHeading: "Share this moment with us",
  },
  {
    key: "bridal-shower-champagne-and-roses", name: "Champagne & Roses", kind: "roses", category: EventTypeKey.BRIDAL_SHOWER,
    image: "/images/invitations/peonies.jpg", description: "A rose-pink salon invitation with ribbon stripes, floral borders and a toast-ready reply.",
    palette: { background: "#fff4f4", surface: "#fffdf9", ink: "#603747", muted: "#806571", accent: "#a63c64" },
    accents: [{ name: "Raspberry", color: "#a63c64" }, { name: "Bordeaux", color: "#753946" }, { name: "Garden green", color: "#446444" }],
    eyebrow: "A toast to the bride-to-be", subtitle: "Love, laughter, and a little celebration", replyHeading: "Join us for a toast",
    sectionLabels: { event_details: "To the bride", venue_map: "A place for us", countdown: "Until the first toast" },
  },
  {
    key: "corporate-conference", name: "Conference", kind: "conference", category: EventTypeKey.CORPORATE,
    image: "/images/invitations/architecture.jpg", description: "An architectural invitation with bold signage, clear arrival information and a focused reply flow.",
    palette: { background: "#eef2f0", surface: "#ffffff", ink: "#203c38", muted: "#586a65", accent: "#246359" },
    accents: [{ name: "Teal", color: "#246359" }, { name: "Cobalt", color: "#3153a1" }, { name: "Brick", color: "#a04432" }],
    eyebrow: "Ideas worth bringing together", subtitle: "A meeting of minds", replyHeading: "Confirm your attendance",
    sectionLabels: { event_details: "About the event", venue_map: "Your arrival", countdown: "See you soon" },
  },
];

export const ACCENT_COLORS = [
  { name: "Forest", color: "#315d49" }, { name: "Rose", color: "#87364e" },
  { name: "Ocean", color: "#216574" }, { name: "Terracotta", color: "#a84138" },
  { name: "Ink", color: "#34343d" },
];

export function invitationDesign(key?: string | null) {
  return INVITATION_DESIGNS.find((design) => design.key === key);
}

export function invitationAccent(config?: Record<string, unknown>): string | undefined {
  return typeof config?.accentColor === "string" && /^#[0-9a-f]{6}$/i.test(config.accentColor)
    ? config.accentColor : undefined;
}
