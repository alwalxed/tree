import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import { ConfigSchema, type Config } from '../schema/bookConfig';
import { ContentSchema, type Content } from '../schema/bookContent';
import { TreeSchema, type Node } from '../schema/bookTree';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export type BookParams = {
  subject: string;
  author: string;
  book: string;
};

export type PageParams = BookParams & {
  slug: string[];
};

// list all books (for book‐list page)
export async function listAllBooks(): Promise<BookParams[]> {
  const out: BookParams[] = [];
  for (const subject of await fs.readdir(CONTENT_DIR)) {
    for (const author of await fs.readdir(path.join(CONTENT_DIR, subject))) {
      for (const book of await fs.readdir(
        path.join(CONTENT_DIR, subject, author)
      )) {
        out.push({ subject, author, book });
      }
    }
  }
  return out;
}

// list all leaf pages in a book (for [...slug] page)
export async function listAllPages(): Promise<PageParams[]> {
  const books = await listAllBooks();
  const out: PageParams[] = [];
  for (const { subject, author, book } of books) {
    const treeRaw = await fs.readFile(
      path.join(
        CONTENT_DIR,
        subject,
        author,
        book,
        'tree.json'
      ),
      'utf-8'
    );
    const tree = JSON.parse(treeRaw) as Array<{
      slug: string;
      children: any[];
    }>;
    function walk(nodes: typeof tree, prefix: string[] = []) {
      for (const node of nodes) {
        const here = [ ...prefix, node.slug ];
        if (!node.children?.length) {
          out.push({ subject, author, book, slug: here });
        } else {
          walk(node.children, here);
        }
      }
    }
    walk(tree);
  }
  return out;
}

// load a book's config.json
export async function loadConfig(params: BookParams): Promise<Config> {
  const raw = await fs.readFile(
    path.join(
      CONTENT_DIR,
      params.subject,
      params.author,
      params.book,
      'config.json'
    ),
    'utf-8'
  );
  return ConfigSchema.parse(JSON.parse(raw));
}

// load a book's tree.json
export async function loadTree(params: BookParams): Promise<Node[]> {
  const raw = await fs.readFile(
    path.join(
      CONTENT_DIR,
      params.subject,
      params.author,
      params.book,
      'tree.json'
    ),
    'utf-8'
  );
  return TreeSchema.parse(JSON.parse(raw));
}

// load a markdown page, parse front-matter + HTML
export async function loadPage(
  params: PageParams
): Promise<Content> {
  const mdRaw = await fs.readFile(
    path.join(
      CONTENT_DIR,
      params.subject,
      params.author,
      params.book,
      ...params.slug,
      'index.md'
    ),
    'utf-8'
  );
  const { data, content } = matter(mdRaw);
  const processed = await remark().use(html).process(content);
  const parsed = ContentSchema.parse({
    title:
      typeof data.title === 'string' ? data.title : undefined,
    excerpt:
      typeof data.excerpt === 'string'
        ? data.excerpt
        : undefined,
    contentHtml: processed.toString(),
  });
  return parsed;
}