import { Section } from '@/components/common/section';
import { VisualizationSwitcher } from '@/components/visualizations/visualization-switcher';
import { filterString } from '@/lib/common/filter-string';
import { buildBookTree } from '@/lib/content/buildTree';
import { FILESYSTEM_CONTENT_PATH } from '@/lib/content/common/constants';
import { loadBookConfig } from '@/lib/content/loadConfig';
import { getAllBookSlugs } from '@/lib/content/staticPaths';
import { configExists } from '@/lib/content/utils/fs-utils';
import { validateBookPath } from '@/lib/content/validatePath';
import { notFound } from 'next/navigation';
import path from 'path';
import { Fragment } from 'react';

export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  const books = await getAllBookSlugs();
  return books.map(({ subjectSlug, authorSlug, bookSlug }) => ({
    subjectSlug,
    authorSlug,
    bookSlug,
  }));
}

type Params = Promise<{
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
}>;

type Props = {
  params: Params;
};

export default async function BookLandingPage({ params }: Props) {
  const { subjectSlug, authorSlug, bookSlug } = await params;

  const decodedSlugs = {
    subject: decodeURIComponent(subjectSlug),
    author: decodeURIComponent(authorSlug),
    book: decodeURIComponent(bookSlug),
  };

  const bookDirectoryPath = path.join(
    FILESYSTEM_CONTENT_PATH,
    decodedSlugs.subject,
    decodedSlugs.author,
    decodedSlugs.book
  );

  const isBookPathValid = await validateBookPath({
    subjectSlug: decodedSlugs.subject,
    authorSlug: decodedSlugs.author,
    bookSlug: decodedSlugs.book,
  });

  if (!isBookPathValid) {
    console.warn(`Bad path or missing folder at ${bookDirectoryPath}`);
    notFound();
  }

  const isBookConfig = await configExists(bookDirectoryPath);

  if (!isBookConfig) {
    console.warn('No book config.json was found');
    notFound();
  }

  const bookConfigData = await loadBookConfig(bookDirectoryPath);

  if (!bookConfigData) {
    console.warn('No book config data');
    notFound();
  }

  const bookUrlPath = `/${filterString({
    input: Object.values(decodedSlugs).join('/'),
    options: {
      arabicLetters: true,
      underscores: true,
      forwardSlashes: true,
    },
  })}`;

  const bookTree = await buildBookTree({
    fileSystemBasePath: bookDirectoryPath,
    prefix: bookUrlPath,
    dirNames: [],
    slugs: [],
    depth: 0,
  });

  if (!bookTree) {
    console.warn('No book tree');
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12">
      {bookConfigData.sections.map((section, index) => {
        switch (section.type) {
          case 'text':
            return (
              <Section key={`${index}-${section.title}-${section.type}`}>
                <Section.H level={2}>{section.title}</Section.H>
                <Section.P>
                  {section.content.map((line, i) => (
                    <Fragment
                      key={`${index}-${section.title}-${section.type}-${i}`}
                    >
                      {line}
                      <br />
                    </Fragment>
                  ))}
                </Section.P>
              </Section>
            );
          case 'visualization':
            return (
              <Section key={`${index}-${section.title}-${section.type}`}>
                <Section.H level={2}>{section.title}</Section.H>
                <VisualizationSwitcher
                  nodes={bookTree.filter((node) =>
                    node.title.includes(section.chapterIdentifier)
                  )}
                />
              </Section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
