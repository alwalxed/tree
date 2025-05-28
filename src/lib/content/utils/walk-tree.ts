
export function walkTree<T extends { slug: string; children: T[]; }>(
  nodes: T[],
  callback: (node: T, path: string[], level: number) => void,
  currentPath: string[] = [],
  level: number = 0
): void {
  for (const node of nodes) {
    callback(node, currentPath, level);
    if (node.children && node.children.length > 0) {
      walkTree(node.children, callback, [ ...currentPath, node.slug ], level + 1);
    }
  }
}