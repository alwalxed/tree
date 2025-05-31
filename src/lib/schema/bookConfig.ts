import { z } from 'zod';

export const TextSection = z.object({
  type: z.literal('text'),
  title: z.string().min(1),
  content: z.array(z.string().min(1)).min(1),
});

export const VisualizationSection = z.object({
  type: z.literal('visualization'),
  title: z.string().min(1),
  chapterIdentifier: z.string().min(1),
});

export const Section = z.discriminatedUnion('type', [
  TextSection,
  VisualizationSection,
]);

export const ConfigSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    sections: z.array(Section).min(1),
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;
