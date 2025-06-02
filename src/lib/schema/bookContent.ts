import { z } from 'zod';

export const ContentSchema = z.object({
  title: z.string().optional(),
  excerpt: z.string().optional(),
  contentHtml: z.string(),
});

export type Content = z.infer<typeof ContentSchema>;
