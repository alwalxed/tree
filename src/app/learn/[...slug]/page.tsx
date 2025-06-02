import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { Section } from '@/components/common/section';
import { VisualizationSwitcher } from '@/components/visualizations/visualization-switcher';
import {
  listAllBooks,
  listAllPages,
  loadConfig,
  loadPage,
  loadTree,
} from '@/lib/common/content';
import type { Content } from '@/lib/schema/bookContent';
import { Node } from '@/lib/schema/bookTree';

export async function generateStaticParams() {
  try {
    const pages = await listAllPages();
    const books = await listAllBooks();

    const pageParams = pages.map((p) => ({
      slug: [p.subject, p.author, p.book, ...p.slug],
    }));

    const rootParams = books.map(({ subject, author, book }) => ({
      slug: [subject, author, book],
    }));

    const allParams = [...pageParams, ...rootParams];
    return allParams;
  } catch (error) {
    throw error;
  }
}

type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function ContentPage({ params }: Props) {
  const awaitedParams = await params;
  const parts = awaitedParams.slug;

  if (parts.length < 3) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-red-600">
        ❌ Invalid URL: missing subject/author/book
      </div>
    );
  }

  const decodedParts = parts.map(decodeURIComponent);
  const [subject, author, book, ...restSlug] = decodedParts;

  const real = {
    subject,
    author,
    book,
    slug: restSlug,
  } as const;

  if (restSlug.length === 0) {
    try {
      const cfg = await loadConfig(real);
      const tree = await loadTree(real);

      return (
        <div className="mx-auto max-w-4xl space-y-12 p-6">
          {cfg.sections?.map((sec, i) => {
            if (sec.type === 'text') {
              return (
                <Section key={i}>
                  <Section.H level={2}>{sec.title}</Section.H>
                  <Section.P>
                    {sec.content.map((line, j) => (
                      <span key={j}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </Section.P>
                </Section>
              );
            }
            if (sec.type === 'visualization') {
              const nodes = (tree as Node[]).filter((n) =>
                n.title.includes(sec.chapterIdentifier)
              );
              return (
                <Section key={i}>
                  <Section.H level={2}>{sec.title}</Section.H>
                  <VisualizationSwitcher nodes={nodes} />
                </Section>
              );
            }
            return null;
          })}
        </div>
      );
    } catch (error) {
      throw error;
    }
  }

  try {
    const content: Content = await loadPage(real);
    return (
      <article className="prose mx-auto max-w-4xl p-6">
        <h1>{content.title ?? 'Untitled'}</h1>
        {content.excerpt && <p className="lead">{content.excerpt}</p>}
        <MarkdownRenderer content={content.contentHtml} />
      </article>
    );
  } catch (error) {
    throw error;
  }
}
