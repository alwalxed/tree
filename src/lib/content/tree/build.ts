import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";
import {
  extractOrderAndRawName,
  normalizeSlug,
  normalizeTitle,
} from "../../text/normalization";
import type { Node } from "../types";

const MARKDOWN_BASE_PATH = path.join(process.cwd(), "markdown");

/**
 * Recursively reads the markdown directory structure starting from a base path
 * and constructs a hierarchical tree of document nodes (`Node`).
 *
 * Each node contains metadata like title, slug, order, excerpt, HTML content,
 * and references to child nodes representing nested directories.
 *
 * Skips "index.md" files at the root of each directory but processes "index.md"
 * within directories to extract frontmatter and content.
 *
 * @param dir - The starting directory path to scan (defaults to MARKDOWN_BASE_PATH).
 * @param parentPath - An array representing the accumulated slug path of parent directories.
 * @returns A Promise resolving to an ordered array of `Node` objects reflecting the directory tree.
 */
export async function buildTree(
  dir = MARKDOWN_BASE_PATH,
  parentPath: string[] = []
): Promise<Node[]> {
  if (typeof window !== "undefined") {
    throw new Error("This function must not be called on the client.");
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const nodes: Node[] = [];

  for (const entry of entries) {
    if (entry.name === "index.md") continue;

    const fullPath = path.join(dir, entry.name);
    const { order, raw } = extractOrderAndRawName(entry.name);
    const title = normalizeTitle(raw);
    const slug = normalizeSlug(raw);
    const currentPath = [...parentPath, slug];

    const node: Node = {
      title,
      slug,
      order,
      parentPath,
      children: [],
    };

    if (entry.isDirectory()) {
      const indexPath = path.join(fullPath, "index.md");
      if (fs.existsSync(indexPath)) {
        const fileContents = fs.readFileSync(indexPath, "utf8");
        const { data, content } = matter(fileContents);
        const processed = await remark().use(html).process(content);
        node.excerpt = data.excerpt || "";
        node.contentHtml = processed.toString();
      }
      node.children = await buildTree(fullPath, currentPath);
    }

    nodes.push(node);
  }

  nodes.sort((a, b) => a.order - b.order);
  return nodes;
}
