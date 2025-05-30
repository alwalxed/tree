import path from 'path';
import { FILESYSTEM_CONTENT_PATH } from './common/constants';
import { directoryExists } from './utils/fs-utils';

export async function validateBookPath({
  subjectSlug,
  authorSlug,
  bookSlug,
}: {
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
}): Promise<boolean> {
  const root = path.resolve(FILESYSTEM_CONTENT_PATH);

  // 1) Subject folder
  const subjectPath = path.resolve(root, subjectSlug);
  if (!subjectPath.startsWith(root)) {
    console.warn('Path‐traversal detected in subjectSlug:', subjectSlug);
    return false;
  }
  if (!(await directoryExists(subjectPath))) {
    console.warn(`Subject folder not found: ${ subjectPath }`);
    return false;
  }

  // 2) Author folder
  const authorPath = path.resolve(subjectPath, authorSlug);
  if (!authorPath.startsWith(root)) {
    console.warn('Path‐traversal detected in authorSlug:', authorSlug);
    return false;
  }
  if (!(await directoryExists(authorPath))) {
    console.warn(`Author folder not found: ${ authorPath }`);
    return false;
  }

  // 3) Book folder
  const bookPath = path.resolve(authorPath, bookSlug);
  if (!bookPath.startsWith(root)) {
    console.warn('Path‐traversal detected in bookSlug:', bookSlug);
    return false;
  }
  if (!(await directoryExists(bookPath))) {
    console.warn(`Book folder not found: ${ bookPath }`);
    return false;
  }

  // all good
  return true;
}
