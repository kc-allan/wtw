import { FALLBACK_PALETTE, templateFor } from "@/app/_data/templates";
import type { ThemePalette } from "@/lib/types";

export interface InvitationContent {
  /** One entry per line, so a long pair can break the way the design does. */
  names: string[];
  themeName: string;
  /** Rendered under the rule on the dated templates. */
  dateLabel?: string;
}

/**
 * The invitation itself. Everything visual comes from the theme's palette and
 * its template definition, so the same component serves the picker grid, the
 * live editor preview and the published page — one place to get it right.
 */
export function InvitationCard({
  themeKey,
  group,
  eventTypeKey,
  palette,
  content,
  className = "",
}: {
  themeKey: string | null;
  group: string | null;
  eventTypeKey: string;
  palette: ThemePalette | null;
  content: InvitationContent;
  className?: string;
}) {
  const template = templateFor(themeKey, group, eventTypeKey);
  const base = palette ?? FALLBACK_PALETTE;

  // Most palettes describe pale paper with dark ink, so a card asking for the
  // saturated `accent` has to invert: its ink becomes that pale background.
  // Themes whose background is already dark (Black & Gold, Afro-Luxury) are the
  // exception — they are the card colour, and inverting them twice would undo
  // the design. Deciding by luminance keeps all 120 seeded themes legible
  // without a second palette being authored for each.
  const wantsAccent = template.surface === "accent" || template.backgroundImage !== undefined;
  const paletteIsDark = isDark(base.background);
  const onAccent = wantsAccent && !paletteIsDark;

  const surface = onAccent ? base.accent : base.background;
  const colours = {
    surface,
    ink: template.ink ?? (onAccent ? base.background : base.ink),
    accent: template.accent ?? (onAccent ? base.background : base.accent),
  };
  const muteText = onAccent || paletteIsDark;

  const footer =
    template.footer === "themeName"
      ? content.themeName
      : template.footer === "date"
        ? content.dateLabel
        : undefined;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[10px] px-8 py-12 text-center ${className}`}
      style={{
        backgroundColor: colours.surface,
        backgroundImage: template.backgroundImage,
        color: colours.ink,
      }}
    >
      <p
        className={`text-sm tracking-[0.18em] ${
          template.eyebrowCase === "upper" ? "uppercase" : "font-serif tracking-normal"
        }`}
        style={{ color: colours.accent, opacity: muteText ? 0.8 : 1 }}
      >
        {template.eyebrow}
      </p>

      <p
        className={`mt-4 flex flex-col gap-1 ${
          template.nameFont === "serif" ? "font-serif text-3xl" : "text-2xl font-medium"
        } ${template.nameCase === "upper" ? "uppercase tracking-[0.06em]" : ""}`}
      >
        {content.names.map((line, index) => (
          // Position is the identity here: the same name can legitimately
          // appear on more than one line of a card.
          <span key={`${index}-${line}`}>{line}</span>
        ))}
      </p>

      <span
        aria-hidden
        className="mt-5 h-px w-12"
        style={{ backgroundColor: colours.accent, opacity: muteText ? 0.6 : 1 }}
      />

      {footer ? (
        <p
          className="mt-5 text-sm tracking-[0.02em]"
          style={{ color: colours.ink, opacity: muteText ? 0.85 : 1 }}
        >
          {footer}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Relative luminance of a `#rrggbb` colour, using the sRGB coefficients. Only
 * needs to answer "is this closer to black or white", so the cheap gamma-free
 * form is enough.
 */
function isDark(hex: string): boolean {
  const value = hex.replace("#", "");
  if (value.length !== 6) {
    return false;
  }
  const [r, g, b] = [0, 2, 4].map((offset) =>
    Number.parseInt(value.slice(offset, offset + 2), 16),
  );
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
}

/**
 * Splits host names across lines the way the templates do: a pair sits on one
 * line when it is short, and breaks at the ampersand when it is not.
 */
export function nameLines(hostNames: string[], fallback: string): string[] {
  if (hostNames.length === 0) {
    return [fallback];
  }
  const joined = hostNames.join(" & ");
  if (joined.length <= 18 || hostNames.length < 2) {
    return [joined];
  }
  return [hostNames[0], `& ${hostNames.slice(1).join(" & ")}`];
}
