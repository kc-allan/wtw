import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StepStrip } from "../../_components/step-strip";
import { DraftPreview } from "../../_components/draft-preview";
import { StepColumns } from "../../_components/step-columns";
import { CredentialsForm } from "@/app/_components/credentials-form";
import { signIn, signUp } from "@/lib/auth-actions";
import { createSteps, stepAfter } from "@/lib/create-flow";
import { draftEventTitle, draftHostNames, readDraft } from "@/lib/create-draft";
import { googleClientId } from "@/lib/google-oauth";
import { readAccessToken } from "@/lib/session";

export const metadata: Metadata = { title: "Sign up — Worth the Wait" };

export default async function AccountStepPage({ searchParams }: PageProps<"/create/account">) {
  const { mode } = await searchParams;
  const [draft, accessToken, clientId] = await Promise.all([
    readDraft(),
    readAccessToken(),
    googleClientId(),
  ]);

  if (!draft) redirect("/create");
  // Nothing to ask someone who is already signed in.
  if (accessToken) {
    const next = stepAfter(draft.typeKey, true, "account");
    redirect(next ? next.href : "/create");
  }

  const steps = createSteps(draft.typeKey, false);
  const back = steps[steps.findIndex((step) => step.id === "account") - 1];
  const isLogin = mode === "login";

  // Coming back here signed in sends them straight on to the next question.
  const next = "/create/account";

  return (
    <main>
      <StepStrip steps={steps} currentId="account" backHref={back?.href ?? "/create"} />

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
          {isLogin ? "Login" : "Sign up"}
        </h1>
        <p className="mt-2 max-w-[640px] text-base text-ink/80">
          {isLogin
            ? "You already have an account. Log in to continue your planning."
            : "One account for every celebration you'll ever host. This one, and the next one."}
        </p>

        <div className="mt-8">
          <CredentialsForm
            mode={isLogin ? "login" : "register"}
            action={isLogin ? signIn : signUp}
            submitLabel={isLogin ? "Log in" : "Sign up"}
            next={next}
            googleHref={
              clientId
                ? `/auth/google/start?next=${encodeURIComponent(next)}`
                : undefined
            }
            footer={
              isLogin
                ? {
                    prompt: "New here?",
                    label: "Create an account",
                    href: "/create/account",
                  }
                : {
                    prompt: "Already have an account?",
                    label: "Log in",
                    href: "/create/account?mode=login",
                  }
            }
          />
        </div>
      </StepColumns>
    </main>
  );
}
