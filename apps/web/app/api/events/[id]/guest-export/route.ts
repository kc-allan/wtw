import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/env";
import { readAccessToken } from "@/lib/session";

/**
 * Streams the guest CSV out of the API. The browser cannot call the API
 * directly — it has no token, by design — so the download is proxied here with
 * the session attached and the filename preserved.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await readAccessToken();

  if (!token) {
    return NextResponse.json({ message: "Please sign in again" }, { status: 401 });
  }

  // Only the filters the guest list itself offers are forwarded.
  const allowed = new URLSearchParams();
  for (const key of ["status", "groupLabel", "search"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) allowed.set(key, value);
  }

  const upstream = await fetch(`${API_URL}/events/${id}/guests/export.csv?${allowed}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok) {
    return NextResponse.json({ message: "Could not build that export" }, { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ?? 'attachment; filename="guest-list.csv"',
    },
  });
}
