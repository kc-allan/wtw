import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { PublicEvent } from "@/lib/types";
import { nameLines } from "@/app/_components/invitation-card";
import { FALLBACK_PALETTE } from "@/app/_data/templates";
import { JoinForm } from "./join-form";

export const metadata: Metadata = {
  title: "Add your details — Worth the Wait",
  robots: { index: false, follow: false },
};

export default async function JoinGuestListPage({ params }: PageProps<"/e/[slug]/join">) {
  const { slug } = await params;

  let data: PublicEvent;
  try {
    data = await api<PublicEvent>(`/e/${slug}`, { auth: false, revalidate: 60 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) notFound();
    notFound();
  }

  const { event } = data;
  const palette = event.theme?.palette ?? FALLBACK_PALETTE;
  const names = nameLines(event.hostNames, event.title).join(" & ");

  return (
    <main
      className="grid min-h-dvh place-items-center px-6 py-12"
      style={{ backgroundColor: palette.surface, color: palette.ink }}
    >
      <div className="w-full max-w-[460px]">
        <h1 className="text-center font-serif text-section font-semibold">{names}</h1>
        <p className="mt-2 text-center text-base" style={{ color: palette.muted }}>
          Leave your details and the hosts will send your invitation here.
        </p>

        <JoinForm slug={slug} palette={palette} />
      </div>
    </main>
  );
}
