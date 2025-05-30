import fs from 'fs';
import path from 'path';
import type { SummaryNode } from './common/types';
import { parseDirName, requiresPrefix } from './utils/dir-utils';
import { normalizeTitle } from './utils/text-utils';

export async function buildBookTree({
  fileSystemBasePath,
  dirNames = [],
  slugs = [],
  prefix = '',
  depth = 0,
}: {
  fileSystemBasePath: string;
  dirNames?: string[];
  slugs?: string[];
  prefix?: string;
  depth?: number;
}): Promise<SummaryNode[] | null> {
  const root = path.join(fileSystemBasePath, ...dirNames);
  try {
    await fs.promises.access(root, fs.constants.R_OK);
  } catch {
    console.warn(`Cannot access ${ root }`);
    return null;
  }
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(root, { withFileTypes: true });
  } catch {
    console.warn(`Cannot read dir ${ root }`);
    return null;
  }
  const nodes: SummaryNode[] = [];
  for (const de of entries) {
    if (!de.isDirectory()) continue;
    const { fileName, fileOrder } = parseDirName({
      directoryName: de.name,
      isDirectoryPrefixMandatory: requiresPrefix(depth),
    });
    const title = normalizeTitle(fileName);
    const slug = fileName;
    const fullPath = prefix + [ ...slugs, slug ].join('/');
    const children = await buildBookTree({
      fileSystemBasePath,
      dirNames: [ ...dirNames, de.name ],
      slugs: [ ...slugs, slug ],
      prefix,
      depth: depth + 1,
    });
    if (children === null) return null;
    nodes.push({
      title,
      slug,
      fullPath,
      order: fileOrder,
      parentPath: slugs,
      children,
    });
  }
  return nodes.sort((a, b) =>
    a.order !== b.order ? a.order - b.order : a.title.localeCompare(b.title)
  );
}
