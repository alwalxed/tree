import type { Node } from "../types";
import { buildTree } from "./build";

/**
 * Retrieves all document slug paths from the markdown tree.
 * Each path is an array of slugs representing the hierarchical route.
 *
 * Useful for dynamic route generation or sitemap creation.
 *
 * @returns A promise resolving to an array of slug paths.
 */
export async function getTreeSlugs(): Promise<string[][]> {
  const tree = await buildTree();
  const slugs: string[][] = [];

  function traverse(node: Node, path: string[] = []) {
    const currentPath = [...path, node.slug];
    slugs.push(currentPath);
    node.children.forEach((child) => traverse(child, currentPath));
  }

  tree.forEach((node) => traverse(node));
  return slugs;
}
