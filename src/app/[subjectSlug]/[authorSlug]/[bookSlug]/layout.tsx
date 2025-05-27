import { DevDebuggers } from '@/components/debug';
import { Sidebar } from '@/components/layout/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { filterString } from '@/lib/common/filter-string';
import { CONTENT_PATH } from '@/lib/content/constants';
import { buildTree } from '@/lib/content/core/tree-builder';
import type { SidebarConfig } from '@/lib/content/types';
import {
  hasBookContent,
  validateBookPath,
} from '@/lib/content/utils/path-utils';
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
  const bookFolderPath = path.join(
    CONTENT_PATH,
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
    console.warn(`Bad path or missing folder at ${bookFolderPath}`);
    notFound();
  }

  // 4) Check that there’s at least one index.md inside
  const containsIndexMd = await hasBookContent(bookFolderPath);

  if (!containsIndexMd) {
    console.warn(`No index.md found under ${bookFolderPath}`);
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
  })}`;

  // 6) Build the sidebar tree data
  const sidebarConfig: SidebarConfig = {
    bookUrlPath,
    tree: await buildTree({
      bookFolderPath: bookFolderPath,
      prefix: bookUrlPath,
      dirNames: [],
      slugs: [],
      depth: 0,
    }),
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
            <SidebarTrigger />
          </header>
          <main className="pb-16">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
