import type { ThemePalette } from "@/lib/types";
import { invitationDesign } from "@/lib/invitation-designs";

/**
 * How one theme's invitation is drawn. A template is a small set of choices
 * over the theme's own palette rather than a bespoke component per theme —
 * that is what lets a designed template and a seeded-but-undesigned one sit in
 * the same grid without one of them looking unfinished.
 */
export interface TemplateDefinition {
  /** Small caps line above the names, e.g. "THE WEDDING OF". */
  eyebrow: string;
  /** Whether the eyebrow is set in caps or as written. */
  eyebrowCase: "upper" | "sentence";
  /** What sits under the rule. */
  footer: "themeName" | "date" | "none";
  /** Names in the display serif, or in the sans for the modern sets. */
  nameFont: "serif" | "sans";
  nameCase: "title" | "upper";
  /**
   * Which palette role paints the card. A theme's `background` is the pale
   * paper its event page uses; the designed cards are mostly the saturated
   * `accent` instead, which is what gives the picker its range of colour.
   */
  surface: "background" | "accent";
  /** Replaces the flat surface; used by the gradient templates. */
  backgroundImage?: string;
  /**
   * Set alongside `backgroundImage`. A palette's ink is chosen to sit on its
   * own pale background, so painting a dark gradient over it would leave the
   * names unreadable; these override the two colours that carry text.
   */
  ink?: string;
  accent?: string;
}

const CLASSIC: TemplateDefinition = {
  eyebrow: "The wedding of",
  eyebrowCase: "upper",
  footer: "themeName",
  nameFont: "serif",
  nameCase: "title",
  surface: "accent",
};

const SAVE_THE_DATE: TemplateDefinition = {
  eyebrow: "Save the date",
  eyebrowCase: "upper",
  footer: "themeName",
  nameFont: "serif",
  nameCase: "upper",
  surface: "accent",
};

const DATED: TemplateDefinition = { ...CLASSIC, footer: "date" };

/**
 * The templates drawn in the design file. Everything else falls back to a
 * layout chosen from the theme's group, so all 120 seeded themes render.
 */
const TEMPLATES: Record<string, TemplateDefinition> = {
  "wedding-emerald-green": CLASSIC,
  "wedding-white-and-gold": { ...CLASSIC, surface: "background" },
  "wedding-black-tie": CLASSIC,
  "wedding-modern-monochrome": { ...DATED, surface: "background" },
  "wedding-royal-blue-and-gold": DATED,
  "wedding-safari-chic": DATED,
  "wedding-boho-pampas": { ...SAVE_THE_DATE, surface: "background" },
  "wedding-coastal-diani-and-lamu": SAVE_THE_DATE,
  "wedding-ivory-and-champagne": {
    eyebrow: "Together with their families",
    eyebrowCase: "sentence",
    footer: "themeName",
    nameFont: "serif",
    nameCase: "title",
    surface: "background",
  },
  "wedding-kitenge-modern": {
    eyebrow: "Karibu",
    eyebrowCase: "upper",
    footer: "themeName",
    nameFont: "serif",
    nameCase: "title",
    surface: "accent",
    backgroundImage:
      "linear-gradient(141.054deg, #b8472a 0%, #d38324 41.197%, #0e3d3e 100%)",
    ink: "#fff8f0",
    accent: "#f6e3cd",
  },
};

/** Group-level defaults for the themes no one has drawn a template for yet. */
const GROUP_DEFAULTS: Record<string, TemplateDefinition> = {
  Luxury: CLASSIC,
  "Classic and elegant": CLASSIC,
  "Nature inspired": SAVE_THE_DATE,
  "Kenyan inspired": SAVE_THE_DATE,
};

const EVENT_EYEBROWS: Record<string, string> = {
  wedding: "The wedding of",
  birthday: "Come celebrate",
  baby_shower: "A baby shower for",
  graduation: "Celebrating",
  anniversary: "Celebrating",
  bridal_shower: "A bridal shower for",
  corporate: "You are invited to",
};

export function templateFor(
  themeKey: string | null | undefined,
  group: string | null | undefined,
  eventTypeKey: string,
): TemplateDefinition {
  if (themeKey && TEMPLATES[themeKey]) {
    return TEMPLATES[themeKey];
  }
  if (group && GROUP_DEFAULTS[group]) {
    return { ...GROUP_DEFAULTS[group], eyebrow: EVENT_EYEBROWS[eventTypeKey] ?? "You're invited" };
  }
  return {
    ...CLASSIC,
    eyebrow: EVENT_EYEBROWS[eventTypeKey] ?? "You're invited",
  };
}

/** True when the theme has artwork of its own rather than the group fallback. */
export function hasDesignedTemplate(themeKey: string): boolean {
  return themeKey in TEMPLATES || invitationDesign(themeKey) !== undefined;
}

/** Sensible ink when a theme has no palette yet, so nothing renders invisible. */
export const FALLBACK_PALETTE: ThemePalette = {
  background: "#0e3d3e",
  surface: "#ffffff",
  ink: "#f7f3ea",
  accent: "#c6a15b",
  muted: "#8e8578",
};
