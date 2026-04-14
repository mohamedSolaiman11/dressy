export function slugifySegment(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized;
}

export function createAtelierSlug(name: string, branchName?: string) {
  const base = slugifySegment([name, branchName].filter(Boolean).join(" "));

  if (base) {
    return base;
  }

  const token = Math.random().toString(36).slice(2, 8);
  return `store-${token}`;
}
