export function normalizeTitle(raw: string): string {
  const arabicOnly = raw.replace(/[^\u0600-\u06FF_]/g, '');
  return arabicOnly.replace(/_+/g, ' ');
}
