import type { DocNode } from "@/lib/docs";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function useDocsSidebar(docsTree: DocNode[]) {
  const pathname = usePathname();

  const getAllTopLevelPaths = useCallback((nodes: DocNode[]): string[] => {
    return nodes
      .filter((node) => node.children.length > 0)
      .map((node) => [...node.parentPath, node.slug].join("/"));
  }, []);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() => {
    const topLevel = getAllTopLevelPaths(docsTree);
    const defaultExpanded: Record<string, boolean> = {};
    topLevel.forEach((path) => {
      defaultExpanded[path] = true;
    });
    return defaultExpanded;
  });

  const toggleSection = useCallback((path: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const isCurrentPage = useCallback(
    (fullPath: string) => {
      if (fullPath === "__home") return pathname === "/";
      return pathname === `/learn/${fullPath}/`;
    },
    [pathname]
  );

  const flatItems = useMemo(() => {
    const walk = (
      nodes: DocNode[],
      level = 0
    ): { node: DocNode; level: number }[] => {
      let result: { node: DocNode; level: number }[] = [];

      for (const node of nodes) {
        result.push({ node, level });
        result = result.concat(walk(node.children, level + 1));
      }

      return result;
    };

    return walk(docsTree);
  }, [docsTree]);

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
    const all = getAllPaths(docsTree);
    const expanded: Record<string, boolean> = {};
    all.forEach((p) => (expanded[p] = true));
    setExpandedSections(expanded);
  }, [docsTree, getAllPaths]);

  const collapseAll = useCallback(() => {
    setExpandedSections({});
  }, []);

  const toggleAll = useCallback(() => {
    const allPaths = getAllPaths(docsTree);
    const someExpanded = allPaths.some((path) => expandedSections[path]);
    if (someExpanded) collapseAll();
    else expandAll();
  }, [expandedSections, collapseAll, expandAll, getAllPaths, docsTree]);

  return {
    flatItems,
    expandedSections,
    toggleSection,
    isCurrentPage,
    toggleAll,
  };
}
