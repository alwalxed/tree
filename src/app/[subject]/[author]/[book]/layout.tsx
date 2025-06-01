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

export const runtime = 'edge';

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

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<Params>;
// }): Promise<Metadata> {
//   const { subject, author, book } = await params;
//   const decoded = {
//     subject: decodeURIComponent(subject),
//     author: decodeURIComponent(author),
//     book: decodeURIComponent(book),
//   };

//   const bookDir = path.join(
//     FILESYSTEM_CONTENT_PATH,
//     decoded.subject,
//     decoded.author,
//     decoded.book
//   );

//   const config = await loadBookConfig(bookDir);

//   const title = config?.title ?? decoded.book;
//   const description = config?.description ?? `المحتوى لكتاب:  ${decoded.book}`;

//   const safePath = `/${filterString({
//     input: [decoded.subject, decoded.author, decoded.book].join('/'),
//     options: { arabicLetters: true, underscores: true, forwardSlashes: true },
//   })}/`;

//   return {
//     title,
//     description,
//     alternates: { canonical: SITE_URL + safePath },
//     openGraph: {
//       title,
//       description,
//       url: SITE_URL + safePath,
//       siteName: 'شجرة',
//     },
//   };
// }

export default async function Layout({ children, params }: Props) {
  const { subject, author, book } = await params;
  console.log(subject);
  console.log(author);
  console.log(book);

  const treeRes = await fetch(
    `${CONTENT_URL}/${subject}/${author}/${book}/tree.json`
  );

  if (!treeRes.ok) {
    throw new Error('Failed to fetch TREE');
  }

  const treeJSON = await treeRes.json();
  const treeParsed = TreeSchema.safeParse(treeJSON);

  if (!treeParsed.success) {
    throw treeParsed.error;
  }

  const treeParsedData = treeParsed.data;

  // 5) Build a safe URL path for the book
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

  // 6) Build the sidebar tree data
  const sidebarConfig: {
    bookUrlPath: string;
    tree: Node[];
    label: string;
  } = {
    bookUrlPath,
    tree: treeParsedData,
    label: filterString({
      input: decodeURIComponent(book),
      options: { arabicLetters: true, underscores: true },
    }).replace('_', ' '),
  };

  return (
    <>
      <DevDebuggers tree={treeParsedData} />
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
