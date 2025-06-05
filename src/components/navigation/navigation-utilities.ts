import type { Node } from '@/lib/schema/bookTree';
import { slugify } from 'reversible-arabic-slugifier';

export type PageInfo = {
  title: string;
  href: string;
  slug: string[];
  depth: number;
};

export class NavigationHelper {
  private pages: PageInfo[] = [];
  private bookBasePath: string;

  constructor(tree: Node[], bookBasePath: string) {
    this.bookBasePath = bookBasePath;
    this.buildPageList(tree);
  }

  private buildPageList(nodes: Node[], currentPath: string[] = [], depth = 0) {
    for (const node of nodes) {
      const nodePath = [ ...currentPath, node.slugWithPrefix ];

      if (node.children.length === 0) {
        // Leaf node - this is a page
        this.pages.push({
          title: node.title,
          href: this.buildHref(nodePath),
          slug: nodePath,
          depth,
        });
      } else {
        // Branch node - recurse into children
        this.buildPageList(node.children, nodePath, depth + 1);
      }
    }
  }

  private buildHref(slugPath: string[]): string {
    const urlSafePath = slugPath.map(slugify);
    return `${ this.bookBasePath }/${ urlSafePath.join('/') }`;
  }

  getNavigation(currentSlug: string[]): {
    previous?: PageInfo;
    next?: PageInfo;
    current?: PageInfo;
  } {
    const currentIndex = this.pages.findIndex(page =>
      this.slugArraysEqual(page.slug, currentSlug)
    );

    if (currentIndex === -1) {
      return {}; // Current page not found
    }

    return {
      current: this.pages[ currentIndex ],
      previous: currentIndex > 0 ? this.pages[ currentIndex - 1 ] : undefined,
      next: currentIndex < this.pages.length - 1 ? this.pages[ currentIndex + 1 ] : undefined,
    };
  }

  getAllPages(): PageInfo[] {
    return [ ...this.pages ];
  }

  getPagesAtDepth(depth: number): PageInfo[] {
    return this.pages.filter(page => page.depth === depth);
  }

  getSiblingPages(currentSlug: string[]): PageInfo[] {
    if (currentSlug.length <= 1) {
      return this.pages.filter(page => page.depth === 0);
    }

    const parentPath = currentSlug.slice(0, -1);
    return this.pages.filter(page =>
      page.slug.length === currentSlug.length &&
      this.slugArraysEqual(page.slug.slice(0, -1), parentPath)
    );
  }

  getSectionNavigation(currentSlug: string[]): {
    previous?: PageInfo;
    next?: PageInfo;
  } {
    const siblings = this.getSiblingPages(currentSlug);
    const currentIndex = siblings.findIndex(page =>
      this.slugArraysEqual(page.slug, currentSlug)
    );

    if (currentIndex === -1) {
      return {};
    }

    return {
      previous: currentIndex > 0 ? siblings[ currentIndex - 1 ] : undefined,
      next: currentIndex < siblings.length - 1 ? siblings[ currentIndex + 1 ] : undefined,
    };
  }

  private slugArraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((slug, index) => slug === b[ index ]);
  }
}

export function getBookHomeUrl(subject: string, author: string, book: string): string {
  return `/learn/${ slugify(subject) }/${ slugify(author) }/${ slugify(book) }`;
}

export function buildChapterUrl(
  subject: string,
  author: string,
  book: string,
  chapterSlug: string[]
): string {
  const baseUrl = getBookHomeUrl(subject, author, book);
  const chapterPath = chapterSlug.map(slugify).join('/');
  return `${ baseUrl }/${ chapterPath }`;
}

export function parseNavigationContext(pathname: string): {
  subject?: string;
  author?: string;
  book?: string;
  pageSlug?: string[];
  isBookRoot: boolean;
} {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[ 0 ] !== 'learn' || segments.length < 4) {
    return { isBookRoot: false };
  }

  const [ , subject, author, book, ...pageSlug ] = segments;

  return {
    subject,
    author,
    book,
    pageSlug: pageSlug.length > 0 ? pageSlug : undefined,
    isBookRoot: pageSlug.length === 0,
  };
}