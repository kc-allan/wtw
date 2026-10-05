function partMap(date: Date, timeZone: string): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function pad(value: string | number): string {
  return String(value).padStart(2, "0");
}

export function toDateInput(value: string | null, timeZone: string): string {
  if (!value) return "";
  const parts = partMap(new Date(value), timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function toTimeInput(value: string | null, timeZone: string): string {
  if (!value) return "";
  const parts = partMap(new Date(value), timeZone);
  return `${parts.hour}:${parts.minute}`;
}

export function toDateTimeLocalInput(value: string | null | undefined, timeZone: string): string {
  if (!value) return "";
  return `${toDateInput(value, timeZone)}T${toTimeInput(value, timeZone)}`;
}

export function wallTimeToUtcIso(
  date: string,
  time: string,
  timeZone: string,
): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match || !timeMatch) return null;

  const [, year, month, day] = match;
  const [, hour, minute] = timeMatch;
  const expected = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };

  let guess = Date.UTC(expected.year, expected.month - 1, expected.day, expected.hour, expected.minute, 0);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = partMap(new Date(guess), timeZone);
    const shownAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second ?? "0"),
    );
    const targetAsUtc = Date.UTC(
      expected.year,
      expected.month - 1,
      expected.day,
      expected.hour,
      expected.minute,
      0,
    );
    const delta = shownAsUtc - targetAsUtc;
    if (delta === 0) break;
    guess -= delta;
  }

  return new Date(guess).toISOString();
}

export function dateTimeLocalToUtcIso(value: string, timeZone: string): string | null {
  const [date, time] = value.split("T");
  if (!date || !time) return null;
  return wallTimeToUtcIso(date, time.slice(0, 5), timeZone);
}
