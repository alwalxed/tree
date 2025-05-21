import { transliterateToArabic } from "./transliteration";

/**
 * Parses a file or folder name to extract the numeric order and the remainder of the name.
 *
 * Designed for Arabic-learning markdown content where items are prefixed with Arabic or
 * Western digits, followed by an underscore and the title (e.g., `٠٢_الضمير.md`).
 *
 * @param name - Filename or folder name including an order prefix.
 * @returns An object with:
 *  - `order`: The numeric order, parsed as an integer (defaults to 0 if invalid).
 *  - `raw`: The rest of the name after the underscore.
 *
 * @example
 * ```ts
 * extractOrderAndRawName("٠٢_الضمير.md") // { order: 2, raw: "الضمير.md" }
 * extractOrderAndRawName("03_example")   // { order: 3, raw: "example" }
 * ```
 */
export function extractOrderAndRawName(name: string): {
  order: number;
  raw: string;
} {
  const match = name.match(/^([٠-٩0-9]+)_+(.+)$/);
  if (!match) return { order: 0, raw: name };
  const [_, arabicNumber, raw] = match;
  const order = parseInt(transliterateToArabic(arabicNumber), 10);
  return { order, raw };
}

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
  return transliterateToArabic(arabicOnly).replace(/_+/g, "-");
}

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
