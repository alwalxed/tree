import type { Node } from "../types";
import { walkTree } from "./walk-tree";

/**
 * Flattens a hierarchical tree structure into a flat array of Nodes.
 * Only includes nodes that have either contentHtml or an excerpt defined.
 *
 * @param tree - The root array of Node objects to flatten.
 * @returns A flat array of Node objects.
 */
export function flattenTree(tree: Node[]): Node[] {
  const flattened: Node[] = [];
  walkTree(tree, (node) => flattened.push(node));
  return flattened;
}
