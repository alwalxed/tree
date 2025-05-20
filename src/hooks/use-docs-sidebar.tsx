"use client";

import type { DocNode } from "@/lib/docs";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useDocsSidebar(docsTree: DocNode[]) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Initialize expanded sections based on current path
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

  // Toggle section expanded state
  const toggleSection = useCallback((fullPath: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [fullPath]: !prev[fullPath],
    }));
  }, []);

  // Check if a path is the current page
  const isCurrentPage = useCallback(
    (fullPath: string) => pathname === `/docs/${fullPath}`,
    [pathname]
  );

  // Flatten the tree into a list of items with their level
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

  // Get the flattened items
  const flatItems = flattenTree(docsTree);

  return {
    flatItems,
    expandedSections,
    toggleSection,
    isCurrentPage,
  };
}
