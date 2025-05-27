import type { SummaryNode } from '@/lib/content/types';
import { usePathname } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export type FlatSidebarItem = {
  node: SummaryNode;
  level: number;
  parentNodeFullPath?: string; // fullPath of the direct parent node in the tree
};

export function useSidebar({
  tree,
  bookUrlPath, // Added bookUrlPath
}: {
  tree: SummaryNode[];
  bookUrlPath: string; // Added bookUrlPath
}) {
  const pathname = usePathname();

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = useCallback((path: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const isCurrentPage = useCallback(
    (itemFullPathOrHome: string) => {
      // Normalize current pathname (remove trailing slash if not root, otherwise keep it)
      const preparedPathname =
        pathname !== '/' && pathname.endsWith('/')
          ? pathname.slice(0, -1)
          : pathname;

      if (itemFullPathOrHome === '__home') {
        const preparedBookUrlPath =
          bookUrlPath !== '/' && bookUrlPath.endsWith('/')
            ? bookUrlPath.slice(0, -1)
            : bookUrlPath;
        return preparedPathname === preparedBookUrlPath;
      }

      // Normalize item full path (remove trailing slash if not root)
      const preparedItemPath =
        itemFullPathOrHome !== '/' && itemFullPathOrHome.endsWith('/')
          ? itemFullPathOrHome.slice(0, -1)
          : itemFullPathOrHome;
      return preparedPathname === preparedItemPath;
    },
    [pathname, bookUrlPath]
  );

  const flatItems = useMemo((): FlatSidebarItem[] => {
    const performWalk = (
      nodes: SummaryNode[],
      currentLevel = 0,
      parentPath?: string
    ): FlatSidebarItem[] => {
      let result: FlatSidebarItem[] = [];
      for (const currentNode of nodes) {
        result.push({
          node: currentNode,
          level: currentLevel,
          parentNodeFullPath: parentPath,
        });
        if (currentNode.children && currentNode.children.length > 0) {
          result = result.concat(
            performWalk(
              currentNode.children,
              currentLevel + 1,
              currentNode.fullPath
            )
          );
        }
      }
      return result;
    };
    return performWalk(tree);
  }, [tree]);

  const getAllPathsWithChildren = useCallback(
    (nodes: SummaryNode[]): string[] => {
      let paths: string[] = [];
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          paths.push(node.fullPath);
          paths = paths.concat(getAllPathsWithChildren(node.children));
        }
      }
      return paths;
    },
    []
  );

  const expandAll = useCallback(() => {
    const allPaths = getAllPathsWithChildren(tree);
    const expanded: Record<string, boolean> = {};
    allPaths.forEach((p) => (expanded[p] = true));
    setExpandedSections(expanded);
  }, [tree, getAllPathsWithChildren]);

  const collapseAll = useCallback(() => {
    setExpandedSections({});
  }, []);

  const toggleAll = useCallback(() => {
    const allPaths = getAllPathsWithChildren(tree);
    const someExpanded = allPaths.some((path) => expandedSections[path]);
    if (someExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  }, [expandedSections, collapseAll, expandAll, getAllPathsWithChildren, tree]);

  return useMemo(
    () => ({
      flatItems,
      expandedSections,
      toggleSection,
      isCurrentPage,
      toggleAll,
    }),
    [flatItems, expandedSections, toggleSection, isCurrentPage, toggleAll]
  );
}
