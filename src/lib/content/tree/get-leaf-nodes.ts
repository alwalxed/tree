import type { LeafNode, Node } from "../types";

/**
 * Extracts all leaf-level document nodes (nodes without children)
 * from a given tree, returning their titles and slug paths joined by "/".
 *
 * @param tree - The root array of Node objects to scan.
 * @returns An array of objects with `title` and `slug` properties for leaf docs.
 */
export function getLeafNodes(tree: Node[]): LeafNode[] {
  const leaves: LeafNode[] = [];

  function walk(node: Node, path: string[] = []) {
    const fullPath = [...path, node.slug];
    if (node.children.length === 0) {
      leaves.push({ title: node.title, slug: fullPath.join("/") });
    } else {
      node.children.forEach((child) => walk(child, fullPath));
    }
  }

  tree.forEach((node) => walk(node));
  return leaves;
}
