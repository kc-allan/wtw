import Link from "next/link";
import type { TemplateCard as TemplateCardData } from "@/app/_data/landing";
import { designCopy } from "@/app/_data/invitation-copy";
import { invitationDesign } from "@/lib/invitation-designs";
import { InvitationHero } from "./invitation-hero";

export function TemplateCard({ template }: { template: TemplateCardData }) {
  const design = invitationDesign(template.id);
  if (!design) return null;

  const copy = designCopy[template.id];
  const names = template.names.flatMap((name) => name.split("&").map((part) => part.trim()).filter(Boolean));

  return (
    <figure className="flex w-[328px] shrink-0 flex-col">
      <div
        className="group relative h-[481px] w-full overflow-hidden rounded-[10px] border border-chalk bg-white"
      >
        <InvitationHero
          design={design}
          names={names}
          title={template.names.join(" ")}
          date="Saturday, 16 May 2026"
          venue="Nairobi"
          accent={design.palette.accent}
          compact
        />

        {/* The preview remains visible until a visitor focuses or hovers to act. */}
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
          <span className="text-sm font-medium text-ink">{template.name}</span>
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
