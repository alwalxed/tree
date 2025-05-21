import MarkdownRenderer from "@/components/markdown-renderer";
import { getNodeBySlug, getTreeSlugs } from "@/lib/markdown/tree-helpers";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  const slugs = await getTreeSlugs();

  return slugs.map((slugParts) => ({
    slug: slugParts,
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug;

  const doc = await getNodeBySlug(slugPath);

  if (!doc) {
    return {
      title: "Not Found",
      description: "The requested documentation page could not be found.",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  const description =
    doc.excerpt ||
    (doc.contentHtml
      ? doc.contentHtml
          .replace(/<[^>]*>/g, "")
          .slice(0, 160)
          .trim() + "..."
      : "");

  const canonicalSlug = slugPath.join("/");

  return {
    title: doc.title,
    description,
    openGraph: {
      title: doc.title,
      description,
      type: "article",
      url: `/learn/${canonicalSlug}`,
      images: previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description,
      images: previousImages,
    },
    alternates: {
      canonical: `/learn/${canonicalSlug}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug;

  const doc = await getNodeBySlug(slugPath);

  if (!doc) {
    notFound();
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>{doc.title}</h1>

      {doc.contentHtml ? (
        <MarkdownRenderer content={doc.contentHtml} />
      ) : (
        <p className="text-muted">No content available for this section.</p>
      )}
    </article>
  );
}
