import type { DocNode } from "@/lib/docs";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useDocsSidebar(docsTree: DocNode[]) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  console.log(pathname);
  useEffect(() => {
    if (!pathname) return;

    const currentPath = pathname.replace(/^\/docs\//, "");
    const parts = currentPath.split("/");

    const newExpanded: Record<string, boolean> = {};
    for (let i = 0; i < parts.length; i++) {
      const joined = parts.slice(0, i + 1).join("/");
      newExpanded[joined] = true;
    }

    setExpandedSections((prev) => ({ ...prev, ...newExpanded }));
  }, [pathname]);

  const toggleSection = useCallback((fullPath: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [fullPath]: !prev[fullPath],
    }));
  }, []);

  const isCurrentPage = useCallback(
    (fullPath: string) => {
      if (fullPath === "__home") {
        return pathname === "/";
      }
      return pathname === `/docs/${fullPath}/`;
    },
    [pathname]
  );

  const flattenTree = useCallback(
    (nodes: DocNode[], level = 0): { node: DocNode; level: number }[] => {
      let result: { node: DocNode; level: number }[] = [];

      for (const node of nodes) {
        result.push({ node, level });

        const fullPath = [...node.parentPath, node.slug].join("/");
        const isExpanded = expandedSections[fullPath] || false;

        if (node.children.length > 0 && isExpanded) {
          result = result.concat(flattenTree(node.children, level + 1));
        }
      }

      return result;
    },
    [expandedSections]
  );

  const getAllPaths = useCallback((nodes: DocNode[]): string[] => {
    let paths: string[] = [];

    for (const node of nodes) {
      const fullPath = [...node.parentPath, node.slug].join("/");
      if (node.children.length > 0) {
        paths.push(fullPath);
        paths = paths.concat(getAllPaths(node.children));
      }
    }

    return paths;
  }, []);

  const expandAll = useCallback(() => {
    const allPaths = getAllPaths(docsTree);
    const expanded: Record<string, boolean> = {};
    allPaths.forEach((path) => {
      expanded[path] = true;
    });
    setExpandedSections(expanded);
  }, [docsTree, getAllPaths]);

  const collapseAll = useCallback(() => {
    setExpandedSections({});
  }, []);

  const toggleAll = useCallback(() => {
    const allPaths = getAllPaths(docsTree);
    const someExpanded = allPaths.some((path) => expandedSections[path]);
    if (someExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  }, [expandedSections, collapseAll, expandAll, getAllPaths, docsTree]);

  const flatItems = flattenTree(docsTree);

  return {
    flatItems,
    expandedSections,
    toggleSection,
    isCurrentPage,
    expandAll,
    collapseAll,
    toggleAll,
  };
}
