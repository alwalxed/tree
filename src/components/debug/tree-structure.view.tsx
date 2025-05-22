"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
} from "@/components/ui/custom-dialog";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Node } from "@/lib/content/types";
import {
  ChevronRight,
  Copy,
  FolderTreeIcon as FileTree,
  Maximize2,
  Minimize2,
  Search,
  X,
} from "lucide-react";
import { memo } from "react";
import { useTreeStructureDebugger } from "./tree-structure.hook";

function TreeStructureDebuggerComponent({ tree }: { tree: Node[] }) {
  const { state, actions, helpers } = useTreeStructureDebugger(tree);
  const { open, copied, searchTerm, expandedNodes, expandAll, activeTab } =
    state;
  const {
    setOpen,
    handleCopy,
    toggleNode,
    toggleExpandAll,
    setSearchTerm,
    setActiveTab,
  } = actions;
  const { formattedTree, countNodes, calculateMaxDepth, matchesSearch } =
    helpers;

  // 🔒 Hide in production
  if (process.env.NODE_ENV === "production") return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50"
        variant="default"
        size="sm"
      >
        <FileTree className="h-4 w-4 mr-2" />
        Tree Debugger
      </Button>

      <CustomDialog open={open} onOpenChange={setOpen}>
        <CustomDialogContent
          dir="ltr"
          className="max-w-4xl overflow-y-scroll w-[90vw] h-[90vh] p-0 overflow-x-hidden border border-border shadow-lg rounded-lg"
        >
          <CustomDialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <CustomDialogTitle className="text-xl font-semibold flex items-center">
                <FileTree className="h-5 w-5 mr-2 text-primary" />
                Tree Structure Debugger
              </CustomDialogTitle>
              <div className="flex items-center gap-2">
                {activeTab === "visual" && (
                  <Button size="sm" variant="outline" onClick={toggleExpandAll}>
                    {expandAll ? (
                      <>
                        <Minimize2 className="h-4 w-4 mr-1" />
                        Collapse All
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-4 w-4 mr-1" />
                        Expand All
                      </>
                    )}
                  </Button>
                )}
                {activeTab === "json" && (
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-1" />
                    {copied ? "Copied!" : "Copy JSON"}
                  </Button>
                )}
                <DialogClose asChild>
                  <Button size="icon" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
            <div className="mt-4 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CustomDialogHeader>

          <Tabs
            defaultValue="visual"
            className="flex flex-col h-[calc(90vh-160px)]"
            onValueChange={setActiveTab}
          >
            <TabsList className="mx-6 mt-4 w-auto self-start">
              <TabsTrigger value="visual">Visual Tree</TabsTrigger>
              <TabsTrigger value="json">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent
              value="visual"
              className="flex-1 overflow-hidden px-6 pb-6"
            >
              <ScrollArea className="h-full rounded-md border bg-background">
                <div className="p-4">
                  {tree.map((node) => (
                    <TreeNode
                      key={node.slug}
                      node={node}
                      level={0}
                      searchTerm={searchTerm}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                      expandAll={expandAll}
                      matchesSearch={matchesSearch}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="json"
              className="flex-1 overflow-hidden px-6 pb-6"
            >
              <ScrollArea className="h-full rounded-md border bg-background">
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap overflow-visible">
                  {formattedTree}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="px-6 py-3 border-t bg-muted/10 text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <div>
                Total nodes: {countNodes(tree)} • Root nodes: {tree.length} •
                Max depth: {calculateMaxDepth(tree)}
              </div>
              <div>
                <span className="font-mono">
                  process.env.NODE_ENV !== "production"
                </span>
              </div>
            </div>
          </div>
        </CustomDialogContent>
      </CustomDialog>
    </>
  );
}

// TreeNode component remains the same
interface TreeNodeProps {
  node: Node;
  level: number;
  searchTerm: string;
  expandedNodes: string[];
  toggleNode: (path: string) => void;
  expandAll: boolean;
  matchesSearch: (node: Node, term: string) => boolean;
  parentPath?: string;
}

function TreeNode({
  node,
  level,
  searchTerm,
  expandedNodes,
  toggleNode,
  expandAll,
  matchesSearch,
  parentPath = "",
}: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const nodePath = parentPath ? `${parentPath}.${node.slug}` : node.slug;
  const isExpanded = expandedNodes.includes(nodePath) || expandAll;

  const isMatch = matchesSearch(node, searchTerm);

  // If there's a search term and no match, don't render this node
  if (searchTerm && !isMatch) return null;

  return (
    <div className={`${level > 0 ? `ml-${level * 3}` : ""} my-1`}>
      <Collapsible
        open={isExpanded}
        onOpenChange={() => hasChildren && toggleNode(nodePath)}
      >
        <div className="flex items-center group py-1 hover:bg-muted/20 rounded-md px-1">
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 mr-1 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-7" />
          )}

          <div className="flex items-center flex-1 gap-2">
            <span
              className={`font-medium ${
                searchTerm &&
                node.title.toLowerCase().includes(searchTerm.toLowerCase())
                  ? "bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded"
                  : ""
              }`}
            >
              {node.title}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              ({node.slug})
            </span>
            {node.order && (
              <Badge variant="outline" className="text-xs">
                Order: {node.order}
              </Badge>
            )}
            {node.excerpt && (
              <Badge variant="secondary" className="text-xs">
                Has content
              </Badge>
            )}
          </div>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            <div className="border-l-2 border-muted ml-3 pl-3 mt-1">
              {node.children.map((childNode) => (
                <TreeNode
                  key={childNode.slug}
                  node={childNode}
                  level={level + 1}
                  searchTerm={searchTerm}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  expandAll={expandAll}
                  matchesSearch={matchesSearch}
                  parentPath={nodePath}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export const TreeStructureDebugger = memo(TreeStructureDebuggerComponent);
