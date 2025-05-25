import type { LeafNodeInfo, SummaryNode } from '../types';
export function getLeafNodes(tree: SummaryNode[]): LeafNodeInfo[] {
  const leaves: LeafNodeInfo[] = [];
  function walk(node: SummaryNode, currentPath: string[] = []) {
    const fullPathSegments = [...currentPath, node.slug];
    if (node.children.length === 0) {
      leaves.push({
        title: node.title,
        fullSlugPath: fullPathSegments.join('/'),
      });
    } else {
      node.children.forEach((child) => walk(child, fullPathSegments));
    }
  }
  tree.forEach((node) => walk(node));
  return leaves;
}
