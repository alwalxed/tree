import { DevDebuggers } from '@/components/debug';
import { Sidebar } from '@/components/layout/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { CONTENT_URL } from '@/config/site';
import { filterString } from '@/lib/common/filter-string';
import { TreeSchema, type Node } from '@/lib/schema/bookTree';

type Params = Promise<{
  subject: string;
  author: string;
  book: string;
  slug: string[];
}>;

type Props = {
  children: React.ReactNode;
  params: Params;
};

export default async function BookLayout({ children, params }: Props) {
  console.info('RAN: src/app/[subject]/[author]/[book]/layout.tsx');
  const { subject, author, book } = await params;

  // 1) fetch + validate tree.json
  const treeRes = await fetch(
    `${CONTENT_URL}/${subject}/${author}/${book}/tree.json`
  );
  if (!treeRes.ok) throw new Error('Failed to fetch TREE');
  const treeJSON = await treeRes.json();
  const parsed = TreeSchema.safeParse(treeJSON);
  if (!parsed.success) throw parsed.error;
  const tree: Node[] = parsed.data;

  // 2) build bookUrlPath & label
  const bookUrlPath = `/${filterString({
    input: [
      decodeURIComponent(subject),
      decodeURIComponent(author),
      decodeURIComponent(book),
    ].join('/'),
    options: {
      arabicLetters: true,
      underscores: true,
      forwardSlashes: true,
    },
  })}/`;

  const label = filterString({
    input: decodeURIComponent(book),
    options: { arabicLetters: true, underscores: true },
  }).replace('_', ' ');

  return (
    <>
      <DevDebuggers tree={tree} />
      <SidebarProvider>
        {/*
          Pass three *separate* props instead of one big object
          so we don’t accidentally recreate it on every client re-render
        */}
        <Sidebar tree={tree} bookUrlPath={bookUrlPath} label={label} />
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
