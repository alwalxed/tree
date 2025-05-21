import type { Node } from "../types";
import { findDeepestNode } from "./get-deepest-node";

/**
 * Constructs breadcrumb navigation data for a given node by walking
 * back up the tree through parent paths until the root.
 *
 * @param node - The Node for which breadcrumbs are generated.
 * @param tree - The full document tree to reference parents.
 * @returns An ordered array of breadcrumb objects with title and slug.
 */
export function getBreadcrumbs(
  node: Node,
  tree: Node[]
): { title: string; slug: string }[] {
  const breadcrumbs: { title: string; slug: string }[] = [];
  let current = findDeepestNode(tree, node.parentPath);

  while (current) {
    breadcrumbs.unshift({ title: current.title, slug: current.slug });
    current = findDeepestNode(tree, current.parentPath);
  }

  return breadcrumbs;
}
