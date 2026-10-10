import type { GalleryPhoto, ThemePalette } from "@/lib/types";

/**
 * Photos from the day. Most couples land here before there are any, so the
 * empty state carries the host's own note about when to come back rather than
 * an apology.
 */
export function MomentsSection({
  heading,
  lead,
  pendingNote,
  photos,
  palette,
}: {
  heading: string;
  lead?: string;
  pendingNote?: string;
  photos: GalleryPhoto[];
  palette: ThemePalette;
}) {
  return (
    <section
      id="moments"
      aria-labelledby="moments-heading"
      className="scroll-mt-20 px-6 py-12"
      style={{ backgroundColor: palette.surface, color: palette.ink }}
    >
      <div className="mx-auto w-full max-w-[960px]">
        <h2
          id="moments-heading"
          className="text-center font-serif text-section font-semibold"
          style={{ color: palette.ink }}
        >
          {heading}
        </h2>

        {lead ? (
          <p
            className="mx-auto mt-3 max-w-[640px] text-center text-base"
            style={{ color: palette.muted }}
          >
            {lead}
          </p>
        ) : null}

        {photos.length === 0 ? (
          <div
            className="mx-auto mt-8 flex max-w-[280px] flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center"
            style={{ borderColor: palette.accent }}
          >
            <PhotoIcon />
            <p className="text-sm" style={{ color: palette.muted }}>
              {pendingNote ?? "Photos will appear here after the celebration."}
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map((photo) => (
              <li key={photo.id} className="overflow-hidden rounded-xl">
                {/* Host uploads, served from our own media store. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.altText ?? photo.caption ?? ""}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                {photo.caption ? (
                  <p className="px-3 py-2 text-sm" style={{ color: palette.muted }}>
                    {photo.caption}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 opacity-70" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 17 5-5 4 4 2-2 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
