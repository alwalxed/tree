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
import { deslugify, slugify } from 'reversible-arabic-slugifier';

type Props = {
  children: ReactNode;
  params: Promise<{
    slug: string[];
  }>;
};

export default async function Layout({ children, params }: Props) {
  const awaitedParams = await params;
  const parts = awaitedParams.slug;

  if (parts.length < 3) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">
          ❌ Missing subject/author/book in layout
        </h1>
      </div>
    );
  }

  const decodedParts = parts.map((item) => deslugify(item));
  const [subject, author, book] = decodedParts;

  const real = {
    subject,
    author,
    book,
  } as const;

  try {
    const tree = await loadTree(real);

    const baseUrl = `/${[subject, author, book].map((item) => typeof item === 'string' && slugify(item)).join('/')}/`;

    const label = filterString({
      input: book,
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
