import type { Node } from "@/lib/content/types";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function useSidebar(docsTree: Node[]) {
  const pathname = usePathname();

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() => ({}));

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
      nodes: Node[],
      level = 0
    ): { node: Node; level: number }[] => {
      let result: { node: Node; level: number }[] = [];

      for (const node of nodes) {
        result.push({ node, level });
        result = result.concat(walk(node.children, level + 1));
      }

      return result;
    };

    return walk(docsTree);
  }, [docsTree]);

  const getAllPaths = useCallback((nodes: Node[]): string[] => {
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
