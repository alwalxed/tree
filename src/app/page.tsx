import { DocNode, getDocsTree } from "@/lib/docs";
import Link from "next/link";

function getFlattenedDocs(docs: DocNode[]): { title: string; slug: string }[] {
  const flat: { title: string; slug: string }[] = [];

  function walk(node: DocNode, path: string[] = []) {
    const fullPath = [...path, node.slug];
    if (node.contentHtml) {
      flat.push({
        title: node.title,
        slug: fullPath.join("/"),
      });
    }

    node.children.forEach((child) => walk(child, fullPath));
  }

  docs.forEach((doc) => walk(doc));
  return flat;
}

export default async function Home() {
  const tree = await getDocsTree();
  const docs = getFlattenedDocs(tree);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Documentation Home</h1>
      <p className="mb-8 text-lg">
        Welcome to the documentation. Select a topic from the sidebar or from
        the list below.
      </p>

      <div className="grid gap-4">
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <h2 className="text-xl font-semibold">{doc.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
