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

export type LeafNodeInfo = {
  title: string;
  fullSlugPath: string;
};

type BookLandingSectionBaseJson = {
  title: string;
};

export type TextLandingSectionJson = BookLandingSectionBaseJson & {
  type: "text";
  content: string[];
};

export type VisualizationLandingSectionJson = BookLandingSectionBaseJson & {
  type: "visualization";
  chapterIdentifier: string;
};

export type BookLandingSectionJson =
  | TextLandingSectionJson
  | VisualizationLandingSectionJson;

export type BookLandingPageConfigJson = {
  sections: BookLandingSectionJson[];
};

export type ProcessedTextLandingSection = BookLandingSectionBaseJson & {
  type: "text";
  content: string[];
};

export type ProcessedVisualizationLandingSection =
  BookLandingSectionBaseJson & {
    type: "visualization";
    nodes: SummaryNode[];
  };

export type ProcessedBookLandingSection =
  | ProcessedTextLandingSection
  | ProcessedVisualizationLandingSection;

export type ProcessedBookLandingPageConfig = {
  sections: ProcessedBookLandingSection[];
};

export type ContentNode = SummaryNode & {
  pageTitle?: string;
  pageOrder?: number;
  excerpt?: string;
  contentHtml?: string;
  frontmatter?: Record<string, any>;
  landingPageConfig?: ProcessedBookLandingPageConfig;
};
