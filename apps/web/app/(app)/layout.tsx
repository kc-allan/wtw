import { api } from "@/lib/api";
import type { CurrentUser } from "@/lib/types";
import { AppHeader } from "./_components/app-header";

/**
 * The host area. Proxy has already guaranteed a session by the time this
 * renders, so a failure here means the token was rejected rather than absent
 * — the header simply drops the account menu rather than the page erroring.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await api<CurrentUser>("/auth/me").catch(() => null);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <AppHeader user={user} />
      {children}
    </div>
  );
}
