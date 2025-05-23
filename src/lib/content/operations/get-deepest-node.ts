import type { Node } from "../types";

/**
 * Finds the deepest matching node in a tree of documents by traversing
 * the given slug path sequentially.
 *
 * @param tree - The root array of Node objects to search within.
 * @param slugPath - An array of slugs representing the path to follow.
 * @returns The Node matching the full slug path or null if not found.
 */
export function findDeepestNode(tree: Node[], slugPath: string[]): Node | null {
  let current: Node | undefined;

  for (const slug of slugPath) {
    current = (current?.children ?? tree).find((node) => node.slug === slug);
    if (!current) return null;
  }

  return current ?? null;
}
