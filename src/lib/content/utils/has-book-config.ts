import { promises as fs } from 'fs';
import path from 'path';

export async function hasBookConfig({
  bookDirectoryPath,
}: {
  bookDirectoryPath: string;
}): Promise<boolean> {
  const configPath = path.join(bookDirectoryPath, 'config.json');
  try {
    const stat = await fs.stat(configPath);
    return stat.isFile();
  } catch (err) {
    console.warn(`hasBookConfig failed for ${configPath}:`, err);
    return false;
  }
}
