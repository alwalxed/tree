import type { SummaryNode } from "../types";
import { findDeepestNode } from "./find-node";
export function getBreadcrumbs(
  node: SummaryNode,
  tree: SummaryNode[]
): { title: string; slug: string }[] {
  const breadcrumbs: { title: string; slug: string }[] = [];
  if (node.parentPath.length === 0) {
    return breadcrumbs;
  }
  let currentParentPath = node.parentPath;
  while (currentParentPath.length > 0) {
    const parentNode = findDeepestNode(tree, currentParentPath);
    if (parentNode) {
      breadcrumbs.unshift({ title: parentNode.title, slug: parentNode.slug });
    }
    currentParentPath = currentParentPath.slice(0, -1);
  }
  return breadcrumbs;
}
