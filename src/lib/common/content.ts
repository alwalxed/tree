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

export async function listAllBooks(): Promise<BookParams[]> {
  const out: BookParams[] = [];

  try {
    for (const subject of await fs.readdir(CONTENT_DIR)) {
      const subjectPath = path.join(CONTENT_DIR, subject);
      if (!(await fs.stat(subjectPath)).isDirectory()) continue;

      for (const author of await fs.readdir(subjectPath)) {
        const authorPath = path.join(subjectPath, author);
        if (!(await fs.stat(authorPath)).isDirectory()) continue;

        for (const book of await fs.readdir(authorPath)) {
          const bookPath = path.join(authorPath, book);
          if ((await fs.stat(bookPath)).isDirectory()) {
            out.push({ subject, author, book });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error listing all books:', error);
    throw error;
  }

  return out;
}

export async function listAllPages(): Promise<PageParams[]> {
  const books = await listAllBooks();
  const out: PageParams[] = [];

  for (const { subject, author, book } of books) {
    const treeFilePath = path.join(
      CONTENT_DIR,
      subject,
      author,
      book,
      'tree.json'
    );

    try {
      const treeRaw = await fs.readFile(treeFilePath, 'utf-8');
      const parsed = TreeSchema.safeParse(JSON.parse(treeRaw));

      if (!parsed.success) {
        throw parsed.error;
      }

      const tree = parsed.data;

      function walk(nodes: Node[], currentPathParts: string[] = []) {
        for (const node of nodes) {
          const newPathParts = [...currentPathParts, node.slugWithPrefix];
          if (!node.children || node.children.length === 0) {
            out.push({ subject, author, book, slug: newPathParts });
          } else {
            walk(node.children, newPathParts);
          }
        }
      }

      walk(tree);
    } catch (error) {
      console.error(
        `Error processing tree.json for ${subject}/${author}/${book}:`,
        error
      );
      throw error;
    }
  }

  return out;
}

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

  const json = JSON.parse(raw);
  const parsed = ConfigSchema.safeParse(json);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}

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

  const json = JSON.parse(raw);
  const parsed = TreeSchema.safeParse(json);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}

export async function loadPage(params: PageParams): Promise<Content> {
  const filePath = path.join(
    CONTENT_DIR,
    params.subject,
    params.author,
    params.book,
    ...params.slug,
    'index.md'
  );

  const mdRaw = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(mdRaw);

  const processed = await remark().use(html).process(content);

  const parsed = ContentSchema.safeParse({
    title: typeof data.title === 'string' ? data.title : undefined,
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : undefined,
    contentHtml: processed.toString(),
  });

  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}
