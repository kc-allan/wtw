import Link from "next/link";
import type { TemplateCard as TemplateCardData } from "@/app/_data/landing";
import { designCopy } from "@/app/_data/invitation-copy";

const themes: Record<
  TemplateCardData["theme"],
  { surface: string; text: string; rule: string }
> = {
  pine: {
    surface: "bg-pine",
    text: "text-sand",
    rule: "bg-sand",
  },
  gradient: {
    surface:
      "bg-[linear-gradient(141.054deg,#b8472a_0%,#d38324_41.197%,#0e3d3e_100%)]",
    text: "text-sand",
    rule: "bg-sand",
  },
  ivory: {
    surface: "bg-ivory",
    text: "text-clay",
    rule: "bg-clay",
  },
  boho: {
    surface: "bg-ivory",
    text: "text-bark",
    rule: "bg-bark",
  },
};

export function TemplateCard({ template }: { template: TemplateCardData }) {
  const theme = themes[template.theme];
  const copy = designCopy[template.id];

  return (
    <figure className="flex w-[328px] shrink-0 flex-col">
      <div
        className={`group relative flex h-[481px] w-full flex-col items-center justify-center overflow-hidden rounded-[10px] border border-chalk px-8 py-6 ${theme.surface} ${theme.text}`}
      >
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <p className="font-accent text-sm tracking-[0.02em]">
              {template.eyebrow}
            </p>
            <p className="font-serif text-2xl font-semibold tracking-[0.02em]">
              {template.names.map((name) => (
                <span key={name} className="block">
                  {name}
                </span>
              ))}
            </p>
          </div>
          <span aria-hidden className={`h-px w-[29px] ${theme.rule}`} />
          <p className="font-accent text-sm tracking-[0.02em]">{template.name}</p>
        </div>

        {/* Hover: the card dims and the action fades in over it. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 motion-reduce:transition-none">
          <Link
            href={`/create?template=${template.id}`}
            className="rounded-full bg-sand/90 px-4 py-[11px] text-sm font-medium text-forest outline-offset-2"
          >
            Personalise this invitation
            <span className="sr-only">: {template.name}</span>
          </Link>
        </div>
      </div>

      {copy ? (
        <figcaption className="mt-3 flex flex-col gap-1 text-left">
          <span className="text-sm tracking-[0.02em] text-gold">
            {copy.descriptors.join(" • ")}
          </span>
          <span className="text-sm tracking-[0.02em] text-ink/70">
            {copy.description}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
