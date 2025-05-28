import fs from 'fs';
import path from 'path';
import type { SummaryNode } from '../types';
import { normalizeTitle } from '../utils/normalize-title';
import { parseDirectoryName } from '../utils/parse-directory-name';
import { requiresPrefix } from '../utils/requires-prefix';


export async function buildTree({
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
}): Promise<SummaryNode[]> {
  const root = path.join(fileSystemBasePath, ...dirNames);
  try {
    await fs.promises.access(root, fs.constants.R_OK);
  } catch {
    return [];
  }

  const entries = await fs.promises.readdir(root, {
    withFileTypes: true,
  });
  const nodes: SummaryNode[] = [];

  for (const dirent of entries) {
    if (!dirent.isDirectory()) continue;

    const { fileName, fileOrder } = parseDirectoryName({
      directoryName: dirent.name,
      isDirectoryPrefixMandatory: requiresPrefix(depth),
    });

    const title = normalizeTitle(fileName);
    const slug = fileName;
    const order = fileOrder;

    const fullPath = prefix + [ ...slugs, slug ].join('/');

    const children = await buildTree({
      fileSystemBasePath,
      dirNames: [ ...dirNames, dirent.name ],
      slugs: [ ...slugs, slug ],
      prefix,
      depth: depth + 1,
    });

    nodes.push({
      title,
      slug,
      fullPath,
      order,
      parentPath: slugs,
      children,
    });
  }

  return nodes.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });
}
