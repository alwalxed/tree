import { getHomeOGImagePath } from '@/lib/common/og';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { slugify } from 'reversible-arabic-slugifier';

export const metadata: Metadata = {
  title: 'شجرة - موقع الكتب المشجرة',
  description:
    'موقع مفتوح المصدر لتصفح الكتب الإسلامية مشجرة ملخصة بطريقة تفاعلية ومنظمة',
  keywords: [
    'كتب إسلامية',
    'تعليم',
    'مراجع',
    'النحو',
    'الفقه',
    'العقيدة',
    'شجرة',
    'تصفح تفاعلي',
  ],
  openGraph: {
    title: 'شجرة - موقع الكتب المشجرة',
    description:
      'موقع مفتوح المصدر لتصفح الكتب الإسلامية مشجرة ملخصة بطريقة تفاعلية ومنظمة',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'شجرة',
    images: [
      {
        url: getHomeOGImagePath(),
        width: 1200,
        height: 630,
        alt: 'شجرة - موقع الكتب المشجرة',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شجرة - موقع الكتب المشجرة',
    description: 'موقع مفتوح المصدر لتصفح الكتب الإسلامية مشجرة ملخصة',
    images: [getHomeOGImagePath()],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootPage() {
  // Note: Since this page redirects immediately, the StructuredData won't be rendered
  // But if you want to show a landing page instead of redirecting, you could include it like this:

  /*
  return (
    <>
      <StructuredData
        type="website"
        title="شجرة - موقع الكتب المشجرة"
        description="موقع مفتوح المصدر لتصفح الكتب الإسلامية مشجرة ملخصة بطريقة تفاعلية ومنظمة"
        url={SITE_URL}
      />
      <main>
        <!-- Your landing page content here -->
      </main>
    </>
  );
  */

  const subject = slugify('النحو');
  const author = slugify('سليمان_العيوني');
  const book = slugify('النحو_الصغير');

  const target = `/learn/${subject}/${author}/${book}`;

  redirect(target);
}
