import type { Metadata } from "next";
import { EventTypeKey } from "@wtw/shared";
import { StepStrip } from "../_components/step-strip";
import { StepColumns } from "../_components/step-columns";
import { CreateHero } from "./create-hero";
import { EventBasicsForm } from "./event-basics-form";
import { createSteps } from "@/lib/create-flow";
import { readDraft } from "@/lib/create-draft";
import { readAccessToken } from "@/lib/session";

export const metadata: Metadata = { title: "What are we celebrating? — Worth the Wait" };

export default async function EventTypePage({ searchParams }: PageProps<"/create">) {
  const { template } = await searchParams;
  const [draft, accessToken] = await Promise.all([readDraft(), readAccessToken()]);

  // Before a type is chosen the strip cannot know which questions follow, so
  // it shows the wedding path — the longest, and the one most people take.
  const steps = createSteps(draft?.typeKey ?? EventTypeKey.WEDDING, accessToken !== undefined);

  return (
    <main>
      <StepStrip steps={steps} currentId="type" backHref="/" />

      <StepColumns aside={<CreateHero />}>
        <h1 className="text-3xl font-semibold text-black sm:text-4xl">
          What are we celebrating?
        </h1>
        <p className="mt-2 max-w-[640px] text-base text-ink/70">
          This decides which tools switch on, you can change it later.
        </p>

        <EventBasicsForm
          draft={draft}
          themeKey={typeof template === "string" ? template : undefined}
        />
      </StepColumns>
    </main>
  );
}
