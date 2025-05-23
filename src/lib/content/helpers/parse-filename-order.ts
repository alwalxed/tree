import { transliterate } from "@/lib/text/transliteration";

/**
 * Parses a filename that starts with a numeric prefix and contains no extension.
 *
 * This is designed for Arabic-learning content where filenames are prefixed with Arabic or Western digits,
 * followed by one or more underscores and a title (e.g., `٠٢_الضمير` or `03_example`).
 *
 * The filename must not include a file extension. If an extension is present, the function will throw an error.
 *
 * @param params - An object containing:
 *   - `filename`: The filename to parse (without extension).
 *
 * @returns An object with:
 *   - `fileOrder`: The numeric order extracted from the prefix.
 *   - `rawUnprefixedFilename`: The remaining part of the filename after the numeric prefix and underscore.
 *
 * @throws Will throw an error if:
 *   - The filename includes a file extension.
 *   - The filename does not match the expected `<number>_<name>` format.
 *   - The numeric prefix cannot be parsed into a valid number.
 *
 * @example
 * ```ts
 * parseFilenameOrder({ filename: "٠٢_الضمير" }) // { fileOrder: 2, rawUnprefixedFilename: "الضمير" }
 * parseFilenameOrder({ filename: "03_example" }) // { fileOrder: 3, rawUnprefixedFilename: "example" }
 * parseFilenameOrder({ filename: "no_prefix" })  // ❌ throws error
 * parseFilenameOrder({ filename: "01_intro.md" }) // ❌ throws error (contains extension)
 * ```
 */
export function parseFilenameOrder({ filename }: { filename: string }): {
  fileOrder: number;
  rawUnprefixedFilename: string;
} {
  if (/\.[a-z0-9]+$/i.test(filename)) {
    throw new Error(
      `Filename "${filename}" must not contain a file extension.`
    );
  }

  const match = filename.match(/^([٠-٩0-9]+)_+(.+)$/);
  if (!match) {
    throw new Error(
      `Invalid filename format: "${filename}". Expected format: <number>_<name>`
    );
  }

  const [, numericPrefix, remainder] = match;
  const fileOrder = parseInt(
    transliterate({ input: numericPrefix, mode: "arabic-to-latin" }),
    10
  );

  if (isNaN(fileOrder)) {
    throw new Error(
      `Invalid numeric prefix in filename: "${filename}". Could not parse "${numericPrefix}" to a number.`
    );
  }

  return {
    fileOrder,
    rawUnprefixedFilename: remainder,
  };
}
