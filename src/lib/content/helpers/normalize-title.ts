/**
 * Generates a readable title in Arabic from a raw file or folder name.
 *
 * Removes non-Arabic characters (e.g., numerals, dashes), and replaces underscores with spaces
 * to make a clean, human-friendly Arabic title for UI display.
 *
 * @param raw - A raw string like "مقدمة_الدورة.md" or "٣__الكلمة".
 * @returns An Arabic title like "مقدمة الدورة" or "الكلمة".
 *
 * @example
 * ```ts
 * normalizeTitle("مقدمة_الدورة.md") // "مقدمة الدورة"
 * normalizeTitle("٣__الكلمة") // "الكلمة"
 * ```
 */
export function normalizeTitle(raw: string): string {
  const arabicOnly = raw.replace(/[^\u0600-\u06FF_]/g, "");
  return arabicOnly.replace(/_+/g, " ");
}
