import { z } from 'zod';

export type Node = {
  urlSafeSlug: string;
  parentUrlSafePath?: string[];
  fullUrlSafePath?: string;
  title: string;
  slug: string;
  slugWithPrefix: string;
  order: number;
  parentPath: string[];
  parentPathWithPrefixedSlugs: string[];
  fullPath: string;
  fullPathWithPrefixes: string;
  children: Node[];
};

export const NodeSchema: z.ZodType<Node> = z.lazy(() =>
  z
    .object({
      urlSafeSlug: z.string(),
      parentUrlSafePath: z.array(z.string()).optional(),
      fullUrlSafePath: z.string().optional(),
      title: z.string().min(1),
      slug: z.string().min(1),
      slugWithPrefix: z.string(),
      order: z.number().int().nonnegative(),
      parentPath: z.array(z.string()),
      parentPathWithPrefixedSlugs: z.array(z.string()),
      fullPath: z.string().min(1),
      fullPathWithPrefixes: z.string(),
      children: z.array(NodeSchema),
    })
    .strict()
);

export const TreeSchema = z
  .array(NodeSchema)
  .min(1)
  .superRefine((nodes, ctx) => {
    const seen = new Set<string>();

    function walk(node: Node, depth: number) {
      if (depth >= 3) {
        if (seen.has(node.fullPath)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate fullPath at depth ≥ 3: ${node.fullPath}`,
          });
        }
        seen.add(node.fullPath);
      }

      node.children.forEach((child) => walk(child, depth + 1));
    }

    nodes.forEach((node) => walk(node, 1));
  });

export type NodeType = z.infer<typeof NodeSchema>;
