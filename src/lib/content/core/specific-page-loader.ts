import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import { normalizeTitle } from '../utils/normalize-title';
import { parseDirectoryName } from '../utils/parse-directory-name';


export type PageSpecificContent = {
  pageTitle: string;
  pageOrder?: number;
  excerpt?: string;
  contentHtml: string;
  frontmatter: Record<string, any>;
};

async function resolveRealDir(
  parentDir: string,
  slugSegment: string
): Promise<string | null> {
  const entries = await fs.readdir(parentDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const { fileName } = parseDirectoryName({
      directoryName: ent.name,
      isDirectoryPrefixMandatory: false,
    });
    if (fileName === slugSegment) {
      return path.join(parentDir, ent.name);
    }
  }
  return null;
}

export async function loadSpecificPage({
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
}): Promise<PageSpecificContent | null> {
  const { subjectSlug, authorSlug, bookSlug, slug } = contentPath;
  if (slug.length === 0) return null;

  let currentDir = path.join(
    fileSystemBasePath,
    subjectSlug,
    authorSlug,
    bookSlug
  );
  for (const segment of slug) {
    const real = await resolveRealDir(currentDir, segment);
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
  } catch (e: any) {
    console.error('[SpecificPageLoader] Error reading markdown:', e.message);
    return null;
  }
}
