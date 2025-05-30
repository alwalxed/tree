import fs from 'fs/promises';
import path from 'path';
import { parseDirectoryName } from './parse-directory-name';

export async function resolveRealDirectory(
  parentDir: string,
  slugSegment: string
): Promise<string | null> {
  const entries = await fs.readdir(parentDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const { fileName } = parseDirectoryName({
      directoryName: ent.name,
      isDirectoryPrefixMandatory: false,
    });
    if (fileName === slugSegment) {
      return path.join(parentDir, ent.name);
    }
  }
  return null;
}
