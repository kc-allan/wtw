import { Wordmark } from "@/app/_components/wordmark";

/** A quiet, single-column shell: nothing to click away to but the wordmark. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="w-full px-6 py-6">
        <Wordmark />
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pt-4 pb-16">
        {children}
      </main>
    </div>
  );
}
