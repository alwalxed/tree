//––– Types ----------------------------–––––––––––––––––––––––––––––––––––––

/**
 * Options for transliterating Arabic text to Latin script.
 */
type ArabicToLatinOptions = {
  mode: "arabic-to-latin";
  /** Arbitrary Arabic text (letters + Arabic-Indic digits) */
  input: string;
};

/**
 * Options for converting Western digits in Latin text to Arabic-Indic digits.
 */
type LatinToArabicDigitsOptions = {
  mode: "latin-to-arabic-digits";
  /** Mixed Latin letters + Western digits */
  input: string;
};

/**
 * Options for converting Western digits only (string or number) to Arabic-Indic digits.
 */
type LatinNumbersToArabicDigitsOptions = {
  mode: "latin-numbers-to-arabic-digits";
  /** Western digits only (string or number) */
  input: string | number;
};

/**
 * Options for transliterating Latin script (letters + digits) to Arabic script.
 */
type LatinToArabicOptions = {
  mode: "latin-to-arabic";
  /** Mixed Latin letters + Western digits */
  input: string;
};

/**
 * Union type for all transliteration options.
 */
type Options =
  | ArabicToLatinOptions
  | LatinToArabicDigitsOptions
  | LatinNumbersToArabicDigitsOptions
  | LatinToArabicOptions;

//––– Maps -----------------------------–––––––––––––––––––––––––––––––––––––

const LATIN_TO_ARABIC_DIGITS: Record<string, string> = {
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
};

const ARABIC_TO_LATIN_DIGITS: Record<string, string> = Object.fromEntries(
  Object.entries(LATIN_TO_ARABIC_DIGITS).map(([w, a]) => [a, w])
);

const digitSet = new Set(Object.keys(LATIN_TO_ARABIC_DIGITS));

const ARABIC_TO_LATIN_LETTERS: Record<string, string> = {
  ا: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ء: "",
  ى: "a",
  ئ: "y",
  ؤ: "w",
  ة: "h",
  إ: "i",
  أ: "a",
  آ: "aa",
  "ٓ": "",
  "َ": "a",
  "ُ": "u",
  "ِ": "i",
  "ّ": "",
  "ْ": "",
  "ً": "an",
  "ٌ": "un",
  "ٍ": "in",
};

const ARABIC_TO_LATIN_MAP = {
  ...ARABIC_TO_LATIN_LETTERS,
  ...ARABIC_TO_LATIN_DIGITS,
};

const LATIN_TO_ARABIC_LETTERS: Record<string, string> = Object.fromEntries(
  Object.entries(ARABIC_TO_LATIN_LETTERS)
    .filter(([_arb, lat]) => lat.length > 0)
    .map(([arb, lat]) => [lat, arb])
);

const LATIN_LETTER_KEYS = Object.keys(LATIN_TO_ARABIC_LETTERS).sort(
  (a, b) => b.length - a.length
);

//––– Functions –––––--------------------––––––––––––––––––––––––––––––––––––

/**
 * Transliterates text between Arabic and Latin scripts or converts Western digits
 * to Arabic-Indic digits based on the specified mode.
 *
 * Modes:
 * - `"arabic-to-latin"`: Transliterates Arabic letters and Arabic-Indic digits to Latin.
 * - `"latin-to-arabic-digits"`: Converts Western digits in Latin text to Arabic-Indic digits.
 * - `"latin-numbers-to-arabic-digits"`: Converts Western digits only (string or number) to Arabic-Indic digits.
 * - `"latin-to-arabic"`: Transliterates Latin letters and digits to Arabic script.
 *
 * @param options - The transliteration options including mode and input string.
 * @returns The transliterated string.
 * @throws If an unsupported mode is provided or input validation fails.
 */
export function transliterate(options: Options): string {
  const { mode } = options;
  const inputStr = options.input.toString();

  switch (mode) {
    case "arabic-to-latin":
      return [...inputStr].map((ch) => ARABIC_TO_LATIN_MAP[ch] ?? ch).join("");

    case "latin-to-arabic-digits":
      return inputStr.replace(/[0-9]/g, (d) => LATIN_TO_ARABIC_DIGITS[d]);

    case "latin-numbers-to-arabic-digits":
      if (!/^\d+$/.test(inputStr)) {
        throw new Error(
          "Mode 'latin-numbers-to-arabic-digits' requires digits only."
        );
      }
      return [...inputStr].map((d) => LATIN_TO_ARABIC_DIGITS[d]).join("");

    case "latin-to-arabic":
      return transliterateLatinToArabic(inputStr);

    default:
      // Exhaustive check for mode
      const _exhaustive: never = mode;
      throw new Error(`Unsupported mode: ${_exhaustive}`);
  }
}

/**
 * Greedy transliteration from Latin script to Arabic script.
 * Tries to match the longest Latin letter sequences first.
 *
 * @param s - Input Latin string.
 * @returns Transliterated Arabic string.
 */
function transliterateLatinToArabic(s: string): string {
  let result = "";
  let i = 0;
  const N = s.length;
  const lower = s.toLowerCase();

  while (i < N) {
    let matched = false;

    for (const key of LATIN_LETTER_KEYS) {
      if (lower.startsWith(key, i)) {
        result += LATIN_TO_ARABIC_LETTERS[key];
        i += key.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const ch = s[i];
    if (digitSet.has(ch)) {
      result += LATIN_TO_ARABIC_DIGITS[ch];
    } else {
      result += ch;
    }
    i++;
  }

  return result;
}
