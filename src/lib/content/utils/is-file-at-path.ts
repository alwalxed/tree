import fs from 'fs';
import path from 'path';

export async function isFileAtPath(
  {
    bookFolderPath,
    pathSegments,
    filename
  }: {
    bookFolderPath: string,
    pathSegments: string[],
    filename: string;
  }
): Promise<boolean> {
  const filePath = path.join(bookFolderPath, ...pathSegments, filename);
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.isFile();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}
