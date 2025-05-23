import type { SummaryNode } from "../types";
import { walkTree } from "./walk-tree";

/**
 * Flattens a hierarchical tree structure into a flat array of Nodes.
 * Only includes nodes that have either contentHtml or an excerpt defined.
 *
 * @param tree - The root array of SummaryNode objects to flatten.
 * @returns A flat array of SummaryNode objects.
 */
export function flattenTree(tree: SummaryNode[]): SummaryNode[] {
  const flattened: SummaryNode[] = [];
  walkTree(tree, (node) => flattened.push(node));
  return flattened;
}
