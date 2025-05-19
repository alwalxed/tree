import MarkdownRenderer from "@/components/markdown-renderer";
import { getAllDocSlugs, getDocBySlug } from "@/lib/docs";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// This generates all existing paths at build time
export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs;
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get the document
  const resolvedParams = await params;
  const doc = await getDocBySlug(resolvedParams.slug);

  // If doc doesn't exist, return minimal metadata
  if (!doc) {
    return {
      title: "Not Found",
      description: "The requested documentation page could not be found.",
    };
  }

  // Get the parent metadata (from layout)
  const previousImages = (await parent).openGraph?.images || [];

  // Create a description from the content
  // Strip HTML tags and limit to ~160 characters
  const description =
    doc.excerpt ||
    doc.content
      .replace(/<[^>]*>/g, "")
      .slice(0, 160)
      .trim() + "...";

  return {
    title: doc.title,
    description,
    keywords: doc.keywords || [],
    authors: doc.author ? [{ name: doc.author }] : undefined,
    openGraph: {
      title: doc.title,
      description,
      type: "article",
      publishedTime: doc.date,
      url: `/docs/${resolvedParams.slug}`,
      images: doc.coverImage
        ? [doc.coverImage, ...previousImages]
        : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description,
      images: doc.coverImage ? [doc.coverImage] : undefined,
    },
    alternates: {
      canonical: `/docs/${resolvedParams.slug}`,
    },
  };
}

export default async function DocPage({ params }: Props) {
  const resolvedParams = await params;
  const doc = await getDocBySlug(resolvedParams.slug);

  // If the doc doesn't exist, return a 404
  if (!doc) {
    notFound();
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>{doc.title}</h1>
      {doc.date && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(doc.date).toLocaleDateString()}
        </p>
      )}
      <MarkdownRenderer content={doc.content} />
    </article>
  );
}
