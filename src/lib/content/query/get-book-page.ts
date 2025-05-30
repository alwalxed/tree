import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import type { PageContent } from '../types';
import { normalizeTitle } from '../utils/normalize-title';
import { resolveRealDirectory } from '../utils/resolve-real-directory';

export async function getBookPage({
  fileSystemBasePath,
  contentPath,
}: {
  fileSystemBasePath: string;
  contentPath: {
    subjectSlug: string;
    authorSlug: string;
    bookSlug: string;
    slug: string[];
  };
}): Promise<PageContent | null> {
  const { subjectSlug, authorSlug, bookSlug, slug } = contentPath;
  if (slug.length === 0) return null;

  let currentDir = path.join(
    fileSystemBasePath,
    subjectSlug,
    authorSlug,
    bookSlug
  );
  for (const segment of slug) {
    const real = await resolveRealDirectory(currentDir, segment);
    if (!real) {
      console.error(
        `[SpecificPageLoader] Could not find directory for "${ segment }" under ${ currentDir }`
      );
      return null;
    }
    currentDir = real;
  }

  const markdownFilePath = path.join(currentDir, 'index.md');
  try {
    const raw = await fs.readFile(markdownFilePath, 'utf-8');
    const { data: frontmatter, content: md } = matter(raw);
    const processed = await remark().use(html).process(md);
    const lastSlug = slug.at(-1)!;
    const title = frontmatter.title ?? normalizeTitle(lastSlug);
    return {
      pageTitle: title,
      pageOrder: frontmatter.order,
      excerpt: frontmatter.excerpt,
      contentHtml: processed.toString(),
      frontmatter,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('[SpecificPageLoader] Error reading markdown:', e.message);
    return null;
  }
}
