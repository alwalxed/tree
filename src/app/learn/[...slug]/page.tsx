import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { Section } from '@/components/common/section';
import { StructuredData } from '@/components/seo/structured-data';
import { VisualizationSwitcher } from '@/components/visualizations/visualization-switcher';
import { SITE_URL } from '@/config/site';
import {
  listAllBooks,
  listAllPages,
  loadConfig,
  loadPage,
  loadTree,
} from '@/lib/common/content';
import { getOGImagePath } from '@/lib/common/og';
import type { Content } from '@/lib/schema/bookContent';
import { Node } from '@/lib/schema/bookTree';
import type { Metadata } from 'next';
import { deslugify, slugify } from 'reversible-arabic-slugifier';

// Import our new navigation components
import { ArticleNavigation } from '@/components/navigation/article-navigation';
import {
  Breadcrumbs,
  generateBreadcrumbsFromPath,
} from '@/components/navigation/breadcrumbs';
import { NavigationHelper } from '@/components/navigation/navigation-utilities';

export async function generateStaticParams() {
  try {
    const pages = await listAllPages();
    const books = await listAllBooks();

    const pageParams = pages.map((p) => ({
      slug: [p.subject, p.author, p.book, ...p.slug].map((item) =>
        slugify(item)
      ),
    }));

    const rootParams = books.map(({ subject, author, book }) => ({
      slug: [subject, author, book].map((item) => slugify(item)),
    }));

    return [...rootParams, ...pageParams];
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    throw error;
  }
}

type Props = {
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
  const [subject, author, book, ...restSlug] = decodedParts;

  const real = {
    subject,
    author,
    book,
    slug: restSlug,
  } as const;

  // Generate OG image path
  const urlPath = `/learn/${parts.join('/')}`;
  const ogImagePath = getOGImagePath(urlPath);

  try {
    if (restSlug.length === 0) {
      // Book root page metadata
      const cfg = await loadConfig(real);
      const cleanBookName = book.replace(/_/g, ' ');
      const cleanAuthorName = author.replace(/_/g, ' ');

      return {
        title: `${cfg.title} - ${cleanAuthorName}`,
        description: cfg.description,
        keywords: [
          cleanBookName,
          cleanAuthorName,
          subject,
          'كتب',
          'تعليم',
          'مراجع',
        ],
        openGraph: {
          title: `${cfg.title} - ${cleanAuthorName}`,
          description: cfg.description,
          type: 'website',
          locale: 'ar_SA',
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
          description: cfg.description,
          images: [ogImagePath],
        },
      };
    } else {
      const content = await loadPage(real);
      const cleanBookName = book.replace(/_/g, ' ');
      const cleanAuthorName = author.replace(/_/g, ' ');
      const pageTitle = content.title || 'صفحة بدون عنوان';

      return {
        title: `${pageTitle} - ${cleanBookName}`,
        description:
          content.excerpt ||
          `${pageTitle} من كتاب ${cleanBookName} للمؤلف ${cleanAuthorName}`,
        keywords: [
          pageTitle,
          cleanBookName,
          cleanAuthorName,
          subject,
          'شرح',
          'دروس',
        ],
        openGraph: {
          title: `${pageTitle} - ${cleanBookName}`,
          description:
            content.excerpt ||
            `${pageTitle} من كتاب ${cleanBookName} للمؤلف ${cleanAuthorName}`,
          type: 'article',
          locale: 'ar_SA',
          images: [
            {
              url: ogImagePath,
              width: 1200,
              height: 630,
              alt: `${pageTitle} - ${cleanBookName}`,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${pageTitle} - ${cleanBookName}`,
          description:
            content.excerpt || `${pageTitle} من كتاب ${cleanBookName}`,
          images: [ogImagePath],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'خطأ في تحميل الصفحة',
      description: 'حدث خطأ أثناء تحميل محتوى الصفحة',
    };
  }
}

export default async function Page({ params }: Props) {
  const awaitedParams = await params;
  const parts = awaitedParams.slug;

  if (parts.length < 3) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-red-600">
        ❌ Invalid URL: missing subject/author/book
      </div>
    );
  }

  const decodedParts = parts.map((item) => deslugify(item));
  const [subject, author, book, ...restSlug] = decodedParts;

  const real = {
    subject,
    author,
    book,
    slug: restSlug,
  } as const;

  // Build the current page URL
  const currentUrl = `${SITE_URL}/learn/${parts.join('/')}`;
  const currentPath = `/learn/${parts.join('/')}`;

  // Clean up names for display and structured data
  const cleanBookName = book.replace(/_/g, ' ');
  const cleanAuthorName = author.replace(/_/g, ' ');
  const cleanSubject = subject.replace(/_/g, ' ');

  // Generate breadcrumbs for all pages
  const breadcrumbs = generateBreadcrumbsFromPath(currentPath);

  if (restSlug.length === 0) {
    try {
      const cfg = await loadConfig(real);
      const tree = await loadTree(real);

      return (
        <>
          {/* Structured Data for Book */}
          <StructuredData
            type="book"
            title={cfg.title}
            description={cfg.description}
            author={cleanAuthorName}
            subject={cleanSubject}
            url={currentUrl}
          />

          <div className="flex w-full flex-col gap-6">
            {/* Breadcrumbs for book root */}
            <Breadcrumbs items={breadcrumbs} className="mb-4" />

            <div className="flex flex-col gap-16">
              {cfg.sections?.map((sec, i) => {
                if (sec.type === 'text') {
                  return (
                    <Section key={i}>
                      <Section.H level={2}>{sec.title}</Section.H>
                      <Section.P>
                        {sec.content.map((line, j) => (
                          <span key={j}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </Section.P>
                    </Section>
                  );
                }
                if (sec.type === 'visualization') {
                  const nodes = (tree as Node[]).filter((n) =>
                    n.title.includes(sec.chapterIdentifier)
                  );
                  return (
                    <Section key={i}>
                      <Section.H level={2}>{sec.title}</Section.H>
                      <VisualizationSwitcher nodes={nodes} />
                    </Section>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </>
      );
    } catch (error) {
      console.error(
        `Error loading config/tree for ${subject}/${author}/${book}:`,
        error
      );
      throw error;
    }
  }

  try {
    const content: Content = await loadPage(real);
    const tree = await loadTree(real);
    const pageTitle = content.title || 'صفحة بدون عنوان';

    // Set up navigation helper
    const bookBasePath = `/learn/${parts.slice(0, 3).join('/')}`;
    const navigationHelper = new NavigationHelper(tree, bookBasePath);

    // Get navigation for current page
    const navigation = navigationHelper.getNavigation(restSlug);

    // Update breadcrumbs with actual page title
    const enhancedBreadcrumbs = generateBreadcrumbsFromPath(
      currentPath,
      pageTitle
    );

    return (
      <>
        {/* Structured Data for Article */}
        <StructuredData
          type="article"
          title={pageTitle}
          description={
            content.excerpt ||
            `${pageTitle} من كتاب ${cleanBookName} للمؤلف ${cleanAuthorName}`
          }
          author={cleanAuthorName}
          bookTitle={cleanBookName}
          url={currentUrl}
          dateModified={new Date().toISOString()}
        />

        <div className="flex w-full flex-col gap-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={enhancedBreadcrumbs} className="mb-6" />

          {/* Article Content */}
          <article className="prose w-full">
            <MarkdownRenderer content={content.contentHtml} />
          </article>

          {/* Article Navigation */}
          <ArticleNavigation
            previousArticle={
              navigation.previous
                ? {
                    title: navigation.previous.title,
                    href: navigation.previous.href,
                  }
                : undefined
            }
            nextArticle={
              navigation.next
                ? {
                    title: navigation.next.title,
                    href: navigation.next.href,
                  }
                : undefined
            }
            className="mt-8"
          />
        </div>
      </>
    );
  } catch (error) {
    console.error(
      `Error loading page ${subject}/${author}/${book}/${restSlug.join('/')}:`,
      error
    );
    throw error;
  }
}
