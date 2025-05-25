// File: lib/content/core/tree-builder.ts
import { transliterate } from "@/lib/text/transliteration";
import fs from "fs";
import path from "path";
import type { SummaryNode } from "../types";
import {
  normalizeSlug,
  normalizeTitle,
  parseDirectoryName,
} from "../utils/path-utils";

const CONTENT_BASE_PATH = path.join(process.cwd(), "content");

let fullSummaryTreeCache: SummaryNode[] | null = null;

const bookSpecificTreeCache = new Map<string, SummaryNode[]>();

function isPrefixMandatoryForDepth(
  // The depth relative to the starting point of the scan
  // For a book-specific scan, depth 0 is the book's immediate children.
  // For the full scan, depth 0 is subjects.
  // The rule is: prefix mandatory for content *within* a book.
  // A book is at depth 2 (subject=0, author=1, book=2).
  // So, children of a book are at depth 3 relative to root.
  // If scanning *from* a book, its children are at depth 0 *relative to the book scan*.
  // We need to know the absolute depth from the content root.
  absoluteDepth: number,
): boolean {
  // Prefixes are mandatory for levels 3 and deeper (chapters within books, etc.)
  // Level 0: Subject
  // Level 1: Author
  // Level 2: Book
  // Level 3: Chapter/Part (prefix mandatory)
  return absoluteDepth >= 3;
}

async function scanContentDirectoryRecursive(
  currentActualDirPath: string,
  parentSlugPath: string[] = [],
  currentAbsoluteDepth: number = 0,
): Promise<SummaryNode[]> {
  const entries = await fs.promises.readdir(currentActualDirPath, {
    withFileTypes: true,
  });
  const items: SummaryNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullActualEntryPath = path.join(currentActualDirPath, entry.name);

    if (entry.isDirectory()) {
      const { order: dirOrder, name: unprefixedDirName } = parseDirectoryName({
        directoryName: entry.name,
        isDirectoryPrefixMandatory:
          isPrefixMandatoryForDepth(currentAbsoluteDepth),
      });

      const slug = normalizeSlug(unprefixedDirName);
      const title = normalizeTitle(unprefixedDirName);

      const children = await scanContentDirectoryRecursive(
        fullActualEntryPath,
        [...parentSlugPath, slug],
        currentAbsoluteDepth + 1,
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
    console.log("[TreeBuilder] Returning cached full summary tree.");
    return fullSummaryTreeCache;
  }
  console.log("[TreeBuilder] Building full summary tree from scratch.");
  fullSummaryTreeCache = await scanContentDirectoryRecursive(CONTENT_BASE_PATH);
  return fullSummaryTreeCache;
}

export async function buildBookContentOnlyTree(
  bookLatinSlugPath: string[],
): Promise<SummaryNode[]> {
  if (bookLatinSlugPath.length !== 3) {
    console.error(
      "[TreeBuilder] buildBookContentOnlyTree expects a slug path of length 3 (subject/author/book). Received:",
      bookLatinSlugPath,
    );
    return [];
  }

  const cacheKey = bookLatinSlugPath.join("/");
  if (bookSpecificTreeCache.has(cacheKey)) {
    console.log(
      `[TreeBuilder] Returning cached content tree for book: ${cacheKey}`,
    );
    return bookSpecificTreeCache.get(cacheKey)!;
  }

  console.log(
    `[TreeBuilder] Building content tree specifically for book: ${cacheKey}`,
  );

  const bookArabicPathParts = bookLatinSlugPath.map((latinSlugPart) =>
    transliterate({ input: latinSlugPart, mode: "latin-to-arabic" }),
  );
  const bookActualDirPath = path.join(
    CONTENT_BASE_PATH,
    ...bookArabicPathParts,
  );

  try {
    await fs.promises.access(bookActualDirPath);
  } catch (error) {
    console.error(
      `[TreeBuilder] Book directory not found at: ${bookActualDirPath} (derived from Latin slug: ${cacheKey})`,
    );
    return [];
  }

  const bookContent = await scanContentDirectoryRecursive(
    bookActualDirPath,
    bookLatinSlugPath,
  );

  bookSpecificTreeCache.set(cacheKey, bookContent);
  return bookContent;
}

export function clearFullSummaryTreeCache(): void {
  console.log("[TreeBuilder] Clearing full summary tree cache.");
  fullSummaryTreeCache = null;
}

export function clearBookSpecificTreeCache(bookLatinSlugPath?: string[]): void {
  if (bookLatinSlugPath) {
    const cacheKey = bookLatinSlugPath.join("/");
    bookSpecificTreeCache.delete(cacheKey);
    console.log(`[TreeBuilder] Cleared cache for specific book: ${cacheKey}`);
  } else {
    bookSpecificTreeCache.clear();
    console.log("[TreeBuilder] Cleared all book-specific tree caches.");
  }
}
