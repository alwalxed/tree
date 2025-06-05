import type { Node } from '@/lib/schema/bookTree';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { slugify } from 'reversible-arabic-slugifier';

export type NavigationItem = {
  title: string;
  href: string;
};

export type ArticleNavigationProps = {
  previousArticle?: NavigationItem;
  nextArticle?: NavigationItem;
  className?: string;
};

export function ArticleNavigation({
  previousArticle,
  nextArticle,
  className = '',
}: ArticleNavigationProps) {
  if (!previousArticle && !nextArticle) {
    return null;
  }

  return (
    <nav
      className={`mt-8 flex items-center justify-between border-t pt-6 ${className}`}
      aria-label="تنقل بين المقالات"
    >
      {/* Previous Article */}
      <div className="flex-1">
        {previousArticle && (
          <Link
            href={previousArticle.href}
            className="group hover:bg-muted/50 flex items-center space-x-2 space-x-reverse rounded-lg border p-3 transition-colors"
          >
            <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
            <div className="text-right">
              <div className="text-muted-foreground mb-1 text-xs">السابق</div>
              <div className="group-hover:text-foreground line-clamp-2 text-sm font-medium transition-colors">
                {previousArticle.title}
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Separator */}
      <div className="w-8" />

      {/* Next Article */}
      <div className="flex-1">
        {nextArticle && (
          <Link
            href={nextArticle.href}
            className="group hover:bg-muted/50 flex items-center space-x-2 rounded-lg border p-3 transition-colors"
          >
            <div className="flex-1 text-left">
              <div className="text-muted-foreground mb-1 text-xs">التالي</div>
              <div className="group-hover:text-foreground line-clamp-2 text-sm font-medium transition-colors">
                {nextArticle.title}
              </div>
            </div>
            <ChevronLeft className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
          </Link>
        )}
      </div>
    </nav>
  );
}

export function findNavigationItems(
  tree: Node[],
  currentPageSlug: string[],
  bookUrlPath: string
): { previous?: NavigationItem; next?: NavigationItem } {
  const flattenedPages: { node: Node; path: string[] }[] = [];

  function flattenTree(nodes: Node[], currentPath: string[] = []) {
    for (const node of nodes) {
      const nodePath = [...currentPath, node.slugWithPrefix];

      if (node.children.length === 0) {
        flattenedPages.push({ node, path: nodePath });
      } else {
        flattenTree(node.children, nodePath);
      }
    }
  }

  flattenTree(tree);

  const currentPageIndex = flattenedPages.findIndex(
    ({ path }) =>
      path.length === currentPageSlug.length &&
      path.every((segment, index) => segment === currentPageSlug[index])
  );

  if (currentPageIndex === -1) {
    return {}; // Current page not found
  }

  const buildPageHref = (path: string[]) => {
    const urlSafePath = path.map(slugify);
    return `/learn${bookUrlPath}/${urlSafePath.join('/')}`;
  };

  const previous =
    currentPageIndex > 0
      ? {
          title: flattenedPages[currentPageIndex - 1].node.title,
          href: buildPageHref(flattenedPages[currentPageIndex - 1].path),
        }
      : undefined;

  const next =
    currentPageIndex < flattenedPages.length - 1
      ? {
          title: flattenedPages[currentPageIndex + 1].node.title,
          href: buildPageHref(flattenedPages[currentPageIndex + 1].path),
        }
      : undefined;

  return { previous, next };
}

export function findSiblingNavigation(
  parentChildren: Node[],
  currentSlug: string,
  basePath: string
): { previous?: NavigationItem; next?: NavigationItem } {
  const currentIndex = parentChildren.findIndex(
    (child) => child.slugWithPrefix === currentSlug
  );

  if (currentIndex === -1) {
    return {};
  }

  const previous =
    currentIndex > 0
      ? {
          title: parentChildren[currentIndex - 1].title,
          href: `${basePath}/${slugify(parentChildren[currentIndex - 1].slugWithPrefix)}`,
        }
      : undefined;

  const next =
    currentIndex < parentChildren.length - 1
      ? {
          title: parentChildren[currentIndex + 1].title,
          href: `${basePath}/${slugify(parentChildren[currentIndex + 1].slugWithPrefix)}`,
        }
      : undefined;

  return { previous, next };
}
