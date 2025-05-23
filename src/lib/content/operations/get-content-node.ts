import type { Node } from "../types";
import { buildContentTree } from "./build-tree";
import { findDeepestNode } from "./get-deepest-node";

/**
 * Fetches a document node from the tree matching a specific slug path.
 *
 * @param slugPath - An array of slugs that uniquely identifies the document.
 * @returns A promise resolving to the matched Node or null if not found.
 */
export async function getContentNode(slugPath: string[]): Promise<Node | null> {
  const tree = await buildContentTree();
  return findDeepestNode(tree, slugPath);
}
