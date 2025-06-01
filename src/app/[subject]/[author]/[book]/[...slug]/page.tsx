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

export default async function ContentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { subject, author, book, slug } = await params;

  // at request‐time (Edge) we simply fetch your JSON‐ified markdown
  const url = `${CONTENT_URL}/${subject}/${author}/${book}/${slug.join(
    '/'
  )}/index.md`;
  const res = await fetch(url);
  if (!res.ok) return notFound();

  const json = await res.json();
  const parsed = ContentSchema.safeParse(json);
  if (!parsed.success) throw parsed.error;

  const content: Content = parsed.data;

  return (
    <article className="prose prose-slate dark:prose-invert mx-auto max-w-4xl p-6">
      <h1>{content.title || 'Untitled Page'}</h1>
      {content.excerpt && (
        <p className="lead text-muted-foreground">{content.excerpt}</p>
      )}
    </article>
  );
}
