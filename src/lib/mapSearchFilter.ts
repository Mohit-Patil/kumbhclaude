/** Pure client-side fallback search: keep items matching every query token. */
export function textFilterMissing<T extends { label: string; meta: string }>(
  items: T[],
  query: string,
): T[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return items;
  return items.filter((item) => {
    const hay = `${item.label} ${item.meta}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}
