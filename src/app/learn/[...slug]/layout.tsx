import { DevDebuggers } from '@/components/debug';
import { Sidebar } from '@/components/layout/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { loadConfig, loadTree } from '@/lib/common/content';
import { filterString } from '@/lib/common/filter-string';
import { getOGImagePath } from '@/lib/common/og';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { deslugify, slugify } from 'reversible-arabic-slugifier';

type Props = {
  children: ReactNode;
  params: Promise<{
    slug: string[];
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const awaitedParams = await params;
  const parts = awaitedParams.slug;

  if (parts.length < 3) {
    return {
      title: 'صفحة غير صحيحة',
      description: 'رابط غير صحيح - مفقود الموضوع/المؤلف/الكتاب',
    };
  }

  const decodedParts = parts.map((item) => deslugify(item));
  const [subject, author, book] = decodedParts;

  // Generate OG image path
  const urlPath = `/learn/${parts.join('/')}`;
  const ogImagePath = getOGImagePath(urlPath);

  try {
    const cfg = await loadConfig({ subject, author, book });
    const cleanBookName = book.replace(/_/g, ' ');
    const cleanAuthorName = author.replace(/_/g, ' ');
    const cleanSubject = subject.replace(/_/g, ' ');

    return {
      title: `${cfg.title} - ${cleanAuthorName}`,
      description: `${cfg.description} - كتاب ${cleanBookName} في ${cleanSubject}`,
      keywords: [
        cleanBookName,
        cleanAuthorName,
        cleanSubject,
        'كتب إسلامية',
        'تعليم',
        'مراجع',
        'شجرة',
      ],
      openGraph: {
        title: `${cfg.title} - ${cleanAuthorName}`,
        description: `${cfg.description} - كتاب ${cleanBookName} في ${cleanSubject}`,
        type: 'website',
        locale: 'ar_SA',
        siteName: 'شجرة',
        images: [
          {
            url: ogImagePath,
            width: 1200,
            height: 630,
            alt: `${cfg.title} - ${cleanAuthorName}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${cfg.title} - ${cleanAuthorName}`,
        description: `${cfg.description} - كتاب ${cleanBookName} في ${cleanSubject}`,
        images: [ogImagePath],
      },
      alternates: {
        canonical: `/learn/${parts.join('/')}`,
      },
    };
  } catch (error) {
    console.error(error);
    // Fallback metadata if config loading fails
    const cleanBookName = book.replace(/_/g, ' ');
    const cleanAuthorName = author.replace(/_/g, ' ');
    const cleanSubject = subject.replace(/_/g, ' ');

    return {
      title: `${cleanBookName} - ${cleanAuthorName}`,
      description: `كتاب ${cleanBookName} للمؤلف ${cleanAuthorName} في ${cleanSubject}`,
      keywords: [cleanBookName, cleanAuthorName, cleanSubject],
      openGraph: {
        images: [
          {
            url: ogImagePath,
            width: 1200,
            height: 630,
            alt: `${cleanBookName} - ${cleanAuthorName}`,
          },
        ],
      },
      twitter: {
        images: [ogImagePath],
      },
    };
  }
}

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
