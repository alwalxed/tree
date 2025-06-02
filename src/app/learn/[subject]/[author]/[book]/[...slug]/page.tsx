// [subject]/[author]/[book]/[...slug]/page.tsx
import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { CONTENT_URL } from '@/config/site';
import { ContentSchema, type Content } from '@/lib/schema/bookContent';
import { notFound } from 'next/navigation';

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

/**
 * Turn an array of path‐segments + a filename into a proper URL.
 */
function buildContentUrl(
  subject: string,
  author: string,
  book: string,
  slugSegments: string[],
  filename = 'index.md'
): string {
  // 1) Clamp off any trailing slash
  const base = CONTENT_URL.replace(/\/$/, '');
  // 2) Build ["subject","author","book",...slugSegments,"index.md"]
  const parts = [subject, author, book, ...slugSegments, filename];
  // 3) encode each part, then join with literal '/'
  const path = parts.map((p) => encodeURIComponent(p)).join('/');
  return `${base}/${path}`;
}

export default async function ContentPage({
  params: rawParamsPromise,
}: {
  params: Promise<Params>;
}) {
  const rawParams = await rawParamsPromise;

  // decode each segment once
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

    const json = await res.json();
    const parsed = ContentSchema.safeParse(json);
    if (!parsed.success) {
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
    console.error('Error fetching content:', e);
    return notFound();
  }
}
