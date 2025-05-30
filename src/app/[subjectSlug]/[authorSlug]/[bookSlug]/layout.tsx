import { DevDebuggers } from '@/components/debug';
import { Sidebar } from '@/components/layout/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { filterString } from '@/lib/common/filter-string';
import { buildBookTree } from '@/lib/content/buildTree';
import { FILESYSTEM_CONTENT_PATH } from '@/lib/content/common/constants';
import type { SidebarConfig } from '@/lib/content/common/types';
import { hasContentIndex } from '@/lib/content/utils/fs-utils';
import { validateBookPath } from '@/lib/content/validatePath';

import { notFound } from 'next/navigation';
import path from 'path';

type Params = {
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
  slug: string[];
};

type Props = {
  children: React.ReactNode;
  params: Promise<Params>;
};

export default async function Layout({ children, params }: Props) {
  const { subjectSlug, authorSlug, bookSlug } = await params;

  // 1) Decode the URL-encoded slugs
  const decodedSlugs = {
    subject: decodeURIComponent(subjectSlug),
    author: decodeURIComponent(authorSlug),
    book: decodeURIComponent(bookSlug),
  };

  // 2) Absolute filesystem path to the book folder
  const bookDirectoryPath = path.join(
    FILESYSTEM_CONTENT_PATH,
    decodedSlugs.subject,
    decodedSlugs.author,
    decodedSlugs.book
  );

  // 3) Verify the folder actually exists
  const isBookPathValid = await validateBookPath({
    subjectSlug: decodedSlugs.subject,
    authorSlug: decodedSlugs.author,
    bookSlug: decodedSlugs.book,
  });

  if (!isBookPathValid) {
    console.warn(`Bad path or missing folder at ${bookDirectoryPath}`);
    notFound();
  }

  // 4) Check that there’s at least one index.md inside
  const containsIndexMd = await hasContentIndex(bookDirectoryPath);

  if (!containsIndexMd) {
    console.warn(`No index.md found under ${bookDirectoryPath}`);
    notFound();
  }

  // 5) Build a safe URL path for the book
  const bookUrlPath = `/${filterString({
    input: Object.values(decodedSlugs).join('/'),
    options: {
      arabicLetters: true,
      underscores: true,
      forwardSlashes: true,
    },
  })}/`;

  const bookTree = await buildBookTree({
    fileSystemBasePath: bookDirectoryPath,
    prefix: bookUrlPath,
    dirNames: [],
    slugs: [],
    depth: 0,
  });

  if (!bookTree) {
    console.warn('No book tree');
    notFound();
  }

  // 6) Build the sidebar tree data
  const sidebarConfig: SidebarConfig = {
    bookUrlPath,
    tree: bookTree,
    label: filterString({
      input: decodedSlugs.book,
      options: { arabicLetters: true, underscores: true },
    }).replace('_', ' '),
  };

  return (
    <>
      <DevDebuggers tree={sidebarConfig.tree} />
      <SidebarProvider>
        <Sidebar sidebarConfig={sidebarConfig} />
        <SidebarInset className="px-4 py-6 md:px-8">
          <header className="mb-4 flex items-center">
            <SidebarTrigger className="cursor-pointer" />
          </header>
          <main className="pb-16">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
