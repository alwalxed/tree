import fs from 'fs';
import path from 'path';
import type { SummaryNode } from '../types';
import {
  normalizeSlug,
  normalizeTitle,
  parseDirectoryName,
} from '../utils/path-utils';
const CONTENT_BASE_PATH = path.join(process.cwd(), 'content');
let summaryTreeCache: SummaryNode[] | null = null;
function isPrefixMandatoryForDepth(depth: number): boolean {
  return depth >= 3;
}
async function scanContentDirectory(
  currentDirPath: string,
  parentSlugPath: string[] = [],
  currentDepth: number = 0
): Promise<SummaryNode[]> {
  const entries = await fs.promises.readdir(currentDirPath, {
    withFileTypes: true,
  });
  const items: SummaryNode[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullEntryPath = path.join(currentDirPath, entry.name);
    if (entry.isDirectory()) {
      const { order: dirOrder, name: unprefixedDirName } = parseDirectoryName({
        directoryName: entry.name,
        isDirectoryPrefixMandatory: isPrefixMandatoryForDepth(currentDepth),
      });
      const slug = normalizeSlug(unprefixedDirName);
      const title = normalizeTitle(unprefixedDirName);
      const children = await scanContentDirectory(
        fullEntryPath,
        [...parentSlugPath, slug],
        currentDepth + 1
      );
      items.push({
        title,
        slug,
        order: dirOrder,
        parentPath: parentSlugPath,
        children,
      });
    }
  }
  return items.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.title.localeCompare(b.title);
  });
}
export async function buildContentSummaryTree(): Promise<SummaryNode[]> {
  if (summaryTreeCache) return summaryTreeCache;
  summaryTreeCache = await scanContentDirectory(CONTENT_BASE_PATH);
  return summaryTreeCache;
}
export function clearSummaryTreeCache(): void {
  summaryTreeCache = null;
}
