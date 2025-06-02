import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { listAllPages, loadPage } from '@/lib/common/content';
import type { Content } from '@/lib/schema/bookContent';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listAllPages()).map((p) => ({
    subject: encodeURIComponent(p.subject),
    author: encodeURIComponent(p.author),
    book: encodeURIComponent(p.book),
    slug: p.slug.map(encodeURIComponent),
  }));
}

export default async function ContentPage({
  params: { subject, author, book, slug },
}: {
  params: {
    subject: string;
    author: string;
    book: string;
    slug: string[];
  };
}) {
  const real = {
    subject: decodeURIComponent(subject),
    author: decodeURIComponent(author),
    book: decodeURIComponent(book),
    slug: slug.map(decodeURIComponent),
  };
  const content: Content = await loadPage(real);
  return (
    <article className="prose mx-auto max-w-4xl p-6">
      <h1>{content.title ?? 'Untitled'}</h1>
      {content.excerpt && <p className="lead">{content.excerpt}</p>}
      <MarkdownRenderer content={content.contentHtml} />
    </article>
  );
}
