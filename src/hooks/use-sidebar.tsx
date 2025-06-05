import type { Node } from '@/lib/schema/bookTree';
import { usePathname } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { slugify } from 'reversible-arabic-slugifier';

export const LEARN_BASE = '/learn';

export type FlatSidebarItem = {
  node: Node;
  level: number;
  parentNodeFullPath?: string;
  href: string;
};

export function useSidebar({
  tree,
  bookUrlPath,
}: {
  tree: Node[];
  bookUrlPath: string;
}) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const homeHref = buildLearnHref(bookUrlPath);

  const toggleSection = useCallback((path: string) => {
    setExpandedSections((prev) => ({ ...prev, [path]: !prev[path] }));
  }, []);

  const isCurrentPage = useCallback(
    (itemPathOrHome: string) => {
      const norm = (u: string) =>
        u !== '/' && u.endsWith('/') ? u.slice(0, -1) : u;
      const current = norm(pathname);
      if (itemPathOrHome === '__home') {
        return current === norm(homeHref);
      }
      return current === norm(buildLearnHref(itemPathOrHome));
    },
    [pathname, homeHref]
  );

  const buildNodeHref = useCallback((node: Node): string => {
    const urlSafeSlug = node.urlSafeSlug || slugify(node.slugWithPrefix);

    const buildUrlSafePath = (targetNode: Node): string => {
      const pathParts: string[] = [];

      if (targetNode.parentPathWithPrefixedSlugs) {
        pathParts.push(...targetNode.parentPathWithPrefixedSlugs.map(slugify));
      }

      pathParts.push(urlSafeSlug);

      return `/${pathParts.join('/')}`;
    };

    const urlSafePath = buildUrlSafePath(node);
    return buildLearnHref(urlSafePath);
  }, []);

  const flatItems = useMemo<FlatSidebarItem[]>(() => {
    function walk(nodes: Node[], lvl = 0, parent?: string): FlatSidebarItem[] {
      const out: FlatSidebarItem[] = [];
      for (const nd of nodes) {
        out.push({
          node: nd,
          level: lvl,
          parentNodeFullPath: parent,
          href: buildNodeHref(nd),
        });
        if (nd.children.length) {
          out.push(...walk(nd.children, lvl + 1, nd.fullPathWithPrefixes));
        }
      }
      return out;
    }
    return walk(tree);
  }, [tree, buildNodeHref]);

  const getAllPathsWithChildren = useCallback((nodes: Node[]): string[] => {
    let paths: string[] = [];
    for (const node of nodes) {
      if (node.children.length > 0) {
        paths.push(node.fullPathWithPrefixes);
        paths = paths.concat(getAllPathsWithChildren(node.children));
      }
    }
    return paths;
  }, []);

  const expandAll = useCallback(() => {
    const allPaths = getAllPathsWithChildren(tree);
    const expanded: Record<string, boolean> = {};
    allPaths.forEach((p) => (expanded[p] = true));
    setExpandedSections(expanded);
  }, [tree, getAllPathsWithChildren]);

  const collapseAll = useCallback(() => {
    setExpandedSections({});
  }, []);

  const toggleAll = useCallback(() => {
    const allPaths = getAllPathsWithChildren(tree);
    const someExpanded = allPaths.some((path) => expandedSections[path]);
    if (someExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  }, [expandedSections, collapseAll, expandAll, getAllPathsWithChildren, tree]);

  return useMemo(
    () => ({
      flatItems,
      expandedSections,
      toggleSection,
      isCurrentPage,
      toggleAll,
      homeHref,
      buildNodeHref,
    }),
    [
      flatItems,
      expandedSections,
      toggleSection,
      isCurrentPage,
      toggleAll,
      homeHref,
      buildNodeHref,
    ]
  );
}

export function buildLearnHref(raw: string): string {
  let p = raw === '/' ? '' : raw.endsWith('/') ? raw.slice(0, -1) : raw;
  if (!p.startsWith('/')) p = '/' + p;
  return LEARN_BASE + p;
}

export function convertToUrlSafePath(arabicPath: string): string {
  return arabicPath.split('/').filter(Boolean).map(slugify).join('/');
}
