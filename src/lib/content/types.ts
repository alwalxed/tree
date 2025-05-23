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
  excerpt?: string;
  contentHtml: string;
};

export type LeafNode = BaseNode;
