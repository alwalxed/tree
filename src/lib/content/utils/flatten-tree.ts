import type { SummaryNode } from '../types';
import { walkTree } from './walk-tree';

export function flattenTree(tree: SummaryNode[]): SummaryNode[] {
  const flattened: SummaryNode[] = [];
  walkTree(tree, (node) => flattened.push(node));
  return flattened;
}