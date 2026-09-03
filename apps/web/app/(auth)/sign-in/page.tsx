import type { Metadata } from "next";
import { signIn } from "@/lib/auth-actions";
import { AuthForm } from "../_auth-form";

export const metadata: Metadata = { title: "Sign in — Worth the Wait" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next } = await searchParams;

  return (
    <AuthForm
      action={signIn}
      title="Welcome back"
      lead="Pick up where you left off."
      submitLabel="Sign in"
      next={typeof next === "string" ? next : "/events"}
      footer={{ prompt: "New here?", label: "Create an account", href: "/sign-up" }}
    />
  );
}
