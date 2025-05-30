import fs from 'fs';

export async function isExistingDirectory(dir: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(dir);
    return stats.isDirectory();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.warn(`cannot access directory "${dir}":`, err.code || err);
    return false;
  }
}
