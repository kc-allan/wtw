import type { Metadata } from "next";
import { signUp } from "@/lib/auth-actions";
import { AuthForm } from "../_auth-form";

export const metadata: Metadata = { title: "Create an account — Worth the Wait" };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const { next } = await searchParams;

  return (
    <AuthForm
      action={signUp}
      title="Create your account"
      lead="No credit card to start. You only pay when you publish."
      submitLabel="Create account"
      next={typeof next === "string" ? next : "/events/new"}
      showName
      footer={{ prompt: "Already have an account?", label: "Sign in", href: "/sign-in" }}
    />
  );
}
