import { isSignedIn } from "@/lib/api";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const signedIn = await isSignedIn();
  return <SiteHeaderClient signedIn={signedIn} />;
}
