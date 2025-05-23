/**
 * Converts English (Western) numerals to Arabic-Indic numerals
 * @param input - String or number containing English numerals
 * @returns String with Arabic-Indic numerals
 */
export function toArabicNumerals(input: string | number): string {
  // Mapping of English digits to Arabic-Indic digits
  const ENGLISH_TO_ARABIC_DIGITS = {
    "0": "٠",
    "1": "١",
    "2": "٢",
    "3": "٣",
    "4": "٤",
    "5": "٥",
    "6": "٦",
    "7": "٧",
    "8": "٨",
    "9": "٩",
  } as const;

  // Convert input to string if it's a number
  const inputString = input.toString();

  // Replace each English digit with its Arabic equivalent
  return inputString.replace(/[0-9]/g, (digit) => {
    return ENGLISH_TO_ARABIC_DIGITS[
      digit as keyof typeof ENGLISH_TO_ARABIC_DIGITS
    ];
  });
}
