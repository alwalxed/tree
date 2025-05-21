import type { Node } from "../types";

/**
 * Flattens a hierarchical tree structure into a flat array of Nodes.
 * Only includes nodes that have either contentHtml or an excerpt defined.
 *
 * @param tree - The root array of Node objects to flatten.
 * @returns A flat array of Node objects.
 */
export function flattenTree(tree: Node[]): Node[] {
  const flat: Node[] = [];

  const walk = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.contentHtml || node.excerpt) {
        flat.push(node);
      }
      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(tree);
  return flat;
}
