export function walkTree<T extends { slug: string; children: T[] }>(
  nodes: T[],
  callback: (node: T, path: string[], level: number) => void,
  path: string[] = [],
  level: number = 0
): void {
  for (const node of nodes) {
    callback(node, path, level);
    if (node.children.length > 0) {
      walkTree(node.children, callback, [...path, node.slug], level + 1);
    }
  }
}
