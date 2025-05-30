import { convertNumerals } from '@/lib/common/convert-numerals';

export function parseDirectoryName({
  directoryName,
  isDirectoryPrefixMandatory,
}: {
  directoryName: string;
  isDirectoryPrefixMandatory: boolean;
}): {
  fileOrder: number;
  fileName: string;
  isPrefixed: boolean;
} {
  const DEFAULT_ORDER = 0;
  if (/\.[a-z0-9]+$/i.test(directoryName)) {
    throw new Error(
      `Directory name "${directoryName}" must not contain a file extension.`
    );
  }
  const match = directoryName.match(/^([٠-٩0-9]+)_+(.+)$/);
  if (match) {
    const [, numericPrefix, remainder] = match;
    const order = parseInt(
      convertNumerals({ value: numericPrefix, direction: 'ar-to-en' }),
      10
    );
    if (isNaN(order)) {
      throw new Error(
        `Invalid numeric prefix in directory name: "${directoryName}". Could not parse "${numericPrefix}" to a number.`
      );
    }
    return {
      fileOrder: order,
      fileName: remainder,
      isPrefixed: true,
    };
  }
  if (isDirectoryPrefixMandatory) {
    throw new Error(
      `Invalid directory name format: "${directoryName}". Expected format: <number>_<name> as prefix is mandatory at this level.`
    );
  }
  return {
    fileOrder: DEFAULT_ORDER,
    fileName: directoryName,
    isPrefixed: false,
  };
}
