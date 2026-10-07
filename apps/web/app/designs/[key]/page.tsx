import { notFound } from "next/navigation";
import { INVITATION_DESIGNS } from "@/lib/invitation-designs";
import { DesignPreview } from "./preview";

export const metadata = { title: "Invitation designs | Worth the Wait", robots: { index: false } };

export default async function DesignPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const design = INVITATION_DESIGNS.find((entry) => entry.kind === key);
  if (!design) notFound();
  return <DesignPreview key={design.key} design={design} />;
}
