import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import type { PageContent } from './common/types';
import { resolveRealDirectory } from './utils/dir-utils';
import { normalizeTitle } from './utils/text-utils';

export async function loadBookPage({
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
  let dir = path.join(fileSystemBasePath, subjectSlug, authorSlug, bookSlug);
  for (const segment of slug) {
    const real = await resolveRealDirectory(dir, segment);
    if (!real) {
      console.error(`Missing segment "${ segment }" under ${ dir }`);
      return null;
    }
    dir = real;
  }
  const mdPath = path.join(dir, 'index.md');
  try {
    const raw = await fs.readFile(mdPath, 'utf-8');
    const { data, content: md } = matter(raw);
    const processed = await remark().use(html).process(md);
    const lastSlug = slug.at(-1)!;
    return {
      pageTitle: data.title ?? normalizeTitle(lastSlug),
      pageOrder: data.order,
      excerpt: data.excerpt,
      contentHtml: processed.toString(),
      frontmatter: data,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`Error loading markdown at ${ mdPath }:`, err.message);
    return null;
  }
}
