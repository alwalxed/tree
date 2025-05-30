import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { FILESYSTEM_CONTENT_PATH } from '@/lib/content/constants';
import { loadSpecificPage } from '@/lib/content/core/specific-page-loader';

import { notFound } from 'next/navigation';

type Params = {
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
  slug: string[];
};

type Props = {
  params: Promise<Params>;
};

export default async function Page({ params }: Props) {
  const { subjectSlug, authorSlug, bookSlug, slug } = await params;

  const decodedSlugs = {
    subject: decodeURIComponent(subjectSlug),
    author: decodeURIComponent(authorSlug),
    book: decodeURIComponent(bookSlug),
    slug: slug.map((item) => decodeURIComponent(item)),
  };

  const contentNode = await loadSpecificPage({
    fileSystemBasePath: FILESYSTEM_CONTENT_PATH,
    contentPath: {
      subjectSlug: decodedSlugs.subject,
      authorSlug: decodedSlugs.author,
      bookSlug: decodedSlugs.book,
      slug: decodedSlugs.slug,
    },
  });

  if (!contentNode) {
    notFound();
  }

  return (
    <article className="prose prose-slate dark:prose-invert mx-auto max-w-4xl p-6">
      <h1>{contentNode.pageTitle}</h1>

      {contentNode.pageTitle &&
        contentNode.pageTitle !== contentNode.pageTitle && (
          <p className="lead text-muted-foreground">
            (From Frontmatter: {contentNode.pageTitle})
          </p>
        )}

      {contentNode.contentHtml ? (
        <MarkdownRenderer content={contentNode.contentHtml} />
      ) : (
        <p className="text-muted-foreground">
          No content available for this section.
        </p>
      )}
    </article>
  );
}
