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

function safeDecodeURIComponent(str: string): string {
  try {
    const decoded = decodeURIComponent(str);
    if (decoded === decodeURIComponent(decoded)) {
      return decoded;
    }
    return str;
  } catch {
    return str;
  }
}

export default async function BookLayout({ children, params }: Props) {
  const resolvedParams = await params;

  const d = {
    subject: safeDecodeURIComponent(resolvedParams.subject),
    author: safeDecodeURIComponent(resolvedParams.author),
    book: safeDecodeURIComponent(resolvedParams.book),
  };

  const treeUrl = `${CONTENT_URL}/${encodeURIComponent(d.subject)}/${encodeURIComponent(d.author)}/${encodeURIComponent(d.book)}/tree.json`;

  try {
    const treeRes = await fetch(treeUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!treeRes.ok) {
      throw new Error('Failed to fetch TREE');
    }

    const treeJSON = await treeRes.json();
    const parsed = TreeSchema.safeParse(treeJSON);

    if (!parsed.success) {
      throw parsed.error;
    }

    const tree: Node[] = parsed.data;

    const bookUrlPath = `/${[d.subject, d.author, d.book]
      .map((part) =>
        filterString({
          input: part,
          options: {
            arabicLetters: true,
            underscores: true,
            forwardSlashes: true,
          },
        })
      )
      .join('/')}/`;

    const label = filterString({
      input: d.book,
      options: { arabicLetters: true, underscores: true },
    }).replace('_', ' ');

    return (
      <>
        <DevDebuggers tree={tree} />
        <SidebarProvider>
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
  } catch (error) {
    console.error('Error in BookLayout:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">خطأ في تحميل الكتاب</h1>
          <p className="text-muted-foreground">
            حدث خطأ أثناء تحميل محتوى الكتاب
          </p>
        </div>
      </div>
    );
  }
}
