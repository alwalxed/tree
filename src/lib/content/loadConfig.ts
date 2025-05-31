import { BookConfigSchema, type BookConfig } from '@/lib/schema/bookConfig';
import fs from 'fs/promises';
import path from 'path';

export async function loadBookConfig(
  bookDirectoryPath: string,
): Promise<BookConfig | null> {
  const p = path.join(bookDirectoryPath, 'config.json');
  try {
    const raw = await fs.readFile(p, 'utf-8');
    const json = JSON.parse(raw);
    const parsed = BookConfigSchema.safeParse(json);
    if (!parsed.success) {
      console.error('Config validation errors:', parsed.error.format());
      return null;
    }
    return parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`Failed to load config.json at ${ p }:`, err.message);
    return null;
  }
}
