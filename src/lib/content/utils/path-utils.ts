import { convertNumerals } from '@/lib/common/convert-numerals';
import fs from 'fs';
import path from 'path';
import { CONTENT_PATH, MIN_DEPTH_FOR_PREFIXED_DIRS } from '../constants';
import { walkHasIndexMd } from './tree-utils';

export function requiresPrefix(depth: number): boolean {
  return depth >= MIN_DEPTH_FOR_PREFIXED_DIRS;
}

export async function existsDir(dir: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(dir);
    return stats.isDirectory();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // ENOENT, EACCES, etc.
    console.warn(`cannot access directory "${dir}":`, err.code || err);
    return false;
  }
}

export async function hasBookContent(bookFolderPath: string): Promise<boolean> {
  try {
    return await walkHasIndexMd(bookFolderPath);
  } catch (err) {
    console.warn(`hasBookContent failed for ${bookFolderPath}:`, err);
    return false;
  }
}

export async function validateBookPath({
  subjectSlug,
  authorSlug,
  bookSlug,
}: {
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
}): Promise<boolean> {
  const root = path.resolve(CONTENT_PATH);

  // 1) Subject folder
  const subjectPath = path.resolve(root, subjectSlug);
  if (!subjectPath.startsWith(root)) {
    console.warn('Path‐traversal detected in subjectSlug:', subjectSlug);
    return false;
  }
  if (!(await existsDir(subjectPath))) {
    console.warn(`Subject folder not found: ${subjectPath}`);
    return false;
  }

  // 2) Author folder
  const authorPath = path.resolve(subjectPath, authorSlug);
  if (!authorPath.startsWith(root)) {
    console.warn('Path‐traversal detected in authorSlug:', authorSlug);
    return false;
  }
  if (!(await existsDir(authorPath))) {
    console.warn(`Author folder not found: ${authorPath}`);
    return false;
  }

  // 3) Book folder
  const bookPath = path.resolve(authorPath, bookSlug);
  if (!bookPath.startsWith(root)) {
    console.warn('Path‐traversal detected in bookSlug:', bookSlug);
    return false;
  }
  if (!(await existsDir(bookPath))) {
    console.warn(`Book folder not found: ${bookPath}`);
    return false;
  }

  // all good
  return true;
}

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

export function normalizeTitle(raw: string): string {
  const arabicOnly = raw.replace(/[^\u0600-\u06FF_]/g, '');
  return arabicOnly.replace(/_+/g, ' ');
}
