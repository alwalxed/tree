import { buildBookTree } from './buildTree';
import { FILESYSTEM_CONTENT_PATH } from './common/constants';
import { listLeafNodes } from './utils/node-utils';

type BookSlug = {
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
};

type PageSlug = BookSlug & { slug: string[]; };

export async function getAllBookSlugs(): Promise<BookSlug[]> {
  const tree = await buildBookTree({
    fileSystemBasePath: FILESYSTEM_CONTENT_PATH,
    depth: 0,
    prefix: '',
  });
  if (!tree) return [];
  const books: BookSlug[] = [];
  for (const subject of tree) {
    for (const author of subject.children) {
      for (const book of author.children) {
        books.push({
          subjectSlug: subject.slug,
          authorSlug: author.slug,
          bookSlug: book.slug,
        });
      }
    }
  }
  return books;
}

export async function getAllPageSlugs(): Promise<PageSlug[]> {
  const tree = await buildBookTree({
    fileSystemBasePath: FILESYSTEM_CONTENT_PATH,
    depth: 0,
    prefix: '',
  });
  if (!tree) return [];
  const allLeaves = listLeafNodes(tree);
  const pages: PageSlug[] = [];
  for (const leaf of allLeaves) {
    const parts = leaf.fullSlugPath.split('/');
    if (parts.length < 4) continue;
    const [ subjectSlug, authorSlug, bookSlug, ...rest ] = parts;
    pages.push({ subjectSlug, authorSlug, bookSlug, slug: rest });
  }
  return pages;
}
