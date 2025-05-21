export type Node = {
  title: string;
  slug: string;
  order: number;
  excerpt?: string;
  contentHtml?: string;
  children: Node[];
  parentPath: string[];
};

export type LeafNode = { title: string; slug: string };
