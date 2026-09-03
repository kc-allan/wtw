import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CEREMONIES, CEREMONY_ORDER, CreateStepKey, typeAsksCreateStep } from "@wtw/shared";
import { StepStrip } from "../../_components/step-strip";
import { DraftPreview } from "../../_components/draft-preview";
import { StepColumns } from "../../_components/step-columns";
import { saveCeremonies } from "@/lib/create-actions";
import { createSteps } from "@/lib/create-flow";
import { draftEventTitle, draftHostNames, readDraft } from "@/lib/create-draft";
import { readAccessToken } from "@/lib/session";

export const metadata: Metadata = { title: "Which ceremonies are you having? — Worth the Wait" };

export default async function CeremoniesPage() {
  const [draft, accessToken] = await Promise.all([readDraft(), readAccessToken()]);
  if (!draft) redirect("/create");
  if (!typeAsksCreateStep(draft.typeKey, CreateStepKey.CEREMONIES)) redirect("/create");

  const steps = createSteps(draft.typeKey, accessToken !== undefined);
  const back = steps[steps.findIndex((step) => step.id === "ceremonies") - 1];
  const chosen = new Set(draft.ceremonies ?? []);

  return (
    <main>
      <StepStrip steps={steps} currentId="ceremonies" backHref={back?.href ?? "/create"} />

      <StepColumns
        aside={
          <DraftPreview
            typeKey={draft.typeKey}
            hostNames={draftHostNames(draft)}
            title={draftEventTitle(draft)}
          />
        }
      >
        <h1 className="text-3xl font-semibold text-black sm:text-4xl">
          Which ceremonies are you having?
        </h1>
        <p className="mt-3 max-w-[640px] text-base text-ink/80">
          Select every ceremony you&rsquo;re planning. You can change this later, and each
          gets its own details and design.
        </p>

        <form action={saveCeremonies} className="mt-8 rounded-2xl bg-white p-6 sm:p-8">
          <fieldset>
            <legend className="sr-only">Ceremonies</legend>

            <ul className="flex flex-col">
              {CEREMONY_ORDER.map((key, index) => {
                const ceremony = CEREMONIES[key];
                return (
                  <li
                    key={key}
                    className={index > 0 ? "border-t border-rule/40" : undefined}
                  >
                    <label className="flex cursor-pointer items-center gap-3 py-4">
                      <input
                        type="checkbox"
                        name="ceremonies"
                        value={key}
                        defaultChecked={chosen.has(key)}
                        className="h-4 w-4 shrink-0 accent-forest"
                      />
                      <span className="text-base text-black">
                        {ceremony.name}
                        {ceremony.alsoKnownAs.length > 0 ? (
                          <span className="text-sm text-muted">
                            {" "}
                            ({ceremony.alsoKnownAs.join(" · ")})
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-forest px-6 py-4 text-base font-medium text-bright transition-colors hover:bg-forest-deep"
          >
            Continue
          </button>
        </form>
      </StepColumns>
    </main>
  );
}
