import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StepStrip } from "../../_components/step-strip";
import { HostRoleForm } from "./host-role-form";
import { createSteps } from "@/lib/create-flow";
import { readDraft } from "@/lib/create-draft";
import { readAccessToken } from "@/lib/session";

export const metadata: Metadata = { title: "Who are you? — Worth the Wait" };

export default async function HostRolePage() {
  const [draft, accessToken] = await Promise.all([readDraft(), readAccessToken()]);
  if (!draft) redirect("/create");

  const steps = createSteps(draft.typeKey, accessToken !== undefined);

  return (
    <main>
      <StepStrip steps={steps} currentId="role" backHref="/create" />

      <h1 className="mt-10 text-center text-3xl font-semibold text-black sm:text-4xl">
        Who are you?
      </h1>

      <HostRoleForm selected={draft.hostRole} />
    </main>
  );
}
