import fs from 'fs';
import path from 'path';

export async function hasBookContent(bookFolderPath: string): Promise<boolean> {
  try {
    return await walkHasIndexMd(bookFolderPath);
  } catch (err) {
    console.warn(`hasBookContent failed for ${bookFolderPath}:`, err);
    return false;
  }
}

async function walkHasIndexMd(dir: string): Promise<boolean> {
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch {
    return false;
  }

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (await walkHasIndexMd(full)) {
        return true;
      }
    } else if (e.isFile() && e.name.toLowerCase() === 'index.md') {
      return true;
    }
  }
  return false;
}
