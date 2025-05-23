// lib/content/operations/get-content-node.ts
import fs from "fs/promises";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

import { normalizeSlug } from "../helpers/normalize-slug";
import { normalizeTitle } from "../helpers/normalize-title";
import { parseFilenameOrder } from "../helpers/parse-filename-order";
import type { ContentNode } from "../types";

const MARKDOWN_BASE_PATH = path.join(process.cwd(), "content");

/**
 * Loads and parses a Markdown content node from the file system.
 *
 * @param slugPath - Array of path segments representing the content node location.
 * @returns A ContentNode object, or null if the file doesn't exist or can't be parsed.
 */
export async function getContentNode(
  slugPath: string[]
): Promise<ContentNode | null> {
  if (slugPath.length === 0) return null;

  const normalizedSlugs = slugPath.map(normalizeSlug);
  const filename = `${normalizedSlugs.at(-1)}.md`;
  const filePath = path.join(
    MARKDOWN_BASE_PATH,
    ...normalizedSlugs.slice(0, -1),
    filename
  );

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const processed = await remark().use(html).process(content);

    const slug = normalizedSlugs.at(-1)!;

    return {
      title: data.title ?? normalizeTitle(slug),
      slug,
      order: data.order ?? parseFilenameOrder({ filename: slug }).fileOrder,
      parentPath: normalizedSlugs.slice(0, -1),
      children: [],
      excerpt: data.excerpt,
      contentHtml: processed.toString(),
    };
  } catch (error) {
    // Optionally log the error:
    // console.error(`Failed to load content node at: ${filePath}`, error);
    return null;
  }
}
