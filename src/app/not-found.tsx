import { Button } from "@/components/ui/button";
import { buildTree, type TreeNode } from "@/lib/markdown/tree-builder";
import { FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Page Not Found | Documentation",
  description: "The page you're looking for doesn't exist or has been moved.",
};

function flattenDocs(tree: TreeNode[]): TreeNode[] {
  const flat: TreeNode[] = [];

  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if (node.contentHtml || node.excerpt) {
        flat.push(node);
      }
      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(tree);
  return flat;
}

function getFullSlug(node: TreeNode): string {
  return [...node.parentPath, node.slug].join("/");
}

export default async function NotFound() {
  const tree = await buildTree();
  const flatTree = flattenDocs(tree);

  const suggestedPages = flatTree.sort(() => 0.5 - Math.random()).slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-8 rounded-full bg-slate-100 p-6 dark:bg-slate-800">
        <FileQuestion className="h-16 w-16 text-slate-500" />
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight">
        404 - Page Not Found
      </h1>

      <p className="mb-8 max-w-md text-lg text-slate-500 dark:text-slate-400">
        The documentation page you're looking for doesn't exist or has been
        moved to a new location.
      </p>

      <div className="mb-12 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/learn">
            <Search className="mr-2 h-4 w-4" />
            Browse All Docs
          </Link>
        </Button>
      </div>

      {suggestedPages.length > 0 && (
        <>
          <h2 className="mb-4 text-xl font-semibold">
            You might be interested in:
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestedPages.map((page) => (
              <Link
                key={page.slug}
                href={`/learn/${getFullSlug(page)}`}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <h3 className="font-medium">{page.title}</h3>
                {page.excerpt && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {page.excerpt.length > 80
                      ? `${page.excerpt.substring(0, 80)}...`
                      : page.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
