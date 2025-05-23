import type { SummaryNode } from "../types";
import { buildSummaryTree } from "./build-summary-tree";

/**
 * Retrieves all document slug paths from the markdown tree.
 * Each path is an array of slugs representing the hierarchical route.
 *
 * Useful for dynamic route generation or sitemap creation.
 *
 * @returns A promise resolving to an array of slug paths.
 */
export async function getTreeSlugs(): Promise<string[][]> {
  const tree = await buildSummaryTree();
  const slugs: string[][] = [];

  function traverse(node: SummaryNode, path: string[] = []) {
    const currentPath = [...path, node.slug];
    slugs.push(currentPath);
    node.children.forEach((child) => traverse(child, currentPath));
  }

  tree.forEach((node) => traverse(node));
  return slugs;
}
