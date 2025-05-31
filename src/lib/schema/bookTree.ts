import { z } from "zod/v4";

export type Node = {
  title: string;
  slug: string;
  order: number;
  parentPath: string[];
  fullPath: string;
  children: Node[];
};

export const NodeSchema: z.ZodSchema<Node> = z.lazy(() =>
  z
    .object({
      title: z.string().min(1),
      slug: z.string().min(1),
      order: z.number().int().nonnegative(),
      parentPath: z.array(z.string()),
      fullPath: z.string().min(1),
      children: NodeSchema.array().default([]),
    })
    .strict()
);

export const TreeSchema = NodeSchema.array().min(1);

export type NodeType = z.infer<typeof NodeSchema>;
