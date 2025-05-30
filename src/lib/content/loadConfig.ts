import { BookConfigSchema, type BookConfig } from '@/lib/schema/book-config';
import fs from 'fs';
import path from 'path';

export async function loadBookConfig({
  bookDirectoryPath,
}: {
  bookDirectoryPath: string;
}): Promise<BookConfig | null> {
  const configPath = path.join(bookDirectoryPath, 'config.json');
  try {
    const raw = await fs.promises.readFile(configPath, 'utf-8');
    const parsed = BookConfigSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.error(`Invalid config at ${configPath}`, parsed.error);
      return null;
    }
    return parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.code === 'ENOENT') return null;
    console.error(`Error loading config at ${configPath}`, err);
    return null;
  }
}
