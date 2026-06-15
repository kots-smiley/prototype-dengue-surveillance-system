/**
 * Case-insensitive-ish substring search for MongoDB via Prisma.
 * Prisma's `mode: 'insensitive'` is not supported on MongoDB, so we match
 * common case variants instead of relying on database collation.
 */
export function caseSearchVariants(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();
  const title = lower.replace(/\b\w/g, (char) => char.toUpperCase());

  return [...new Set([trimmed, lower, upper, title])];
}

/** Build an OR array of `{ [field]: { contains: variant } }` clauses. */
export function buildContainsOr<T extends string>(
  fields: readonly T[],
  term: string
): Array<Record<T, { contains: string }>> {
  const variants = caseSearchVariants(term);
  return variants.flatMap((variant) =>
    fields.map((field) => ({ [field]: { contains: variant } }) as Record<T, { contains: string }>)
  );
}
