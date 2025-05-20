import { Button } from "@/components/ui/button";
import { getDocsTree } from "@/lib/docs";
import { ArrowRight, Folder } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Documentation",
  description: "Browse all documentation sections",
};

export default async function DocsPage() {
  const docsTree = await getDocsTree();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>
      <p className="mb-8 text-lg">
        Welcome to the documentation. Select a section to get started.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {docsTree.map((section) => (
          <div
            key={section.slug}
            className="border rounded-lg p-6 bg-white dark:bg-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <Folder className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>

            {section.excerpt && (
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {section.excerpt}
              </p>
            )}

            {section.children && section.children.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-500 mb-2">
                  Topics:
                </p>
                <ul className="space-y-1">
                  {section.children.slice(0, 3).map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/docs/${child.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                  {section.children.length > 3 && (
                    <li className="text-sm text-slate-500">
                      +{section.children.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            <Button asChild variant="outline" size="sm">
              <Link href={`/docs/${section.slug}`}>
                Browse Section
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
