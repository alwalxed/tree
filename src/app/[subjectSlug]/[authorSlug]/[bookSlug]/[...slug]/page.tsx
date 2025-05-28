import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { loadSpecificPage } from '@/lib/content/core/specific-page-loader';
import { getTreeSlugs } from '@/lib/content/query/get-all-paths';

import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

type Params = {
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
  slug: string[];
};

type Props = {
  params: Params;
};

// Static paths
export async function generateStaticParams() {
  const allPaths = await getTreeSlugs();
  return allPaths
    .filter((path) => path.length > 3)
    .map((path) => ({
      subjectSlug: path[0],
      authorSlug: path[1],
      bookSlug: path[2],
      slug: path.slice(3),
    }));
}

// Metadata generation
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { authorSlug, bookSlug, slug, subjectSlug } = params;
  const fullSlugPath = [subjectSlug, authorSlug, bookSlug, ...slug];

  const contentNode = await loadSpecificPage(fullSlugPath);

  if (!contentNode) {
    return {
      title: 'Not Found',
      description: 'The requested content page could not be found.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const description =
    contentNode.excerpt ||
    (contentNode.contentHtml
      ? contentNode.contentHtml
          .replace(/<[^>]*>/g, '')
          .slice(0, 160)
          .trim() + '...'
      : `Content for ${contentNode.title}`);

  const canonicalPath = `/${fullSlugPath.join('/')}`;

  return {
    title: contentNode.title,
    description,
    openGraph: {
      title: contentNode.title,
      description,
      type: 'article',
      url: canonicalPath,
      images: previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: contentNode.title,
      description,
      images: previousImages,
    },
    alternates: {
      canonical: canonicalPath,
    },
  };
}

// Page
export default async function ContentPage({ params }: Props) {
  const { authorSlug, bookSlug, slug, subjectSlug } = params;
  const fullSlugPath = [subjectSlug, authorSlug, bookSlug, ...slug];

  const contentNode = await loadSpecificPage(fullSlugPath);

  if (!contentNode) {
    notFound();
  }

  return (
    <article className="prose prose-slate dark:prose-invert mx-auto max-w-4xl p-6">
      <h1>{contentNode.title}</h1>

      {contentNode.pageTitle && contentNode.pageTitle !== contentNode.title && (
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
