import type { SummaryNode } from "../types";

/**
 * Finds the deepest matching node in a tree of documents by traversing
 * the given slug path sequentially.
 *
 * @param tree - The root array of SummaryNode objects to search within.
 * @param slugPath - An array of slugs representing the path to follow.
 * @returns The SummaryNode matching the full slug path or null if not found.
 */
export function findDeepestNode(
  tree: SummaryNode[],
  slugPath: string[]
): SummaryNode | null {
  let current: SummaryNode | undefined;

  for (const slug of slugPath) {
    current = (current?.children ?? tree).find((node) => node.slug === slug);
    if (!current) return null;
  }

  return current ?? null;
}
