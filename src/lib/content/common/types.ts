// ----------------------------------------------------->
// -------------------------------------------------------->
// ----------------------------------------------------------->

import type { Node } from '@/lib/schema/bookTree';

type BaseNode = {
  title: string;
  slug: string;
};

type HierarchyMeta = {
  order: number;
  parentPath: string[];
};

// ----------------------------------------------------->
// -------------------------------------------------------->
// ----------------------------------------------------------->

export type SummaryNode = BaseNode &
  HierarchyMeta & {
    fullPath: string;
    children: SummaryNode[];
  };

export type LeafNodeInfo = {
  title: string;
  fullSlugPath: string;
};

// ----------------------------------------------------->
// -------------------------------------------------------->
// ----------------------------------------------------------->

export type SidebarConfig = {
  bookUrlPath: string;
  tree: Node[];
  label: string;
};

// ----------------------------------------------------->
// -------------------------------------------------------->
// ----------------------------------------------------------->

export type PageContent = {
  pageTitle: string;
  pageOrder?: number;
  excerpt?: string;
  contentHtml: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frontmatter: Record<string, any>;
};
