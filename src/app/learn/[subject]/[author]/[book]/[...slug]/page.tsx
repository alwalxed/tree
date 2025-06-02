import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { CONTENT_URL } from '@/config/site';
import { ContentSchema, type Content } from '@/lib/schema/bookContent';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';

export const runtime = 'edge';

type Params = {
  subject: string;
  author: string;
  book: string;
  slug: string[];
};

function safeDecodeURIComponent(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function buildContentUrl(
  subject: string,
  author: string,
  book: string,
  slugSegments: string[],
  filename = 'index.md'
): string {
  const base = CONTENT_URL.replace(/\/$/, '');
  const parts = [subject, author, book, ...slugSegments, filename];
  const path = parts.map((p) => encodeURIComponent(p)).join('/');
  return `${base}/${path}`;
}

export default async function ContentPage({
  params: rawParamsPromise,
}: {
  params: Promise<Params>;
}) {
  const rawParams = await rawParamsPromise;

  const subject = safeDecodeURIComponent(rawParams.subject);
  const author = safeDecodeURIComponent(rawParams.author);
  const book = safeDecodeURIComponent(rawParams.book);
  const slugSegments = rawParams.slug.map(safeDecodeURIComponent);

  const url = buildContentUrl(subject, author, book, slugSegments);

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return notFound();
    }

    const rawMarkdown = await res.text();

    const { data: fm, content: markdownBody } = matter(rawMarkdown);

    const processed = await remark().use(html).process(markdownBody);
    const contentHtml = processed.toString();

    const parsed = ContentSchema.safeParse({
      title: typeof fm.title === 'string' ? fm.title : undefined,
      excerpt: typeof fm.excerpt === 'string' ? fm.excerpt : undefined,
      contentHtml,
    });

    if (!parsed.success) {
      console.error(parsed.error);
      throw new Error('Invalid content schema');
    }

    const content: Content = parsed.data;

    return (
      <article className="prose prose-slate dark:prose-invert mx-auto max-w-4xl p-6">
        <h1>{content.title || 'Untitled Page'}</h1>
        {content.excerpt && (
          <p className="lead text-muted-foreground">{content.excerpt}</p>
        )}
        <MarkdownRenderer content={content.contentHtml} />
      </article>
    );
  } catch (e) {
    console.error('Error fetching or parsing content:', e);
    return notFound();
  }
}
