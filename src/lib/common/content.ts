import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import { deslugify } from 'reversible-arabic-slugifier';
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
    const subjects = await fs.readdir(CONTENT_DIR);

    for (const subject of subjects) {
      const subjectPath = path.join(CONTENT_DIR, subject);
      const subjectStat = await fs.stat(subjectPath);

      if (!subjectStat.isDirectory()) {
        console.log(`Skipping ${ subject } - not a directory`);
        continue;
      }

      const authors = await fs.readdir(subjectPath);

      for (const author of authors) {
        const authorPath = path.join(subjectPath, author);
        const authorStat = await fs.stat(authorPath);

        if (!authorStat.isDirectory()) {
          console.log(`Skipping ${ author } - not a directory`);
          continue;
        }

        const books = await fs.readdir(authorPath);

        for (const book of books) {
          const bookPath = path.join(authorPath, book);
          const bookStat = await fs.stat(bookPath);

          if (bookStat.isDirectory()) {
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

  return out;
}

export async function listAllPages(): Promise<PageParams[]> {
  const books = await listAllBooks();
  const out: PageParams[] = [];

  if (books.length === 0) {
    console.log('No books found by listAllBooks, so no pages will be listed.');
    return out;
  }

  for (const { subject, author, book } of books) {
    const bookPathIdentifier = `${ subject }/${ author }/${ book }`;

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
        console.error(
          `Error parsing tree.json for ${ bookPathIdentifier }:`,
          parsed.error
        );
        throw parsed.error;
      }

      const tree = parsed.data;

      async function walkTreeForPages(
        nodes: Node[],
        currentPathParts: string[] = []
      ) {
        for (const node of nodes) {
          const newPathParts = [ ...currentPathParts, node.slugWithPrefix ];

          if (!node.children || node.children.length === 0) {
            const filePath = path.join(
              CONTENT_DIR,
              subject,
              author,
              book,
              ...newPathParts,
              'index.md'
            );

            try {
              await fs.access(filePath);
              out.push({ subject, author, book, slug: newPathParts });

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              console.warn(
                `Warning: Expected file does not exist: ${ filePath }. Skipping this page.`
              );
            }
          } else {
            await walkTreeForPages(node.children, newPathParts);
          }
        }
      }

      await walkTreeForPages(tree);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(
          `Warning: tree.json not found for ${ bookPathIdentifier } at ${ treeFilePath }. Skipping this book for page listing.`
        );
      } else {
        console.error(
          `Error processing tree.json or walking tree for ${ bookPathIdentifier }:`,
          error
        );
        throw error;
      }
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

  try {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error(`File not found: ${ filePath }`);
    throw new Error(`Content file not found: ${ filePath }`);
  }
}

export function urlParamsToFileSystemPath(urlParams: string[]): string[] {
  return urlParams.map(deslugify);
}
