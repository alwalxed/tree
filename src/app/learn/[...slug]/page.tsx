import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { getContentNode } from "@/lib/content/operations/get-content-node";
import { getTreeSlugs } from "@/lib/content/operations/get-tree-slugs";
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

  const markdown = await getContentNode(slugPath);

  if (!markdown) {
    return {
      title: "Not Found",
      description: "The requested documentation page could not be found.",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  const description =
    markdown.excerpt ||
    (markdown.contentHtml
      ? markdown.contentHtml
          .replace(/<[^>]*>/g, "")
          .slice(0, 160)
          .trim() + "..."
      : "");

  const canonicalSlug = slugPath.join("/");

  return {
    title: markdown.title,
    description,
    openGraph: {
      title: markdown.title,
      description,
      type: "article",
      url: `/learn/${canonicalSlug}`,
      images: previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: markdown.title,
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

  const markdown = await getContentNode(slugPath);

  if (!markdown) {
    notFound();
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>{markdown.title}</h1>

      {markdown.contentHtml ? (
        <MarkdownRenderer content={markdown.contentHtml} />
      ) : (
        <p className="text-muted">No content available for this section.</p>
      )}
    </article>
  );
}
