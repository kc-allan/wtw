import { templateFor } from "@/app/_data/templates";
import { formatEventDate, formatEventTime } from "@/lib/event-display";
import type { EventDetail, ThemePalette } from "@/lib/types";
import { nameLines } from "@/app/_components/invitation-card";

interface InvitationDownloadData {
  title: string;
  eyebrow: string;
  names: string[];
  dateLabel: string;
  timeLabel: string;
  placeLabel: string;
  link: string;
  palette: ThemePalette;
  themeName: string;
  isDraft: boolean;
}

const WIDTH = 1080;
const HEIGHT = 1500;

export function invitationDownloadData(event: EventDetail, link: string): InvitationDownloadData {
  const template = templateFor(event.theme?.key, event.theme?.group, event.typeKey);
  const dateLabel = formatEventDate(event.startsAt, event.timezone);
  const timeLabel = formatEventTime(event.startsAt, event.timezone);
  return {
    title: event.title,
    eyebrow: template.eyebrowCase === "upper" ? template.eyebrow.toUpperCase() : template.eyebrow,
    names: nameLines(event.hostNames, event.title),
    dateLabel,
    timeLabel,
    placeLabel: [event.venueName, event.city].filter(Boolean).join(", "),
    link,
    palette: event.theme?.palette ?? {
      background: "#0e3d3e",
      surface: "#ffffff",
      ink: "#f7f3ea",
      accent: "#c6a15b",
      muted: "#8e8578",
    },
    themeName: event.theme?.name ?? "Worth the Wait",
    isDraft: event.publishedAt === null,
  };
}

export function invitationSvg(data: InvitationDownloadData): string {
  const lines = wrapText(data.link, 38);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(data.title)} invitation">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${escapeXml(data.palette.surface)}"/>
  <rect x="70" y="70" width="940" height="1360" rx="36" fill="${escapeXml(data.palette.background)}"/>
  <rect x="110" y="110" width="860" height="1280" rx="28" fill="none" stroke="${escapeXml(data.palette.accent)}" stroke-width="3" opacity="0.72"/>
  ${data.isDraft ? `<text x="540" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${escapeXml(data.palette.accent)}" letter-spacing="4">DRAFT</text>` : ""}
  <text x="540" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="${escapeXml(data.palette.accent)}" letter-spacing="6">${escapeXml(data.eyebrow)}</text>
  ${data.names.map((line, index) => `<text x="540" y="${500 + index * 95}" text-anchor="middle" font-family="Georgia, serif" font-size="76" fill="${escapeXml(data.palette.ink)}">${escapeXml(line)}</text>`).join("\n  ")}
  <line x1="440" y1="760" x2="640" y2="760" stroke="${escapeXml(data.palette.accent)}" stroke-width="4"/>
  <text x="540" y="850" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="${escapeXml(data.palette.ink)}">${escapeXml(data.dateLabel)}</text>
  ${data.timeLabel ? `<text x="540" y="910" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="${escapeXml(data.palette.muted)}">${escapeXml(data.timeLabel)}</text>` : ""}
  ${data.placeLabel ? `<text x="540" y="980" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="${escapeXml(data.palette.muted)}">${escapeXml(data.placeLabel)}</text>` : ""}
  <rect x="170" y="1120" width="740" height="170" rx="24" fill="${escapeXml(data.palette.surface)}" opacity="0.94"/>
  <text x="540" y="1175" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${escapeXml(data.palette.background)}">RSVP and details</text>
  ${lines.map((line, index) => `<text x="540" y="${1230 + index * 34}" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${escapeXml(data.palette.background)}">${escapeXml(line)}</text>`).join("\n  ")}
  <text x="540" y="1360" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${escapeXml(data.palette.muted)}">Made with Worth the Wait</text>
</svg>`;
}

export function invitationPdf(data: InvitationDownloadData): Uint8Array {
  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const palette = data.palette;
  const textLines = [
    data.isDraft ? "DRAFT" : "",
    data.eyebrow,
    ...data.names,
    data.dateLabel,
    data.timeLabel,
    data.placeLabel,
    "RSVP and details",
    ...wrapText(data.link, 48),
    "Made with Worth the Wait",
  ].filter(Boolean);

  const content = [
    colourFill(palette.surface),
    `0 0 ${WIDTH} ${HEIGHT} re f`,
    colourFill(palette.background),
    `70 70 940 1360 re f`,
    colourStroke(palette.accent),
    "3 w 110 110 860 1280 re S",
    ...pdfText(textLines, palette),
  ].join("\n");

  const catalog = add("<< /Type /Catalog /Pages 2 0 R >>");
  const pages = add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  const page = add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${WIDTH} ${HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`);
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>");
  const stream = add(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);

  const chunks = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  for (const [index, body] of objects.entries()) {
    offsets.push(Buffer.byteLength(chunks.join(""), "utf8"));
    chunks.push(`${index + 1} 0 obj\n${body}\nendobj\n`);
  }
  const xrefOffset = Buffer.byteLength(chunks.join(""), "utf8");
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  for (const offset of offsets.slice(1)) {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  }
  chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  void page;
  void stream;
  return new TextEncoder().encode(chunks.join(""));
}

export function invitationFileName(event: EventDetail, extension: string): string {
  const base = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "invitation";
  return `${base}-invitation.${extension}`;
}

function pdfText(lines: string[], palette: ThemePalette): string[] {
  const y = [1320, 1190, 1040, 950, 770, 710, 650, 430, 380, 340, 180];
  return lines.slice(0, y.length).flatMap((line, index) => {
    const isName = index >= 2 && index <= 3;
    const size = isName ? 72 : index === 0 ? 24 : index === 1 ? 28 : 32;
    const font = isName ? "F2" : "F1";
    const colour = index === 0 || index === 1 ? palette.accent : index >= 7 ? palette.background : palette.ink;
    const textWidth = line.length * size * 0.45;
    return [
      colourFill(colour),
      `BT /${font} ${size} Tf ${Math.max(80, (WIDTH - textWidth) / 2).toFixed(1)} ${y[index]} Td (${escapePdf(line)}) Tj ET`,
    ];
  });
}

function wrapText(value: string, width: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const part of value.split(/([/?=&-])/)) {
    if ((current + part).length > width && current) {
      lines.push(current);
      current = part;
    } else {
      current += part;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function colourFill(hex: string): string {
  const [r, g, b] = rgb(hex);
  return `${r} ${g} ${b} rg`;
}

function colourStroke(hex: string): string {
  const [r, g, b] = rgb(hex);
  return `${r} ${g} ${b} RG`;
}

function rgb(hex: string): [string, string, string] {
  const value = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return ["0", "0", "0"];
  return [0, 2, 4].map((offset) =>
    (Number.parseInt(value.slice(offset, offset + 2), 16) / 255).toFixed(3),
  ) as [string, string, string];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapePdf(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
