import { convertNumerals } from '@/lib/common/convert-numerals';
import fs from 'fs/promises';
import path from 'path';
import { MIN_DEPTH_FOR_PREFIXED_DIRS } from '../common/constants';

export function parseDirName({
  directoryName,
  isDirectoryPrefixMandatory,
}: {
  directoryName: string;
  isDirectoryPrefixMandatory: boolean;
}) {
  const DEFAULT_ORDER = 0;
  if (/\.[a-z0-9]+$/i.test(directoryName))
    throw new Error(`"${ directoryName }" must not contain an extension.`);
  const m = directoryName.match(/^([٠-٩0-9]+)_+(.+)$/);
  if (m) {
    const [ , prefix, rest ] = m;
    const order = parseInt(
      convertNumerals({ value: prefix, direction: 'ar-to-en' }),
      10
    );
    if (isNaN(order))
      throw new Error(`Invalid numeric prefix in "${ directoryName }"`);
    return { fileOrder: order, fileName: rest, isPrefixed: true };
  }
  if (isDirectoryPrefixMandatory)
    throw new Error(`"${ directoryName }" missing numeric prefix at this level.`);
  return {
    fileOrder: DEFAULT_ORDER,
    fileName: directoryName,
    isPrefixed: false,
  };
}

export function requiresPrefix(depth: number): boolean {
  return depth >= MIN_DEPTH_FOR_PREFIXED_DIRS;
}

export async function resolveRealDirectory(
  parentDir: string,
  slugSegment: string
): Promise<string | null> {
  const entries = await fs.readdir(parentDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const { fileName } = parseDirName({
      directoryName: ent.name,
      isDirectoryPrefixMandatory: false,
    });
    if (fileName === slugSegment) return path.join(parentDir, ent.name);
  }
  return null;
}
