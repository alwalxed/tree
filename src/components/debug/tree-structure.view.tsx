'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
} from '@/components/ui/custom-dialog';
import { DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SummaryNode } from '@/lib/content/types';
import {
  ChevronRight,
  Copy,
  FolderTreeIcon as FileTree,
  Maximize2,
  Minimize2,
  Search,
  X,
} from 'lucide-react';
import { memo } from 'react';
import { useTreeStructureDebugger } from './tree-structure.hook';

function TreeStructureDebuggerComponent({
  summaryTree,
}: {
  summaryTree: SummaryNode[];
}) {
  const { state, actions, helpers } = useTreeStructureDebugger(summaryTree);
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
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50"
        variant="default"
        size="sm"
      >
        <FileTree className="mr-2 h-4 w-4" />
        Tree Debugger
      </Button>

      <CustomDialog open={open} onOpenChange={setOpen}>
        <CustomDialogContent
          dir="ltr"
          className="border-border h-[90vh] w-[90vw] max-w-4xl overflow-x-hidden overflow-y-scroll rounded-lg border p-0 shadow-lg"
        >
          <CustomDialogHeader className="border-b px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <CustomDialogTitle className="flex items-center text-xl font-semibold">
                <FileTree className="text-primary mr-2 h-5 w-5" />
                Tree Structure Debugger
              </CustomDialogTitle>
              <div className="flex items-center gap-2">
                {activeTab === 'visual' && (
                  <Button size="sm" variant="outline" onClick={toggleExpandAll}>
                    {expandAll ? (
                      <>
                        <Minimize2 className="mr-1 h-4 w-4" />
                        Collapse All
                      </>
                    ) : (
                      <>
                        <Maximize2 className="mr-1 h-4 w-4" />
                        Expand All
                      </>
                    )}
                  </Button>
                )}
                {activeTab === 'json' && (
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="mr-1 h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </Button>
                )}
                <DialogClose asChild>
                  <Button size="icon" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
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
            className="flex h-[calc(90vh-160px)] flex-col"
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
              <ScrollArea className="bg-background h-full rounded-md border">
                <div className="p-4">
                  {summaryTree.map((node) => (
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
              <ScrollArea className="bg-background h-full rounded-md border">
                <pre className="overflow-visible p-4 font-mono text-sm whitespace-pre-wrap">
                  {formattedTree}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="bg-muted/10 text-muted-foreground border-t px-6 py-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                Total nodes: {countNodes(summaryTree)} • Root nodes:{' '}
                {summaryTree.length} • Max depth:{' '}
                {calculateMaxDepth(summaryTree)}
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
  node: SummaryNode;
  level: number;
  searchTerm: string;
  expandedNodes: string[];
  toggleNode: (path: string) => void;
  expandAll: boolean;
  matchesSearch: (node: SummaryNode, term: string) => boolean;
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
  parentPath = '',
}: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const nodePath = parentPath ? `${parentPath}.${node.slug}` : node.slug;
  const isExpanded = expandedNodes.includes(nodePath) || expandAll;

  const isMatch = matchesSearch(node, searchTerm);

  // If there's a search term and no match, don't render this node
  if (searchTerm && !isMatch) return null;

  return (
    <div className={`${level > 0 ? `ml-${level * 3}` : ''} my-1`}>
      <Collapsible
        open={isExpanded}
        onOpenChange={() => hasChildren && toggleNode(nodePath)}
      >
        <div className="group hover:bg-muted/20 flex items-center rounded-md px-1 py-1">
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground mr-1 h-6 w-6 p-0"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-7" />
          )}

          <div className="flex flex-1 items-center gap-2">
            <span
              className={`font-medium ${
                searchTerm &&
                node.title.toLowerCase().includes(searchTerm.toLowerCase())
                  ? 'rounded bg-yellow-100 px-1 dark:bg-yellow-900/30'
                  : ''
              }`}
            >
              {node.title}
            </span>
            <span className="text-muted-foreground font-mono text-xs">
              ({node.slug})
            </span>
            {node.order && (
              <Badge variant="outline" className="text-xs">
                Order: {node.order}
              </Badge>
            )}
          </div>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            <div className="border-muted mt-1 ml-3 border-l-2 pl-3">
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
