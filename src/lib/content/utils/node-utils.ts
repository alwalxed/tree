import type { Node } from '@/lib/schema/bookTree';
import type { LeafNodeInfo } from '../common/types';

export function listLeafNodes(tree: Node[]): LeafNodeInfo[] {
  const leaves: LeafNodeInfo[] = [];
  function walk(node: Node, pathSoFar: string[] = []) {
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

export function getNodeSlugPath(node: Node): string {
  return [ ...node.parentPath, node.slug ].join('/');
}
