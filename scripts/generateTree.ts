#!/usr/bin/env tsx

import Fs from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { slugify } from 'reversible-arabic-slugifier';
import type { Node } from '../src/lib/schema/bookTree.js';

// ============================================================================
// TYPES
// ============================================================================

type TreeNode = Node;

interface ParsedDirName {
  fileOrder: number;
  fileName: string;
  isPrefixed: boolean;
  originalDirectoryName: string;
}

interface BuildTreeParams {
  fileSystemBasePath: string;
  dirNames?: string[];
  slugs?: string[];
  slugsWithPrefix?: string[];
  urlSafeSlugs?: string[];
  prefix?: string;
  prefixWithPrefixes?: string;
  urlSafePrefix?: string;
  depth?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_DEPTH_FOR_PREFIXED_DIRS = 3;
const DEFAULT_ORDER = 0;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function convertArabicNumeralsToEn(value: string): string {
  const ar = '٠١٢٣٤٥٦٧٨٩';
  return value.replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)));
}

function requiresPrefix(depth: number): boolean {
  return depth >= MIN_DEPTH_FOR_PREFIXED_DIRS;
}

function normalizeTitle(raw: string): string {
  return raw.replace(/[^\u0600-\u06FF_]/g, '').replace(/_+/g, ' ');
}

function isLeafDirectory(children: TreeNode[]): boolean {
  return children.length === 0;
}

// ============================================================================
// DIRECTORY NAME PARSING
// ============================================================================

function parseDirName({ 
  directoryName, 
  isDirectoryPrefixMandatory 
}: {
  directoryName: string;
  isDirectoryPrefixMandatory: boolean;
}): ParsedDirName {
  if (/\.[a-z0-9]+$/i.test(directoryName)) {
    throw new Error(`"${directoryName}" must not contain an extension.`);
  }

  const match = directoryName.match(/^([٠-٩0-9]+)_+(.+)$/);
  
  if (match) {
    const [, prefix, rest] = match;
    const order = parseInt(convertArabicNumeralsToEn(prefix), 10);
    
    if (isNaN(order)) {
      throw new Error(`Invalid numeric prefix in "${directoryName}"`);
    }
    
    return {
      fileOrder: order,
      fileName: rest,
      isPrefixed: true,
      originalDirectoryName: directoryName,
    };
  }

  if (isDirectoryPrefixMandatory) {
    throw new Error(`"${directoryName}" missing numeric prefix at this level.`);
  }

  return {
    fileOrder: DEFAULT_ORDER,
    fileName: directoryName,
    isPrefixed: false,
    originalDirectoryName: directoryName,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateDirectoryName(dirName: string, dirPath: string, depth: number): void {
  const issues: string[] = [];

  // Check if it should have a numeric prefix
  const shouldHavePrefix = requiresPrefix(depth);
  const hasPrefix = /^([٠-٩0-9]+)_+/.test(dirName);

  if (shouldHavePrefix && !hasPrefix) {
    issues.push(`Missing numeric prefix (required at depth ${depth})`);
  }

  // Check for mixed Arabic/English numerals in prefix
  if (hasPrefix) {
    const prefixMatch = dirName.match(/^([٠-٩0-9]+)_+/);
    if (prefixMatch) {
      const prefix = prefixMatch[1];
      const hasArabicNums = /[٠-٩]/.test(prefix);
      const hasEnglishNums = /[0-9]/.test(prefix);

      if (hasArabicNums && hasEnglishNums) {
        issues.push(`Mixed Arabic and English numerals in prefix: "${prefix}"`);
      }
    }
  }

  // Check for spaces (should use underscores)
  if (dirName.includes(' ')) {
    issues.push('Contains spaces (consider using underscores)');
  }

  // Check for non-Arabic letters (excluding underscores and numbers)
  const withoutPrefixAndUnderscores = dirName
    .replace(/^[٠-٩0-9]+_+/, '')
    .replace(/_/g, '');
  const hasNonArabicChars = /[^\u0600-\u06FF]/.test(withoutPrefixAndUnderscores);

  if (hasNonArabicChars) {
    const nonArabicChars = withoutPrefixAndUnderscores.match(/[^\u0600-\u06FF]/g);
    if (nonArabicChars) {
      issues.push(`Contains non-Arabic characters: "${nonArabicChars.join(', ')}"`);
    }
  }

  // Check for unusual patterns
  if (dirName.includes('__')) {
    issues.push('Contains double underscores');
  }

  if (dirName.startsWith('_') || dirName.endsWith('_')) {
    issues.push('Starts or ends with underscore');
  }

  // Log issues if any found
  if (issues.length > 0) {
    console.log(`ℹ️  Directory validation - ${dirPath}:`);
    issues.forEach((issue) => console.log(`   • ${issue}`));
  }
}

async function validateLeafDirectory(dirPath: string): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const hasIndexMd = entries.some(
      (entry) => entry.isFile() && entry.name === 'index.md'
    );

    if (!hasIndexMd) {
      console.log(`ℹ️  Missing index.md in leaf directory: ${dirPath}`);
    }

    // Check for other files that might have naming issues
    const otherFiles = entries.filter(
      (entry) =>
        entry.isFile() &&
        entry.name !== 'index.md' &&
        entry.name !== 'tree.json' &&
        entry.name !== 'config.json'
    );

    otherFiles.forEach((file) => {
      const fileName = file.name;
      const issues: string[] = [];

      // Check for spaces in file names
      if (fileName.includes(' ')) {
        issues.push('Contains spaces');
      }

      // Check for non-standard characters (allowing common file extensions)
      const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
      const hasNonArabicChars = /[^\u0600-\u06FF_0-9٠-٩-]/.test(nameWithoutExt);

      if (hasNonArabicChars) {
        issues.push('Contains non-Arabic characters in filename');
      }

      if (issues.length > 0) {
        console.log(`ℹ️  File validation - ${path.join(dirPath, fileName)}:`);
        issues.forEach((issue) => console.log(`   • ${issue}`));
      }
    });
  } catch (err) {
    // Ignore read errors for validation
  }
}

// ============================================================================
// TREE BUILDING
// ============================================================================

async function buildTree({
  fileSystemBasePath,
  dirNames = [],
  slugs = [],
  slugsWithPrefix = [],
  urlSafeSlugs = [],
  prefix = '',
  prefixWithPrefixes = '',
  urlSafePrefix = '',
  depth = 0,
}: BuildTreeParams): Promise<TreeNode[] | null> {
  const root = path.join(fileSystemBasePath, ...dirNames);
  
  try {
    await fs.access(root, Fs.constants.R_OK);
  } catch {
    console.warn(`Cannot access ${root}`);
    return null;
  }

  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    console.warn(`Cannot read dir ${root}`);
    return null;
  }

  const nodes: TreeNode[] = [];
  
  for (const de of entries) {
    if (!de.isDirectory()) continue;

    // Validate directory name
    const currentDirPath = path.join(root, de.name);
    validateDirectoryName(de.name, currentDirPath, depth);

    let fileName: string, fileOrder: number, originalDirectoryName: string;
    
    try {
      ({ fileName, fileOrder, originalDirectoryName } = parseDirName({
        directoryName: de.name,
        isDirectoryPrefixMandatory: requiresPrefix(depth),
      }));
    } catch (err) {
      console.warn(`Skipping "${de.name}" in ${root}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      continue;
    }

    const title = normalizeTitle(fileName);
    const slug = fileName;
    const slugWithPrefix = originalDirectoryName;
    const urlSafeSlug = slugify(originalDirectoryName);

    const newSlugs = [...slugs, slug];
    const newSlugsWithPrefix = [...slugsWithPrefix, slugWithPrefix];
    const newUrlSafeSlugs = [...urlSafeSlugs, urlSafeSlug];

    // Build the "flat" prefix (no leading slash)
    const flatPrefix = prefix ? `${prefix}/${slug}` : slug;
    const flatPrefixWithPrefixes = prefixWithPrefixes
      ? `${prefixWithPrefixes}/${slugWithPrefix}`
      : slugWithPrefix;
    const flatUrlSafePrefix = urlSafePrefix
      ? `${urlSafePrefix}/${urlSafeSlug}`
      : urlSafeSlug;

    // Make it absolute
    const fullPath = `/${flatPrefix}`;
    const fullPathWithPrefixes = `/${flatPrefixWithPrefixes}`;
    const fullUrlSafePath = `/${flatUrlSafePrefix}`;

    const children = await buildTree({
      fileSystemBasePath,
      dirNames: [...dirNames, de.name],
      slugs: newSlugs,
      slugsWithPrefix: newSlugsWithPrefix,
      urlSafeSlugs: newUrlSafeSlugs,
      prefix: flatPrefix,
      prefixWithPrefixes: flatPrefixWithPrefixes,
      urlSafePrefix: flatUrlSafePrefix,
      depth: depth + 1,
    });
    
    if (children === null) return null;

    nodes.push({
      title,
      slug,
      slugWithPrefix,
      urlSafeSlug,
      order: fileOrder,
      parentPath: slugs,
      parentPathWithPrefixedSlugs: slugsWithPrefix,
      parentUrlSafePath: urlSafeSlugs,
      fullPath,
      fullPathWithPrefixes,
      fullUrlSafePath,
      children,
    });
  }

  const sortedNodes = nodes.sort((a, b) =>
    a.order !== b.order
      ? a.order - b.order
      : a.title.localeCompare(b.title, 'ar')
  );

  // Validate leaf directories
  for (const node of sortedNodes) {
    if (isLeafDirectory(node.children)) {
      const leafPath = path.join(fileSystemBasePath, ...dirNames, node.slugWithPrefix);
      await validateLeafDirectory(leafPath);
    }
  }

  return sortedNodes;
}

// ============================================================================
// TREE FILE GENERATION
// ============================================================================

async function generateTreeFiles(baseTree: TreeNode[], contentRoot: string): Promise<void> {
  console.log('\n📁 Generating tree.json files...\n');

  for (const subject of baseTree) {
    for (const author of subject.children) {
      for (const book of author.children) {
        const lineageSlugs = [subject.slug, author.slug, book.slug];
        const outDir = path.join(contentRoot, ...lineageSlugs);
        const outFile = path.join(outDir, 'tree.json');

        // Build subtree
        const subtree = await buildTree({
          fileSystemBasePath: contentRoot,
          dirNames: lineageSlugs,
          slugs: lineageSlugs,
          slugsWithPrefix: [
            subject.slugWithPrefix,
            author.slugWithPrefix,
            book.slugWithPrefix,
          ],
          urlSafeSlugs: [
            subject.urlSafeSlug,
            author.urlSafeSlug,
            book.urlSafeSlug,
          ],
          prefix: lineageSlugs.join('/'),
          prefixWithPrefixes: [
            subject.slugWithPrefix,
            author.slugWithPrefix,
            book.slugWithPrefix,
          ].join('/'),
          urlSafePrefix: [
            subject.urlSafeSlug,
            author.urlSafeSlug,
            book.urlSafeSlug,
          ].join('/'),
          depth: 3,
        });

        if (!subtree) {
          console.warn(`⚠ skipped tree for ${lineageSlugs.join('/')}`);
          continue;
        }

        await writeTreeFile(outFile, subtree, outDir);
      }
    }
  }
}

async function writeTreeFile(outFile: string, subtree: TreeNode[], outDir: string): Promise<void> {
  const newContent = JSON.stringify(subtree, null, 2);

  // Read existing and compare
  let existingRaw: string | null = null;
  try {
    existingRaw = await fs.readFile(outFile, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }

  let shouldWrite = true;
  if (existingRaw !== null) {
    try {
      const existingObj = JSON.parse(existingRaw);
      const oldContent = JSON.stringify(existingObj, null, 2);
      if (oldContent === newContent) shouldWrite = false;
    } catch {
      // If parse fails, overwrite
    }
  }

  if (shouldWrite) {
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outFile, newContent, 'utf-8');
    console.log(`✔ wrote ${path.relative(process.cwd(), outFile)}`);
  } else {
    console.log(`✓ skip (no changes) ${path.relative(process.cwd(), outFile)}`);
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main(): Promise<void> {
  const CONTENT_ROOT = path.join(process.cwd(), 'content');

  console.log('🔍 Starting content validation and tree generation...\n');

  // Build full tree from root
  const baseTree = await buildTree({
    fileSystemBasePath: CONTENT_ROOT,
    slugs: [],
    slugsWithPrefix: [],
    urlSafeSlugs: [],
    prefix: '',
    prefixWithPrefixes: '',
    urlSafePrefix: '',
    depth: 0,
  });

  if (!baseTree) {
    console.error('✖ failed to build base content tree');
    process.exit(1);
  }

  await generateTreeFiles(baseTree, CONTENT_ROOT);

  console.log('\n✅ Validation and tree generation completed!');
}

// ============================================================================
// ENTRY POINT
// ============================================================================

main().catch((err) => {
  console.error(err);
  process.exit(1);
});