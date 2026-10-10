"use client";

import Link from "next/link";
import { useState } from "react";
import { EventPageView } from "@/app/e/[slug]/event-page-view";
import { DESIGN_CATEGORIES, INVITATION_DESIGNS, type InvitationDesign } from "@/lib/invitation-designs";
import { invitationSample } from "@/lib/invitation-samples";

export function DesignPreview({ design }: { design: InvitationDesign }) {
  const [accent, setAccent] = useState(design.palette.accent);
  const { event, modules } = invitationSample(design, accent);
  return <>
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule bg-white px-5 py-3 text-sm">
      <div className="flex min-w-0 flex-wrap items-center gap-4">
        <Link href={`/invitations?type=${design.category}`} className="text-forest underline underline-offset-4">All invitations</Link>
        <label className="flex min-w-0 flex-wrap items-center gap-3 text-muted">
          Sample invitation
          <select value={design.kind} onChange={(event) => window.location.assign(`/designs/${event.target.value}`)}
            className="max-w-full rounded border border-rule bg-white px-3 py-2 text-ink" aria-label="Design sample">
            {DESIGN_CATEGORIES.map((category) => <optgroup key={category.key} label={category.label}>
              {INVITATION_DESIGNS.filter((entry) => entry.category === category.key).map((entry) => <option key={entry.key} value={entry.kind}>{entry.name}</option>)}
            </optgroup>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div role="group" aria-label="Accent color" className="flex items-center gap-2">
          {design.accents.map((option) => <button key={option.color} type="button" title={option.name} aria-label={option.name} aria-pressed={accent === option.color}
            onClick={() => setAccent(option.color)} className={`size-9 rounded-full border-4 border-white ${accent === option.color ? "outline-2 outline-forest" : "outline-1 outline-rule"}`} style={{ backgroundColor: option.color }} />)}
        </div>
        <Link href={`/create?template=${encodeURIComponent(design.key)}&accent=${encodeURIComponent(accent)}`} className="rounded bg-forest px-4 py-2.5 text-white">Use this design</Link>
      </div>
    </div>
    <main><EventPageView slug="sample" event={event} modules={modules} ceremonies={[]} guest={null} registry={null} photos={null} games={[]} previewMode /></main>
  </>;
}
