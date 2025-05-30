import fs from 'fs/promises';
import path from 'path';

export async function directoryExists(dir: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dir);
    return stat.isDirectory();
  } catch {
    console.warn(`Cannot access directory "${dir}"`);
    return false;
  }
}

export async function configExists(
  bookDirectoryPath: string
): Promise<boolean> {
  const p = path.join(bookDirectoryPath, 'config.json');
  try {
    return (await fs.stat(p)).isFile();
  } catch {
    return false;
  }
}

export async function hasContentIndex(
  bookFolderPath: string
): Promise<boolean> {
  return await (async function walk(dir: string): Promise<boolean> {
    let ents;
    try {
      ents = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return false;
    }
    for (const e of ents) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && (await walk(full))) return true;
      if (e.isFile() && e.name.toLowerCase() === 'index.md') return true;
    }
    return false;
  })(bookFolderPath);
}
