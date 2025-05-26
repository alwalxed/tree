import { DevDebuggers } from '@/components/debug';
import { Sidebar } from '@/components/layout/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { filterString } from '@/lib/common/filter-string';
import { buildTree, CONTENT_PATH } from '@/lib/content/core/tree-builder';
import path from 'path';

type Props = {
  children: React.ReactNode;
  params: Promise<{
    subjectSlug: string;
    authorSlug: string;
    bookSlug: string;
    slug: string[];
  }>;
};

export default async function Layout({ children, params }: Props) {
  const paramsData = await params;
  const decodedSlugs = {
    subject: decodeURIComponent(paramsData.subjectSlug),
    author: decodeURIComponent(paramsData.authorSlug),
    book: decodeURIComponent(paramsData.bookSlug),
  };
  const slugs = Object.values(decodedSlugs);
  const bookPath = path.join(CONTENT_PATH, ...slugs);

  const sidebarData = {
    tree: await buildTree({
      contentPath: bookPath,
      dirNames: [],
      slugs: [],
      depth: 0,
    }),
    label: filterString({
      input: decodedSlugs.book,
      options: { arabicLetters: true, underscores: true },
    }).replace('_', ' '),
    bookLandingPath: `/${filterString({
      input: slugs.join('/'),
      options: { arabicLetters: true, underscores: true, forwardSlashes: true },
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
