import { z } from 'zod';

export const TextSectionSchema = z.object({
  type: z.literal('text'),
  title: z.string(),
  content: z.array(z.string()),
});

export const VisualizationSectionSchema = z.object({
  type: z.literal('visualization'),
  title: z.string(),
  chapterIdentifier: z.string(),
});

export const SectionSchema = z.union([
  TextSectionSchema,
  VisualizationSectionSchema,
]);

export const BookConfigSchema = z.object({
  sections: z.array(SectionSchema),
});

export type TextSection = z.infer<typeof TextSectionSchema>;
export type VisualizationSection = z.infer<typeof VisualizationSectionSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type BookConfig = z.infer<typeof BookConfigSchema>;
