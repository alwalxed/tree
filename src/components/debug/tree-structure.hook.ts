"use client";

import type { SummaryNode } from "@/lib/content/types";
import * as React from "react";

export interface TreeDebuggerState {
  open: boolean;
  copied: boolean;
  searchTerm: string;
  expandedNodes: string[];
  expandAll: boolean;
  activeTab: string;
}

export interface TreeDebuggerActions {
  setOpen: (open: boolean) => void;
  handleCopy: () => void;
  toggleNode: (path: string) => void;
  toggleExpandAll: () => void;
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: string) => void;
}

export interface TreeDebuggerHelpers {
  formattedTree: string;
  countNodes: (nodes: SummaryNode[]) => number;
  calculateMaxDepth: (nodes: SummaryNode[], currentDepth?: number) => number;
  matchesSearch: (node: SummaryNode, term: string) => boolean;
}

export interface UseTreeDebuggerResult {
  state: TreeDebuggerState;
  actions: TreeDebuggerActions;
  helpers: TreeDebuggerHelpers;
}

export function useTreeStructureDebugger(
  tree: SummaryNode[]
): UseTreeDebuggerResult {
  // State
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedNodes, setExpandedNodes] = React.useState<string[]>([]);
  const [expandAll, setExpandAll] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("visual");

  // Memoized values
  const formattedTree = React.useMemo(
    () => JSON.stringify(tree, null, 2),
    [tree]
  );

  // Actions
  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(formattedTree).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [formattedTree]);

  const toggleNode = React.useCallback((path: string) => {
    setExpandedNodes((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  }, []);

  const toggleExpandAll = React.useCallback(() => {
    setExpandAll((prev) => !prev);
    if (!expandAll) {
      // Collect all possible paths
      const allPaths: string[] = [];
      const collectPaths = (nodes: SummaryNode[], currentPath = "") => {
        nodes.forEach((node) => {
          const nodePath = currentPath
            ? `${currentPath}.${node.slug}`
            : node.slug;
          allPaths.push(nodePath);
          if (node.children.length) {
            collectPaths(node.children, nodePath);
          }
        });
      };
      collectPaths(tree);
      setExpandedNodes(allPaths);
    } else {
      setExpandedNodes([]);
    }
  }, [expandAll, tree]);

  // Helper functions
  const countNodes = React.useCallback((nodes: SummaryNode[]): number => {
    let count = nodes.length;
    for (const node of nodes) {
      count += countNodes(node.children);
    }
    return count;
  }, []);

  const calculateMaxDepth = React.useCallback(
    (nodes: SummaryNode[], currentDepth = 1): number => {
      if (nodes.length === 0) return currentDepth - 1;

      let maxDepth = currentDepth;
      for (const node of nodes) {
        if (node.children.length > 0) {
          const childDepth = calculateMaxDepth(node.children, currentDepth + 1);
          maxDepth = Math.max(maxDepth, childDepth);
        }
      }

      return maxDepth;
    },
    []
  );

  const matchesSearch = React.useCallback(
    (node: SummaryNode, term: string): boolean => {
      if (!term) return true;

      const nodeMatches =
        node.title.toLowerCase().includes(term.toLowerCase()) ||
        node.slug.toLowerCase().includes(term.toLowerCase());

      if (nodeMatches) return true;

      return node.children.some((child) => matchesSearch(child, term));
    },
    []
  );

  return {
    state: {
      open,
      copied,
      searchTerm,
      expandedNodes,
      expandAll,
      activeTab,
    },
    actions: {
      setOpen,
      handleCopy,
      toggleNode,
      toggleExpandAll,
      setSearchTerm,
      setActiveTab,
    },
    helpers: {
      formattedTree,
      countNodes,
      calculateMaxDepth,
      matchesSearch,
    },
  };
}
