import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import { normalizeTitle } from '../utils/normalize-title';

export type PageSpecificContent = {
  pageTitle: string;
  pageOrder?: number;
  excerpt?: string;
  contentHtml: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frontmatter: Record<string, any>;
};

const CONTENT_BASE_PATH = path.join(process.cwd(), 'content');

export async function loadSpecificPage(
  slugPath: string[]
): Promise<PageSpecificContent | null> {
  if (slugPath.length === 0) return null;
  const markdownFilePath = path.join(
    CONTENT_BASE_PATH,
    ...slugPath,
    'index.md'
  );
  try {
    const rawMarkdown = await fs.readFile(markdownFilePath, 'utf-8');
    const { data: frontmatter, content: markdownContent } = matter(rawMarkdown);
    const processedHtml = await remark().use(html).process(markdownContent);
    const currentDirSlug = slugPath.at(-1)!;
    const title = frontmatter.title ?? normalizeTitle(currentDirSlug);
    return {
      pageTitle: title,
      pageOrder: frontmatter.order,
      excerpt: frontmatter.excerpt,
      contentHtml: processedHtml.toString(),
      frontmatter,
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('Error message:', e.message);
    } else {
      console.error('Non-Error thrown:', e);
    }
    return null;
  }
}
