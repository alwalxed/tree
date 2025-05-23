import { transliterate } from "@/lib/text/transliteration";

/**
 * Converts a raw Arabic filename or folder name into a URL-safe slug.
 *
 * Removes `.md` extension, strips non-Arabic characters (excluding underscores),
 * then transliterates to English and replaces underscores with dashes.
 *
 * Ideal for generating route slugs or identifiers for a structured learning site.
 *
 * @param raw - A raw name like "مقدمة_الدورة.md" or "١_الاسم".
 * @returns A normalized slug like "mqdmh-aldwrah" or "1-alasm".
 *
 * @example
 * ```ts
 * normalizeSlug("مقدمة_الدورة.md") // "mqdmh-aldwrah"
 * normalizeSlug("١_الاسم") // "1-alasm"
 * ```
 */
export function normalizeSlug(raw: string): string {
  const base = raw.replace(/\.md$/, "");
  const arabicOnly = base.replace(/[^\u0600-\u06FF_]/g, "");
  return transliterate({
    input: arabicOnly,
    mode: "arabic-to-latin",
  }).replace(/_+/g, "-");
}
