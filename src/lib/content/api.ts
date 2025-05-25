import { loadPageSpecificContent } from "./core/content-loader";
import { loadBookLandingPageConfigForBuild } from "./core/landing-page-loader";
import {
  buildFullContentSummaryTree,
  clearBookSpecificTreeCache,
  clearFullSummaryTreeCache,
} from "./core/tree-builder";
import { findDeepestNode } from "./query/find-node";
import type { ContentNode, SummaryNode } from "./types";

export { getTreeSlugs as getAllContentPaths } from "./query/get-all-paths";
export { getBreadcrumbs } from "./query/get-breadcrumbs";
export { getLeafNodes } from "./query/get-leaf-nodes";
export { getNodeSlugPath } from "./query/get-node-path";
export { flattenTree, walkTree } from "./utils/tree-utils";

const BOOK_DEPTH = 2; // 0:subject, 1:author, 2:book

export async function getFullSummaryTree(): Promise<SummaryNode[]> {
  return buildFullContentSummaryTree();
}

export async function getContentNodeBySlugPath(
  slugPath: string[],
): Promise<ContentNode | null> {
  const fullTree = await getFullSummaryTree();
  const summaryNode = findDeepestNode(fullTree, slugPath);

  if (!summaryNode) {
    console.warn(
      `[API] getContentNodeBySlugPath: Node not found for slugPath: ${slugPath.join("/")}`,
    );
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

  const nodeDepth = summaryNode.parentPath.length;
  if (nodeDepth === BOOK_DEPTH) {
    const landingConfig = await loadBookLandingPageConfigForBuild(
      slugPath,
      summaryNode.children,
    );
    if (landingConfig) {
      contentNode.landingPageConfig = landingConfig;
    }
  }

  return contentNode;
}

export function clearAllSummaryCaches(): void {
  console.log("[API] Clearing all summary caches.");
  clearFullSummaryTreeCache();
  clearBookSpecificTreeCache();
}

export function clearSpecificBookCache(bookLatinSlugPath: string[]): void {
  if (bookLatinSlugPath && bookLatinSlugPath.length === 3) {
    console.log(
      `[API] Clearing cache for specific book: ${bookLatinSlugPath.join("/")}`,
    );
    clearBookSpecificTreeCache(bookLatinSlugPath);
  } else {
    console.warn(
      "[API] clearSpecificBookCache: Invalid or missing bookLatinSlugPath provided.",
    );
  }
}
