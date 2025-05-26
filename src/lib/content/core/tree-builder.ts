import fs from 'fs';
import path from 'path';
import type { SummaryNode } from '../types';
import {
  normalizeTitle,
  parseDirectoryName,
  requiresPrefix,
} from '../utils/path-utils';

export async function buildTree({
  contentPath,
  dirNames = [],
  slugs = [],
  depth = 0,
}: {
  contentPath: string;
  dirNames?: string[];
  slugs?: string[];
  depth?: number;
}): Promise<SummaryNode[]> {
  const root = path.join(contentPath, ...dirNames);
  // bail if folder doesn’t exist or isn’t readable
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

    // parse out the “١_” prefix
    const { fileName, fileOrder } = parseDirectoryName({
      directoryName: dirent.name,
      isDirectoryPrefixMandatory: requiresPrefix(depth),
    });

    const title = normalizeTitle(fileName);
    const slug = fileName;
    const order = fileOrder;

    // recurse, but push the real dirent.name into dirNames
    // and the slug into slugs
    const children = await buildTree({
      contentPath,
      dirNames: [...dirNames, dirent.name],
      slugs: [...slugs, slug],
      depth: depth + 1,
    });

    nodes.push({
      title,
      slug,
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
