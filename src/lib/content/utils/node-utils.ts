import type { LeafNodeInfo, SummaryNode } from '../common/types';

export function listLeafNodes(tree: SummaryNode[]): LeafNodeInfo[] {
  const leaves: LeafNodeInfo[] = [];
  function walk(node: SummaryNode, pathSoFar: string[] = []) {
    const full = [ ...pathSoFar, node.slug ];
    if (node.children.length === 0) {
      leaves.push({ title: node.title, fullSlugPath: full.join('/') });
    } else {
      node.children.forEach((c) => walk(c, full));
    }
  }
  tree.forEach((n) => walk(n));
  return leaves;
}

export function getNodeSlugPath(node: SummaryNode): string {
  return [ ...node.parentPath, node.slug ].join('/');
}
