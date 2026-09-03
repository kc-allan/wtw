/**
 * Minimal RFC 4180 writer. Hosts open these in Excel and Google Sheets, so
 * every field is quoted — that is what stops a name containing a comma, a
 * newline or a quote from shifting the columns.
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: (keyof T & string)[],
): string {
  const lines = [columns.map(escape).join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => escape(row[column])).join(','));
  }
  // Excel needs CRLF to treat the file as one row per line on every platform.
  return `${lines.join('\r\n')}\r\n`;
}

/** Renders any cell value as text, without `[object Object]` reaching a host. */
export function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  return '';
}

function escape(value: unknown): string {
  return `"${stringifyCell(value).replace(/"/g, '""')}"`;
}
