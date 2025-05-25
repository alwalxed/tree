import { loadPageSpecificContent } from "./core/content-loader";
import {
  buildContentSummaryTree,
  clearSummaryTreeCache as clearInternalSummaryTreeCache,
} from "./core/tree-builder";
import { findDeepestNode } from "./query/find-node";
import type { ContentNode, SummaryNode } from "./types";
export { getTreeSlugs as getAllContentPaths } from "./query/get-all-paths";
export { getBreadcrumbs } from "./query/get-breadcrumbs";
export { getLeafNodes } from "./query/get-leaf-nodes";
export { getNodeSlugPath } from "./query/get-node-path";
export { flattenTree, walkTree } from "./utils/tree-utils";
export async function getSummaryTree(): Promise<SummaryNode[]> {
  return buildContentSummaryTree();
}
export async function getContentNodeBySlugPath(
  slugPath: string[]
): Promise<ContentNode | null> {
  const tree = await getSummaryTree();
  const summaryNode = findDeepestNode(tree, slugPath);
  if (!summaryNode) {
    return null;
  }
  const pageContent = await loadPageSpecificContent(slugPath);
  const contentNode: ContentNode = {
    ...summaryNode,
  };
  if (pageContent) {
    contentNode.pageTitle = pageContent.pageTitle;
    contentNode.pageOrder = pageContent.pageOrder;
    contentNode.excerpt = pageContent.excerpt;
    contentNode.contentHtml = pageContent.contentHtml;
    contentNode.frontmatter = pageContent.frontmatter;
  }
  return contentNode;
}
export function clearSummaryCache(): void {
  clearInternalSummaryTreeCache();
}
