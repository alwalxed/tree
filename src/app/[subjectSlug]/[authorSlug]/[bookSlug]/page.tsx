import { FILESYSTEM_CONTENT_PATH } from '@/lib/content/constants';
import { validateBookPath } from '@/lib/content/utils/validate-book-path';
import { notFound } from 'next/navigation';
import path from 'path';
type Params = {
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
};

type Props = {
  params: Promise<Params>;
};

export default async function BookLandingPage({ params }: Props) {
  const { subjectSlug, authorSlug, bookSlug } = await params;

  // 1) Decode the URL-encoded slugs
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

  return <p>{bookDirectoryPath}</p>;
}
