import { CONTENT_PATH } from '../constants';
import { buildTree } from '../core/tree-builder';
import type { SummaryNode } from '../types';

export async function getTreeSlugs(): Promise<string[][]> {
  const tree = await buildTree({
    contentPath: CONTENT_PATH,
    dirNames: [],
    slugs: [],
    depth: 0,
  });

  const slugs: string[][] = [];

  function traverse(node: SummaryNode, currentSlugPath: string[] = []) {
    const newNodeSlugPath = [...currentSlugPath, node.slug];

    if (node.children.length === 0) {
      if (newNodeSlugPath.length === 3) {
        return;
      }
      slugs.push(newNodeSlugPath);
      return;
    }
    for (const child of node.children) {
      traverse(child, newNodeSlugPath);
    }
  }

  for (const rootNode of tree) {
    traverse(rootNode, []);
  }

  return slugs;
}
