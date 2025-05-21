import { buildTree, type TreeNode } from "./tree-builder";

/**
 * Finds the deepest matching node in a tree of documents by traversing
 * the given slug path sequentially.
 *
 * @param tree - The root array of TreeNode objects to search within.
 * @param slugPath - An array of slugs representing the path to follow.
 * @returns The TreeNode matching the full slug path or null if not found.
 */
export function findDeepestNode(
  tree: TreeNode[],
  slugPath: string[]
): TreeNode | null {
  let current: TreeNode | undefined;

  for (const slug of slugPath) {
    current = (current?.children ?? tree).find((node) => node.slug === slug);
    if (!current) return null;
  }

  return current ?? null;
}

/**
 * Retrieves all document slug paths from the markdown tree.
 * Each path is an array of slugs representing the hierarchical route.
 *
 * Useful for dynamic route generation or sitemap creation.
 *
 * @returns A promise resolving to an array of slug paths.
 */
export async function getTreeSlugs(): Promise<string[][]> {
  const tree = await buildTree();
  const slugs: string[][] = [];

  function traverse(node: TreeNode, path: string[] = []) {
    const currentPath = [...path, node.slug];
    slugs.push(currentPath);
    node.children.forEach((child) => traverse(child, currentPath));
  }

  tree.forEach((node) => traverse(node));
  return slugs;
}

/**
 * Fetches a document node from the tree matching a specific slug path.
 *
 * @param slugPath - An array of slugs that uniquely identifies the document.
 * @returns A promise resolving to the matched TreeNode or null if not found.
 */
export async function getNodeBySlug(
  slugPath: string[]
): Promise<TreeNode | null> {
  const tree = await buildTree();
  return findDeepestNode(tree, slugPath);
}

/**
 * Extracts all leaf-level document nodes (nodes without children)
 * from a given tree, returning their titles and slug paths joined by "/".
 *
 * @param tree - The root array of TreeNode objects to scan.
 * @returns An array of objects with `title` and `slug` properties for leaf docs.
 */
export function getLeafNodes(
  tree: TreeNode[]
): { title: string; slug: string }[] {
  const leaves: { title: string; slug: string }[] = [];

  function walk(node: TreeNode, path: string[] = []) {
    const fullPath = [...path, node.slug];
    if (node.children.length === 0) {
      leaves.push({ title: node.title, slug: fullPath.join("/") });
    } else {
      node.children.forEach((child) => walk(child, fullPath));
    }
  }

  tree.forEach((node) => walk(node));
  return leaves;
}

/**
 * Constructs breadcrumb navigation data for a given node by walking
 * back up the tree through parent paths until the root.
 *
 * @param node - The TreeNode for which breadcrumbs are generated.
 * @param tree - The full document tree to reference parents.
 * @returns An ordered array of breadcrumb objects with title and slug.
 */
export function getBreadcrumbs(
  node: TreeNode,
  tree: TreeNode[]
): { title: string; slug: string }[] {
  const breadcrumbs: { title: string; slug: string }[] = [];
  let current = findDeepestNode(tree, node.parentPath);

  while (current) {
    breadcrumbs.unshift({ title: current.title, slug: current.slug });
    current = findDeepestNode(tree, current.parentPath);
  }

  return breadcrumbs;
}
