import { buildContentSummaryTree } from '../core/tree-builder';
import type { SummaryNode } from '../types';
export async function getTreeSlugs(): Promise<string[][]> {
  const tree = await buildContentSummaryTree();
  const slugs: string[][] = [];
  function traverse(node: SummaryNode, currentPath: string[] = []) {
    const newPath = [...currentPath, node.slug];
    slugs.push(newPath);
    if (node.children) {
      node.children.forEach((child) => traverse(child, newPath));
    }
  }
  tree.forEach((node) => traverse(node));
  return slugs;
}
