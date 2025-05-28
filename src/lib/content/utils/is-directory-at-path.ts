import fs from 'fs';
import path from 'path';

export async function isDirectoryAtPath(
  { bookFolderPath,
    pathSegments }: {
      bookFolderPath: string,
      pathSegments: string[];
    }
): Promise<boolean> {
  const fullPath = path.join(bookFolderPath, ...pathSegments);
  try {
    const stats = await fs.promises.stat(fullPath);
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}
