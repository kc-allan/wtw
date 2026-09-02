export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    // Strip combining marks left by the NFKD decomposition above.
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Appends -2, -3 … until `taken` reports the candidate is free. The caller
 * supplies the lookup so this works inside a transaction.
 */
export async function uniqueSlug(
  base: string,
  taken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = base || 'event';
  if (!(await taken(root))) {
    return root;
  }
  for (let suffix = 2; suffix < 500; suffix += 1) {
    const candidate = `${root}-${suffix}`;
    if (!(await taken(candidate))) {
      return candidate;
    }
  }
  return `${root}-${Date.now()}`;
}
