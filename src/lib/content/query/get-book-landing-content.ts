import fs from 'fs';
import path from 'path';
import {
  BookLandingContent,
  BookLandingContentSchema,
} from '../../schema/landing-content';

export async function getBookLandingContent({
  bookFolderPath,
  pathSegments,
}: {
  bookFolderPath: string;
  pathSegments: string[];
}): Promise<BookLandingContent | null> {
  const landingJsonPath = path.join(
    bookFolderPath,
    ...pathSegments,
    'landing.json'
  );
  try {
    const fileContent = await fs.promises.readFile(landingJsonPath, 'utf-8');
    const data = JSON.parse(fileContent);

    const parsed = BookLandingContentSchema.safeParse(data);

    if (!parsed.success) {
      console.error(
        `Validation error for landing.json at ${ landingJsonPath }:`,
        parsed.error
      );
      return null;
    }

    return parsed.data;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error(
      `Error reading or parsing landing.json at ${ landingJsonPath }:`,
      error
    );
    return null;
  }
}
