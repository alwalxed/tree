type BaseNode = {
  title: string;
  slug: string;
};
type HierarchyMeta = {
  order: number;
  parentPath: string[];
};
export type SummaryNode = BaseNode &
  HierarchyMeta & {
    children: SummaryNode[];
  };
export type ContentNode = SummaryNode & {
  pageTitle?: string;
  pageOrder?: number;
  excerpt?: string;
  contentHtml?: string;
  frontmatter?: Record<string, any>;
};
export type LeafNodeInfo = {
  title: string;
  fullSlugPath: string;
};
