import { NextResponse } from "next/server";
import { API_URL } from "@/lib/env";
import { readAccessToken } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await readAccessToken();

  if (!token) {
    return NextResponse.json({ message: "Please sign in again" }, { status: 401 });
  }

  const upstream = await fetch(`${API_URL}/events/${id}/games/responses.csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok) {
    return NextResponse.json({ message: "Could not build that export" }, { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ?? 'attachment; filename="game-responses.csv"',
    },
  });
}
