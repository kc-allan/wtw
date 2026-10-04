import type { ThemePalette } from "@/lib/types";

export interface PageSection {
  id: string;
  label: string;
}

/**
 * The strip of links across the top of an event page. It names only the
 * sections this host actually switched on, so a couple with no gift list never
 * shows an empty Registry tab.
 */
export function PageNav({
  sections,
  palette,
}: {
  sections: PageSection[];
  palette: ThemePalette;
}) {
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="This page"
      className="sticky top-0 z-30 w-full px-6 py-4 backdrop-blur"
      style={{ backgroundColor: `${palette.surface}e6` }}
    >
      <ul className="mx-auto flex max-w-[960px] flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-base transition-opacity hover:opacity-70"
              style={{ color: palette.ink }}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
