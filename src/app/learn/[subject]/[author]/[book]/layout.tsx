import { DevDebuggers } from '@/components/debug';
import { Sidebar } from '@/components/layout/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { loadTree } from '@/lib/common/content';
import { filterString } from '@/lib/common/filter-string';
import type { ReactNode } from 'react';

export default async function BookLayout({
  children,
  params: { subject, author, book },
}: {
  children: ReactNode;
  params: {
    subject: string;
    author: string;
    book: string;
  };
}) {
  const real = {
    subject: decodeURIComponent(subject),
    author: decodeURIComponent(author),
    book: decodeURIComponent(book),
  };
  try {
    const tree = await loadTree(real);
    const baseUrl = `/${[real.subject, real.author, real.book]
      .map((s) =>
        filterString({
          input: s,
          options: { arabicLetters: true, underscores: true },
        })
      )
      .join('/')}/`;
    const label = filterString({
      input: real.book,
      options: { arabicLetters: true, underscores: true },
    }).replace('_', ' ');
    return (
      <>
        <DevDebuggers tree={tree} />
        <SidebarProvider>
          <Sidebar tree={tree} bookUrlPath={baseUrl} label={label} />
          <SidebarInset className="px-4 py-6 md:px-8">
            <header className="mb-4">
              <SidebarTrigger />
            </header>
            <main>{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </>
    );
  } catch {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">خطأ في تحميل الكتاب</h1>
      </div>
    );
  }
}
