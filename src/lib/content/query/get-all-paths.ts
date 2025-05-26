import { buildFullTree } from '../core/tree-builder';
import type { SummaryNode } from '../types';

export async function getTreeSlugs(): Promise<string[][]> {
  const tree = await buildFullTree({});
  const slugs: string[][] = [];

  function traverse(node: SummaryNode, parentPath: string[] = []) {
    const thisPath = [...parentPath, node.slug];

    if (node.children.length === 0) {
      // if this is exactly a book‐level leaf (depth 3), skip it
      if (thisPath.length === 3) {
        return;
      }
      slugs.push(thisPath);
      return;
    }

    for (const child of node.children) {
      traverse(child, thisPath);
    }
  }

  for (const root of tree) {
    traverse(root, []);
  }

  return slugs;
}
