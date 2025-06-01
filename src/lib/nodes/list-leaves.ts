import type { Node } from '../schema/bookTree';

export type LeafNode = {
  title: string;
  fullSlugPath: string;
};

export function listLeafNodes(tree: Node[]): LeafNode[] {
  const leaves: LeafNode[] = [];
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