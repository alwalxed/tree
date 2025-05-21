import { arabicToEnglishMap } from "@/constants/arabic-to-english-map";

/**
 * Transliterates Arabic text into a simplified English approximation.
 *
 * Includes both Arabic letters and Eastern Arabic numerals (٠-٩), converting them
 * into Latin characters and Western digits (0-9) respectively.
 *
 * Non-Arabic characters are excluded from the output.
 *
 * @param text - Arabic text, such as a filename or folder name (e.g., "١٢٣_مقدمة").
 * @returns A transliterated string (e.g., "123_mqdmh").
 *
 * @example
 * ```ts
 * arabicToEnglish("١٢٣") // "123"
 * arabicToEnglish("مقدمة_النحو") // "mqdmh_alnhw"
 * ```
 */
export function transliterateToArabic(text: string): string {
  return [...text].map((char) => arabicToEnglishMap[char] ?? "").join("");
}
