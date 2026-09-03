import type { Metadata } from "next";
import { CredentialsForm } from "@/app/_components/credentials-form";
import { signUp } from "@/lib/auth-actions";
import { googleClientId } from "@/lib/google-oauth";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign up — Worth the Wait" };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const { next } = await searchParams;
  const destination = safeNext(next, "/create");
  const clientId = await googleClientId();

  return (
    <div className="w-full max-w-[594px]">
      <h1 className="text-3xl font-semibold text-black sm:text-4xl">Sign up</h1>
      <p className="mt-2 text-base text-ink/80">
        One account for every celebration you&rsquo;ll ever host. This one, and the next one.
      </p>

      <div className="mt-8">
        <CredentialsForm
          mode="register"
          action={signUp}
          submitLabel="Sign up"
          next={destination}
          googleHref={
            clientId
              ? `/auth/google/start?next=${encodeURIComponent(destination)}`
              : undefined
          }
          footer={{ prompt: "Already have an account?", label: "Log in", href: "/sign-in" }}
        />
      </div>
    </div>
  );
}
