import { transliterate } from '../../text/transliteration';
export interface ParsedNameInfo {
  order: number;
  name: string;
  isPrefixed: boolean;
}
const DEFAULT_ORDER = 0;
export function parseDirectoryName({
  directoryName,
  isDirectoryPrefixMandatory,
}: {
  directoryName: string;
  isDirectoryPrefixMandatory: boolean;
}): ParsedNameInfo {
  if (/\.[a-z0-9]+$/i.test(directoryName)) {
    throw new Error(
      `Directory name "${directoryName}" must not contain a file extension.`
    );
  }
  const match = directoryName.match(/^([٠-٩0-9]+)_+(.+)$/);
  if (match) {
    const [, numericPrefix, remainder] = match;
    const order = parseInt(
      transliterate({ input: numericPrefix, mode: 'arabic-to-latin' }),
      10
    );
    if (isNaN(order)) {
      throw new Error(
        `Invalid numeric prefix in directory name: "${directoryName}". Could not parse "${numericPrefix}" to a number.`
      );
    }
    return {
      order,
      name: remainder,
      isPrefixed: true,
    };
  }
  if (isDirectoryPrefixMandatory) {
    throw new Error(
      `Invalid directory name format: "${directoryName}". Expected format: <number>_<name> as prefix is mandatory at this level.`
    );
  }
  return {
    order: DEFAULT_ORDER,
    name: directoryName,
    isPrefixed: false,
  };
}
export function normalizeSlug(raw: string): string {
  const base = raw.replace(/\.md$/, '');
  const arabicOnly = base.replace(/[^\u0600-\u06FF_]/g, '');
  return transliterate({
    input: arabicOnly,
    mode: 'arabic-to-latin',
  }).replace(/_+/g, '-');
}
export function normalizeTitle(raw: string): string {
  const arabicOnly = raw.replace(/[^\u0600-\u06FF_]/g, '');
  return arabicOnly.replace(/_+/g, ' ');
}
