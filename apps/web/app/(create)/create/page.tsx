import type { Metadata } from "next";
import { EventTypeKey } from "@wtw/shared";
import { StepStrip } from "../_components/step-strip";
import { StepColumns } from "../_components/step-columns";
import { CreateHero } from "./create-hero";
import { EventBasicsForm } from "./event-basics-form";
import { createSteps } from "@/lib/create-flow";
import { readDraft } from "@/lib/create-draft";
import { readAccessToken } from "@/lib/session";
import { api } from "@/lib/api";
import type { Theme } from "@/lib/types";

export const metadata: Metadata = { title: "What are we celebrating? — Worth the Wait" };

export default async function EventTypePage({ searchParams }: PageProps<"/create">) {
  const { template, error } = await searchParams;
  const [draft, accessToken, selectedTheme] = await Promise.all([
    readDraft(),
    readAccessToken(),
    typeof template === "string"
      ? api<Theme>(`/themes/${template}`, { auth: false, revalidate: 3600 }).catch(() => null)
      : null,
  ]);

  const steps = createSteps(
    draft?.typeKey ?? selectedTheme?.eventTypeKey ?? EventTypeKey.WEDDING,
    accessToken !== undefined,
  );

  return (
    <main>
      <StepStrip steps={steps} currentId="type" backHref="/" />

      <StepColumns aside={<CreateHero />}>
        <h1 className="text-3xl font-semibold text-black sm:text-4xl">
          What are we celebrating?
        </h1>
        <p className="mt-2 max-w-[640px] text-base text-ink/70">
          This sets up the right invitation tools for your celebration.
        </p>

        <EventBasicsForm
          draft={draft}
          themeKey={selectedTheme?.key}
          initialType={selectedTheme?.eventTypeKey}
          creationError={typeof error === "string"}
        />
      </StepColumns>
    </main>
  );
}
