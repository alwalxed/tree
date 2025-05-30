import { BookConfigSchema, type BookConfig } from '@/lib/schema/book-config';
import fs from 'fs';
import path from 'path';

export async function getBookConfig({
  bookDirectoryPath,
}: {
  bookDirectoryPath: string;
}): Promise<BookConfig | null> {
  const landingJsonPath = path.join(bookDirectoryPath, 'config.json');
  try {
    const fileContent = await fs.promises.readFile(landingJsonPath, 'utf-8');
    const data = JSON.parse(fileContent);

    const parsed = BookConfigSchema.safeParse(data);

    if (!parsed.success) {
      console.error(
        `Validation error for landing.json at ${landingJsonPath}:`,
        parsed.error
      );
      return null;
    }

    return parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error(
      `Error reading or parsing landing.json at ${landingJsonPath}:`,
      error
    );
    return null;
  }
}
