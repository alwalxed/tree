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
    console.log('Starting to list all books from:', CONTENT_DIR);

    const subjects = await fs.readdir(CONTENT_DIR);
    console.log('Found subjects:', subjects);

    for (const subject of subjects) {
      const subjectPath = path.join(CONTENT_DIR, subject);
      const subjectStat = await fs.stat(subjectPath);

      if (!subjectStat.isDirectory()) {
        console.log(`Skipping ${ subject } - not a directory`);
        continue;
      }

      console.log(`Processing subject: ${ subject }`);
      const authors = await fs.readdir(subjectPath);
      console.log(`Found authors in ${ subject }:`, authors);

      for (const author of authors) {
        const authorPath = path.join(subjectPath, author);
        const authorStat = await fs.stat(authorPath);

        if (!authorStat.isDirectory()) {
          console.log(`Skipping ${ author } - not a directory`);
          continue;
        }

        console.log(`Processing author: ${ author }`);
        const books = await fs.readdir(authorPath);
        console.log(`Found books for ${ author }:`, books);

        for (const book of books) {
          const bookPath = path.join(authorPath, book);
          const bookStat = await fs.stat(bookPath);

          if (bookStat.isDirectory()) {
            console.log(`Adding book: ${ subject }/${ author }/${ book }`);
            out.push({ subject, author, book });
          } else {
            console.log(`Skipping ${ book } - not a directory`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error listing all books:', error);
    throw error;
  }

  console.log('Final book list:', out);
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
          const newPathParts = [ ...currentPathParts, node.slugWithPrefix ];
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
        `Error processing tree.json for ${ subject }/${ author }/${ book }:`,
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
