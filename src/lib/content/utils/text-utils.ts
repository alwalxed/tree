export function normalizeTitle(raw: string): string {
  // strip non-Arabic+underscore, replace underscores with spaces
  return raw.replace(/[^\u0600-\u06FF_]/g, '').replace(/_+/g, ' ');
}
