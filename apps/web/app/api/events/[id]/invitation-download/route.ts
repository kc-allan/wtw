import { NextResponse, type NextRequest } from "next/server";
import { api } from "@/lib/api";
import { SITE_ORIGIN } from "@/lib/site";
import type { EventDetail } from "@/lib/types";
import {
  invitationDownloadData,
  invitationFileName,
  invitationPdf,
  invitationSvg,
} from "@/lib/invitation-download";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") === "pdf" ? "pdf" : "svg";
  const event = await api<EventDetail>(`/events/${id}`).catch(() => null);

  if (!event) {
    return NextResponse.json({ message: "Invitation not found" }, { status: 404 });
  }

  const data = invitationDownloadData(event, `${SITE_ORIGIN}/e/${event.slug}`);

  if (format === "pdf") {
    const pdf = invitationPdf(data);
    const body = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invitationFileName(event, "pdf")}"`,
      },
    });
  }

  return new NextResponse(invitationSvg(data), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${invitationFileName(event, "svg")}"`,
    },
  });
}
