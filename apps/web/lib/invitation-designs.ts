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
  kind: "coastal" | "garden" | "brunch" | "blacktie" | "tropical" | "monochrome" | "space" | "neon" | "sky" | "explorer" | "scholar" | "heirloom" | "roses" | "conference" | "gilded" | "champagne" | "cocktail" | "forty" | "bloom" | "honey" | "emerald" | "porcelain" | "pampas" | "safari" | "kitenge" | "woven" | "burgundy" | "nocturne" | "timber" | "dinosaur" | "trucks" | "rainbow" | "mermaid" | "gaming" | "sporty";
  category: EventTypeKey;
  image: string;
  description: string;
  palette: ThemePalette;
  accents: { name: string; color: string }[];
  eyebrow?: string;
  subtitle?: string;
  replyHeading?: string;
  sectionLabels?: Partial<Record<string, string>>;
  sampleTitle?: string;
};

export const INVITATION_DESIGNS: InvitationDesign[] = [
  {
    key: "birthday-gaming", name: "Gaming", kind: "gaming", category: EventTypeKey.BIRTHDAY,
    sampleTitle: "Leo levels up", image: "/images/invitations/gaming.webp",
    description: "A multiplayer birthday lobby with session navigation, a shared game plan and a squad sign-up.",
    palette: { background: "#edf5ec", surface: "#fffef6", ink: "#293c36", muted: "#5c6c63", accent: "#a03e38" },
    accents: [{ name: "Player red", color: "#a03e38" }, { name: "Arcade green", color: "#35634a" }, { name: "High-score blue", color: "#315e91" }],
    eyebrow: "Your favourite player. A new level.", subtitle: "Good games. Great company.", replyHeading: "Join the birthday squad",
    sectionLabels: { event_details: "The game plan", venue_map: "Meet at the player lounge", countdown: "Next level in" },
  },
  {
    key: "birthday-sporty", name: "Sporty", kind: "sporty", category: EventTypeKey.BIRTHDAY,
    sampleTitle: "Nia's birthday match", image: "/images/invitations/sporty.webp",
    description: "A match-day birthday programme with an oversized club masthead, invitation stub and numbered fixture notes.",
    palette: { background: "#eef3fa", surface: "#fffef8", ink: "#293d53", muted: "#5d6d80", accent: "#305d94" },
    accents: [{ name: "Club blue", color: "#305d94" }, { name: "Team red", color: "#a23e36" }, { name: "Field green", color: "#3f6948" }],
    eyebrow: "One birthday. An all-star team.", subtitle: "It wouldn't be the same without you", replyHeading: "You're on the team",
    sectionLabels: { event_details: "The match-day programme", venue_map: "Our home ground", countdown: "Until the birthday kick-off" },
  },
  {
    key: "birthday-dinosaur-adventure", name: "Dinosaur Adventure", kind: "dinosaur", category: EventTypeKey.BIRTHDAY,
    sampleTitle: "Leo turns 5", image: "/images/invitations/dinosaur.webp",
    description: "A prehistoric expedition with painted dinosaurs, field-note details and a countdown to a roaring good time.",
    palette: { background: "#eaf3df", surface: "#fffef5", ink: "#354c31", muted: "#607055", accent: "#47703a" },
    accents: [{ name: "Fern", color: "#47703a" }, { name: "Volcano", color: "#a44835" }, { name: "Lagoon", color: "#35697a" }],
    eyebrow: "Calling all little explorers", subtitle: "A big adventure for a very big day", replyHeading: "Joining the adventure?",
    sectionLabels: { event_details: "A roaring good time", venue_map: "Find our base camp", countdown: "Until the adventure begins" },
  },
  {
    key: "birthday-construction-trucks", name: "Construction Trucks", kind: "trucks", category: EventTypeKey.BIRTHDAY,
    sampleTitle: "Leo turns 4", image: "/images/invitations/trucks.webp",
    description: "A birthday building site with paper-cut trucks, bold worksite lettering and a crew-check-in reply.",
    palette: { background: "#fff3bd", surface: "#fffef6", ink: "#343a3e", muted: "#626970", accent: "#355f89" },
    accents: [{ name: "Worksite blue", color: "#355f89" }, { name: "Brick", color: "#a24331" }, { name: "Graphite", color: "#4b5155" }],
    eyebrow: "Big plans. Bigger birthday.", subtitle: "Let's build a brilliant day", replyHeading: "Join the birthday crew",
    sectionLabels: { event_details: "The birthday plan", venue_map: "Report here for fun", countdown: "The big day is on its way" },
  },
  {
    key: "birthday-rainbow", name: "Rainbow", kind: "rainbow", category: EventTypeKey.BIRTHDAY,
    sampleTitle: "Nia turns 6", image: "/images/invitations/rainbow.webp",
    description: "A paper-cut rainbow, bright chapter bands and a colour-filled countdown for a joyful birthday gathering.",
    palette: { background: "#fff0f2", surface: "#fffef8", ink: "#3d4960", muted: "#647087", accent: "#a33b66" },
    accents: [{ name: "Raspberry", color: "#a33b66" }, { name: "Sky blue", color: "#35688d" }, { name: "Leaf", color: "#43704e" }],
    eyebrow: "All the colours of a happy day", subtitle: "A little brighter with you there", replyHeading: "Save your place in the fun",
    sectionLabels: { event_details: "A day full of happy", venue_map: "Follow the rainbow here", countdown: "Counting down to colour" },
  },
  {
    key: "birthday-mermaid", name: "Mermaid", kind: "mermaid", category: EventTypeKey.BIRTHDAY,
    sampleTitle: "Nia turns 7", image: "/images/invitations/mermaid.webp",
    description: "An underwater storybook with a painted mermaid, coral chapter borders and a sea-blue birthday countdown.",
    palette: { background: "#e8f5f3", surface: "#fffbf9", ink: "#35545f", muted: "#617a7f", accent: "#367681" },
    accents: [{ name: "Sea glass", color: "#367681" }, { name: "Coral rose", color: "#a34b69" }, { name: "Pearl violet", color: "#76568e" }],
    eyebrow: "A little magic under the sea", subtitle: "An ocean of birthday wishes", replyHeading: "Come make a splash",
    sectionLabels: { event_details: "A birthday beneath the waves", venue_map: "Our little lagoon", countdown: "Until we make a splash" },
  },
  {
    key: "wedding-safari-chic", name: "Safari Chic", kind: "safari", category: EventTypeKey.WEDDING,
    image: "/images/invitations/savannah.jpg", description: "A field journal with an open savannah horizon, expedition-style details and a day mapped out in chapters.",
    palette: { background: "#edf1e8", surface: "#fffef8", ink: "#35452f", muted: "#63705a", accent: "#5f6b36" },
    accents: [{ name: "Acacia", color: "#5f6b36" }, { name: "Earth", color: "#945035" }, { name: "Distant blue", color: "#406878" }],
    eyebrow: "Our greatest adventure", subtitle: "Where the next chapter begins", replyHeading: "Be part of the adventure",
    sectionLabels: { our_story: "The journey here", timeline: "A day in good company" },
  },
  {
    key: "wedding-kitenge-modern", name: "Kitenge Modern", kind: "kitenge", category: EventTypeKey.WEDDING,
    image: "/images/invitations/wax-print.webp", description: "Vivid wax-print-inspired borders, confident modern lettering and a joyful rhythm of colour through every chapter.",
    palette: { background: "#fff1d3", surface: "#fffdf8", ink: "#224e4b", muted: "#5b6d60", accent: "#a63e2e" },
    accents: [{ name: "Coral", color: "#a63e2e" }, { name: "Teal", color: "#27625c" }, { name: "Saffron", color: "#80611c" }],
    eyebrow: "Karibu to our celebration", subtitle: "Two hearts. All our favourite people.", replyHeading: "The celebration starts with you",
    sectionLabels: { event_details: "Together is everything", our_story: "Our story, in full colour", timeline: "Let the celebration begin" },
  },
  {
    key: "wedding-afro-luxury", name: "Afro-Luxury", kind: "woven", category: EventTypeKey.WEDDING,
    image: "/images/invitations/woven-brass.webp", description: "A contemporary woven-brass composition with sculptural typography and bold, gallery-like story chapters.",
    palette: { background: "#eeeede", surface: "#fffef7", ink: "#34382f", muted: "#65695b", accent: "#78632d" },
    accents: [{ name: "Brass", color: "#78632d" }, { name: "Jade", color: "#3f6751" }, { name: "Wine", color: "#853e51" }],
    eyebrow: "A celebration of us", subtitle: "Rooted in love. Looking to forever.", replyHeading: "Your presence is part of our story",
    sectionLabels: { our_story: "The life we're weaving", timeline: "The shape of our day" },
  },
  {
    key: "wedding-burgundy-luxury", name: "Burgundy Luxury", kind: "burgundy", category: EventTypeKey.WEDDING,
    image: "/images/invitations/peonies.jpg", description: "A dramatic wine-red overture with romantic florals, flowing names and a reception programme in fine rules.",
    palette: { background: "#f8edef", surface: "#fffbfa", ink: "#542b3c", muted: "#7b5d6a", accent: "#8b354e" },
    accents: [{ name: "Burgundy", color: "#8b354e" }, { name: "Antique gold", color: "#80612d" }, { name: "Plum", color: "#6d4c7d" }],
    eyebrow: "An evening for love", subtitle: "With full hearts, we invite you to celebrate", replyHeading: "An evening made complete by you",
    sectionLabels: { event_details: "The invitation", timeline: "From the first toast" },
  },
  {
    key: "wedding-black-and-gold", name: "Black & Gold", kind: "nocturne", category: EventTypeKey.WEDDING,
    image: "/images/invitations/coupes.jpg", description: "An Art Deco evening invitation with stepped gold rules, champagne photography and a polished gala programme.",
    palette: { background: "#f5f3e9", surface: "#fffef9", ink: "#33332d", muted: "#68685e", accent: "#79612a" },
    accents: [{ name: "Gold leaf", color: "#79612a" }, { name: "Onyx", color: "#45483f" }, { name: "Garnet", color: "#8b3e4f" }],
    eyebrow: "The pleasure of your company", subtitle: "A beautiful beginning. An unforgettable evening.", replyHeading: "Kindly join our celebration",
    sectionLabels: { event_details: "An occasion to remember", timeline: "The evening unfolds" },
  },
  {
    key: "wedding-rustic-wood", name: "Rustic Wood", kind: "timber", category: EventTypeKey.WEDDING,
    image: "/images/invitations/timber.jpg", description: "A timber-framed gathering with generous lettering, stitched details and a warm, communal wedding programme.",
    palette: { background: "#edf2eb", surface: "#fffdf6", ink: "#414c35", muted: "#69715e", accent: "#697444" },
    accents: [{ name: "Olive", color: "#697444" }, { name: "Clay", color: "#98543b" }, { name: "Berry", color: "#89485f" }],
    eyebrow: "Good company. A beautiful beginning.", subtitle: "Gather close, stay a little longer", replyHeading: "There's a place for you here",
    sectionLabels: { event_details: "Gather with us", our_story: "The little things that brought us here", timeline: "Around our table" },
  },
  {
    key: "wedding-emerald-green", name: "Emerald Green", kind: "emerald", category: EventTypeKey.WEDDING,
    image: "/images/invitations/palms.jpg", description: "A conservatory invitation with sweeping names, botanical windows and a columned wedding programme.",
    palette: { background: "#edf3ef", surface: "#fffef9", ink: "#243f33", muted: "#53675b", accent: "#376448" },
    accents: [{ name: "Emerald", color: "#376448" }, { name: "Antique brass", color: "#80652d" }, { name: "Rosewood", color: "#8a4559" }],
    eyebrow: "With love, we invite you", subtitle: "A lifetime of ordinary magic begins here", replyHeading: "Our day would not be the same without you",
    sectionLabels: { event_details: "Together, at last", our_story: "How love took root", timeline: "A day to remember" },
  },
  {
    key: "wedding-royal-blue-and-gold", name: "Royal Blue & Gold", kind: "porcelain", category: EventTypeKey.WEDDING,
    image: "/images/invitations/porcelain-botanical.webp", description: "Blue-and-white porcelain florals, a gilded masthead and formal, numbered wedding chapters.",
    palette: { background: "#edf1fa", surface: "#fffefa", ink: "#253c6b", muted: "#596784", accent: "#806329" },
    accents: [{ name: "Gilt", color: "#806329" }, { name: "Royal blue", color: "#31518e" }, { name: "Mulberry", color: "#854761" }],
    eyebrow: "The wedding celebration of", subtitle: "With our families, and with all our hearts", replyHeading: "We request the pleasure of your company",
    sectionLabels: { event_details: "You are warmly invited", timeline: "The wedding programme" },
  },
  {
    key: "wedding-boho-pampas", name: "Boho Pampas", kind: "pampas", category: EventTypeKey.WEDDING,
    image: "/images/invitations/pampas.webp", description: "Airy dried botanicals, handwritten-feeling names and soft, open chapters for a free-spirited celebration.",
    palette: { background: "#f8eef0", surface: "#fffcf8", ink: "#4b4147", muted: "#76666e", accent: "#855568" },
    accents: [{ name: "Dried rose", color: "#855568" }, { name: "Eucalyptus", color: "#506958" }, { name: "Clay", color: "#97523d" }],
    eyebrow: "Wild hearts, one beautiful day", subtitle: "Just us, our favourite people, and a little forever", replyHeading: "We'd love to celebrate with you",
    sectionLabels: { event_details: "A day that feels like us", our_story: "The way we found each other", timeline: "Let the day unfold" },
  },
  {
    key: "wedding-white-and-gold", name: "White & Gold", kind: "gilded", category: EventTypeKey.WEDDING,
    image: "/images/invitations/garden-sprig.png", description: "Engraved initials, delicate botanical flourishes and a gold-ruled wedding programme.",
    palette: { background: "#f7f7f2", surface: "#ffffff", ink: "#34382f", muted: "#62685c", accent: "#78602b" },
    accents: [{ name: "Old gold", color: "#78602b" }, { name: "Laurel", color: "#426149" }, { name: "Claret", color: "#823d50" }],
    eyebrow: "Together with our families", subtitle: "The beginning of our always", replyHeading: "The honour of your company",
    sectionLabels: { our_story: "The story so far", timeline: "Order of the day" },
  },
  {
    key: "wedding-ivory-and-champagne", name: "Ivory & Champagne", kind: "champagne", category: EventTypeKey.WEDDING,
    image: "/images/invitations/coupes.jpg", description: "A reception journal with flowing names, champagne photography and beautifully paced story chapters.",
    palette: { background: "#f7f5ee", surface: "#fffefa", ink: "#343a30", muted: "#626959", accent: "#706137" },
    accents: [{ name: "Champagne", color: "#706137" }, { name: "Vine", color: "#42644b" }, { name: "Rosewood", color: "#884555" }],
    eyebrow: "A day for love", subtitle: "And an evening to remember", replyHeading: "A place at our table",
    sectionLabels: { event_details: "An invitation to celebrate", timeline: "From vows to the last dance" },
  },
  {
    key: "birthday-cocktail-party", name: "Cocktail Party", kind: "cocktail", category: EventTypeKey.BIRTHDAY,
    sampleTitle: "Nia's cocktail party",
    image: "/images/invitations/aperitivo.png", description: "A vermouth-bar menu with painted cocktails, flowing lettering and a perforated reply slip.",
    palette: { background: "#faeeee", surface: "#fffaf7", ink: "#4e242f", muted: "#775965", accent: "#9c304b" },
    accents: [{ name: "Cherry", color: "#9c304b" }, { name: "Olive", color: "#526037" }, { name: "Aubergine", color: "#694b75" }],
    eyebrow: "A birthday, with a twist", subtitle: "Good company is always in season", replyHeading: "Put your name on the list",
    sectionLabels: { event_details: "On the menu", venue_map: "At the bar", countdown: "Until the first cheers" },
  },
  {
    key: "birthday-cheers-to-40", name: "Cheers to 40", kind: "forty", category: EventTypeKey.BIRTHDAY,
    sampleTitle: "Nia turns 40",
    image: "/images/invitations/coupes.jpg", description: "A bold milestone poster with oversized birthday lettering, cut-paper photography and celebratory ticket details.",
    palette: { background: "#eaf1ee", surface: "#ffffff", ink: "#203f37", muted: "#586c63", accent: "#315f50" },
    accents: [{ name: "Bottle green", color: "#315f50" }, { name: "Cherry red", color: "#a33348" }, { name: "Cobalt", color: "#365999" }],
    eyebrow: "Here's to the good years", subtitle: "The best stories are still ahead", replyHeading: "Here's to being together",
    sectionLabels: { event_details: "Here's to the next chapter", venue_map: "The place to be", countdown: "Let the good times begin" },
  },
  {
    key: "baby-shower-floral-garden", name: "Floral Garden", kind: "bloom", category: EventTypeKey.BABY_SHOWER,
    image: "/images/invitations/garden-sprig.png", description: "A vintage seed-packet invitation with botanical specimens, double rules and wishes for a growing family.",
    palette: { background: "#eef3e9", surface: "#fffdf6", ink: "#374e39", muted: "#63705b", accent: "#81475e" },
    accents: [{ name: "Sweet pea", color: "#81475e" }, { name: "Leaf", color: "#436342" }, { name: "Forget-me-not", color: "#3b6385" }],
    eyebrow: "A little love is growing", subtitle: "Gather around a beautiful beginning", replyHeading: "Room for you in our garden",
    sectionLabels: { event_details: "Growing together", venue_map: "Where we'll gather", countdown: "A little closer, every day" },
  },
  {
    key: "baby-shower-busy-bee", name: "Busy Bee", kind: "honey", category: EventTypeKey.BABY_SHOWER,
    image: "/images/invitations/honey-garden.png", description: "A hand-painted honey garden with striped stationery, warm yellow chapters and a sweet little reply.",
    palette: { background: "#fff5c9", surface: "#fffef7", ink: "#34452e", muted: "#626e52", accent: "#53663b" },
    accents: [{ name: "Clover", color: "#53663b" }, { name: "Cornflower", color: "#3c628b" }, { name: "Honey", color: "#84601d" }],
    eyebrow: "Sweet as can bee", subtitle: "A little honey is on the way", replyHeading: "Will you bee there?",
    sectionLabels: { event_details: "Something sweet to celebrate", venue_map: "Meet us at the hive", countdown: "Counting down to a sweet afternoon" },
  },
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
