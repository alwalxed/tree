import fs from "fs";
import path from "path";

import { normalizeSlug } from "../helpers/normalize-slug";
import { normalizeTitle } from "../helpers/normalize-title";
import { parseFilenameOrder } from "../helpers/parse-filename-order";
import type { SummaryNode } from "../types";

const MARKDOWN_BASE_PATH = path.join(process.cwd(), "content");
let _cache: SummaryNode[] | null = null;

/**
 * Recursively walks through a directory and builds a summary tree of its structure.
 *
 * Only directories are included as nodes. Markdown files are ignored,
 * as this function is used for building sidebar and structure visualization components — not for rendering content.
 *
 * @param dir - The current directory path to walk.
 * @param parentPath - The accumulated path segments for the current node's ancestors.
 * @returns A promise resolving to an array of summary nodes representing the directory structure.
 */
async function walkDir(
  dir: string,
  parentPath: string[] = []
): Promise<SummaryNode[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const items: SummaryNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dir, entry.name);
    const isMarkdownFile = entry.name.endsWith(".md");

    // Strip extension only if it's a markdown file
    const filenameWithoutExtension = isMarkdownFile
      ? entry.name.replace(/\.md$/, "")
      : entry.name;

    const { fileOrder, rawUnprefixedFilename } = parseFilenameOrder({
      filename: filenameWithoutExtension,
    });

    if (entry.isDirectory()) {
      const children = await walkDir(fullPath, [
        ...parentPath,
        normalizeSlug(rawUnprefixedFilename),
      ]);

      items.push({
        title: normalizeTitle(rawUnprefixedFilename),
        slug: normalizeSlug(rawUnprefixedFilename),
        order: fileOrder,
        parentPath,
        children,
      });
    } else if (isMarkdownFile) {
      // Skip leaf markdown files — only directories are summarized
      continue;
    }
  }

  return items.sort((a, b) => a.order - b.order);
}

/**
 * Builds a cached summary tree of the content directory structure.
 *
 * This tree is used for sidebars, navigation, and structural visualization — not for content rendering.
 */
export async function buildSummaryTree(): Promise<SummaryNode[]> {
  if (_cache) return _cache;
  _cache = await walkDir(MARKDOWN_BASE_PATH);
  return _cache;
}
