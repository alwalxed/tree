import MarkdownRenderer from "@/components/markdown-renderer";
import { getAllDocSlugs, getDocBySlug } from "@/lib/docs";
import { notFound } from "next/navigation";

// This generates all existing paths at build time
export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs;
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const doc = await getDocBySlug(resolvedParams.slug);

  // If the doc doesn't exist, return a 404
  if (!doc) {
    notFound();
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>{doc.title}</h1>
      <MarkdownRenderer content={doc.content} />
    </article>
  );
}
