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

  const decoded = {
    subject: decodeURIComponent(subjectSlug),
    author: decodeURIComponent(authorSlug),
    book: decodeURIComponent(bookSlug),
  };

  const bookPath = path.join(
    CONTENT_PATH,
    decoded.subject,
    decoded.author,
    decoded.book
  );

  // 1) Does the folder structure exist?
  const valid = await validateBookPath({
    subjectSlug: decoded.subject,
    authorSlug: decoded.author,
    bookSlug: decoded.book,
  });
  if (!valid) {
    console.warn(`Bad path or missing folder at ${bookPath}`);
    notFound();
  }

  // 2) Is there at least one index.md anywhere inside?
  const hasContentFlag = await hasBookContent({ bookPath });
  if (!hasContentFlag) {
    console.warn(`No index.md found under ${bookPath}`);
    notFound();
  }

  // 3) Build the sidebar tree
  const sidebarData = {
    tree: await buildTree({
      contentPath: bookPath,
      dirNames: [],
      slugs: [],
      depth: 0,
    }),
    label: filterString({
      input: decoded.book,
      options: { arabicLetters: true, underscores: true },
    }).replace('_', ' '),
    bookLandingPath: `/${filterString({
      input: Object.values(decoded).join('/'),
      options: {
        arabicLetters: true,
        underscores: true,
        forwardSlashes: true,
      },
    })}`,
  };
  return (
    <>
      <DevDebuggers tree={sidebarData.tree} />
      <SidebarProvider>
        <Sidebar
          tree={sidebarData.tree}
          label={sidebarData.label}
          bookLandingPath={sidebarData.bookLandingPath}
        />
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
