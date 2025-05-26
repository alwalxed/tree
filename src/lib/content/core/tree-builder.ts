import fs from 'fs';
import path from 'path';
import type { SummaryNode } from '../types';
import { normalizeTitle, parseDirectoryName } from '../utils/path-utils';

const CONTENT_BASE_PATH = path.join(process.cwd(), 'content');

let fullSummaryTreeCache: SummaryNode[] | null = null;

const bookSpecificTreeCache = new Map<string, SummaryNode[]>();

function isPrefixMandatoryForDepth(absoluteDepth: number): boolean {
  return absoluteDepth >= 3;
}

async function scanContentDirectoryRecursive(
  currentActualDirPath: string,
  parentSlugPath: string[] = [],
  currentAbsoluteDepth: number = 0
): Promise<SummaryNode[]> {
  const entries = await fs.promises.readdir(currentActualDirPath, {
    withFileTypes: true,
  });
  const items: SummaryNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullActualEntryPath = path.join(currentActualDirPath, entry.name);

    if (entry.isDirectory()) {
      const { order: dirOrder, name: unprefixedDirName } = parseDirectoryName({
        directoryName: entry.name,
        isDirectoryPrefixMandatory:
          isPrefixMandatoryForDepth(currentAbsoluteDepth),
      });

      const slug = unprefixedDirName;
      const title = normalizeTitle(unprefixedDirName);

      const children = await scanContentDirectoryRecursive(
        fullActualEntryPath,
        [...parentSlugPath, slug],
        currentAbsoluteDepth + 1
      );

      items.push({
        title,
        slug,
        order: dirOrder,
        parentPath: parentSlugPath,
        children,
      });
    }
  }
  return items.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.title.localeCompare(b.title);
  });
}

export async function buildFullContentSummaryTree(): Promise<SummaryNode[]> {
  if (fullSummaryTreeCache) {
    console.log('[TreeBuilder] Returning cached full summary tree.');
    return fullSummaryTreeCache;
  }
  console.log('[TreeBuilder] Building full summary tree from scratch.');
  fullSummaryTreeCache = await scanContentDirectoryRecursive(CONTENT_BASE_PATH);
  return fullSummaryTreeCache;
}

export async function buildBookContentOnlyTree(
  bookSlugPath: string[]
): Promise<SummaryNode[]> {
  if (bookSlugPath.length !== 3) {
    console.error(
      '[TreeBuilder] buildBookContentOnlyTree expects a slug path of length 3 (subject/author/book). Received:',
      bookSlugPath
    );
    return [];
  }

  const decodedBookSlugPath = bookSlugPath.map((s) => decodeURIComponent(s));
  const cacheKey = decodedBookSlugPath.join('/');
  if (bookSpecificTreeCache.has(cacheKey)) {
    console.log(
      `[TreeBuilder] Returning cached content tree for book: ${cacheKey}`
    );
    return bookSpecificTreeCache.get(cacheKey)!;
  }

  console.log(
    `[TreeBuilder] Building content tree specifically for book: ${cacheKey}`
  );

  const bookActualDirPath = path.join(
    CONTENT_BASE_PATH,
    ...decodedBookSlugPath
  );

  try {
    await fs.promises.access(bookActualDirPath);
  } catch (e) {
    console.error(
      `[TreeBuilder] Book directory not found at: ${bookActualDirPath} (derived from Latin slug: ${cacheKey}) ${e}`
    );
    return [];
  }

  const bookContent = await scanContentDirectoryRecursive(
    bookActualDirPath,
    decodedBookSlugPath
  );

  bookSpecificTreeCache.set(cacheKey, bookContent);
  return bookContent;
}

export function clearFullSummaryTreeCache(): void {
  console.log('[TreeBuilder] Clearing full summary tree cache.');
  fullSummaryTreeCache = null;
}

export function clearBookSpecificTreeCache(bookLatinSlugPath?: string[]): void {
  if (bookLatinSlugPath) {
    const cacheKey = bookLatinSlugPath.join('/');
    bookSpecificTreeCache.delete(cacheKey);
    console.log(`[TreeBuilder] Cleared cache for specific book: ${cacheKey}`);
  } else {
    bookSpecificTreeCache.clear();
    console.log('[TreeBuilder] Cleared all book-specific tree caches.');
  }
}
