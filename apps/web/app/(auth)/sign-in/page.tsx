import type { Metadata } from "next";
import { CredentialsForm } from "@/app/_components/credentials-form";
import { signIn } from "@/lib/auth-actions";
import { googleClientId } from "@/lib/google-oauth";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Login — Worth the Wait" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next, error } = await searchParams;
  const destination = safeNext(next);
  const clientId = await googleClientId();

  return (
    <div className="w-full max-w-[594px]">
      <h1 className="text-3xl font-semibold text-black sm:text-4xl">Login</h1>
      <p className="mt-2 text-base text-ink/80">
        You already have an account. Log in to continue your planning.
      </p>

      {error === "google" ? (
        <p role="alert" className="mt-4 text-sm text-ember">
          That Google sign-in did not complete. Try again, or use your password.
        </p>
      ) : null}

      <div className="mt-8">
        <CredentialsForm
          mode="login"
          action={signIn}
          submitLabel="Log in"
          next={destination}
          googleHref={
            clientId
              ? `/auth/google/start?next=${encodeURIComponent(destination)}`
              : undefined
          }
          footer={{ prompt: "New here?", label: "Create an account", href: "/sign-up" }}
        />
      </div>
    </div>
  );
}
