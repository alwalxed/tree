import type { SummaryNode } from "../types";
export function findDeepestNode(
  tree: SummaryNode[],
  slugPath: string[]
): SummaryNode | null {
  let currentNodes: SummaryNode[] = tree;
  let foundNode: SummaryNode | null = null;
  for (const slug of slugPath) {
    const nextNode = currentNodes.find((node) => node.slug === slug);
    if (!nextNode) return null;
    foundNode = nextNode;
    currentNodes = nextNode.children;
  }
  return foundNode;
}
