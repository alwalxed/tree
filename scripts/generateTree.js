#!/usr/bin/env node
// scripts/generateTree.js

const fs = require('fs/promises');
const Fs = require('fs');
const path = require('path');

// === copy of your constants + helper fns ===
const MIN_DEPTH_FOR_PREFIXED_DIRS = 3;

function convertArabicNumeralsToEn(value) {
  // map Arabic-Indic digits to ASCII
  const ar = '٠١٢٣٤٥٦٧٨٩';
  return value.replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)));
}

function parseDirName({ directoryName, isDirectoryPrefixMandatory }) {
  const DEFAULT_ORDER = 0;
  if (/\.[a-z0-9]+$/i.test(directoryName)) {
    throw new Error(`"${directoryName}" must not contain an extension.`);
  }
  const m = directoryName.match(/^([٠-٩0-9]+)_+(.+)$/);
  if (m) {
    const [, prefix, rest] = m;
    const order = parseInt(convertArabicNumeralsToEn(prefix), 10);
    if (isNaN(order)) {
      throw new Error(`Invalid numeric prefix in "${directoryName}"`);
    }
    return { fileOrder: order, fileName: rest, isPrefixed: true };
  }
  if (isDirectoryPrefixMandatory) {
    throw new Error(`"${directoryName}" missing numeric prefix at this level.`);
  }
  return {
    fileOrder: DEFAULT_ORDER,
    fileName: directoryName,
    isPrefixed: false,
  };
}

function requiresPrefix(depth) {
  return depth >= MIN_DEPTH_FOR_PREFIXED_DIRS;
}

function normalizeTitle(raw) {
  // keep only Arabic letters & underscores, then turn _+ into space
  return raw.replace(/[^\u0600-\u06FF_]/g, '').replace(/_+/g, ' ');
}

// === the generic tree-builder ===
async function buildTree({
  fileSystemBasePath,
  dirNames = [],
  slugs = [],
  prefix = '',
  depth = 0,
}) {
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

  const nodes = [];
  for (const de of entries) {
    if (!de.isDirectory()) continue;

    let fileName, fileOrder;
    try {
      ({ fileName, fileOrder } = parseDirName({
        directoryName: de.name,
        isDirectoryPrefixMandatory: requiresPrefix(depth),
      }));
    } catch (err) {
      console.warn(`Skipping "${de.name}" in ${root}: ${err.message}`);
      continue;
    }

    const title = normalizeTitle(fileName);
    const slug = fileName;
    const newSlugs = [...slugs, slug];
    const newPrefix = prefix ? `${prefix}/${slug}` : slug;

    const children = await buildTree({
      fileSystemBasePath,
      dirNames: [...dirNames, de.name],
      slugs: newSlugs,
      prefix: newPrefix,
      depth: depth + 1,
    });
    if (children === null) return null;

    nodes.push({
      title,
      slug,
      order: fileOrder,
      parentPath: slugs,
      fullPath: newPrefix,
      children,
    });
  }

  // sort by order, then title (Arabic locale)
  return nodes.sort((a, b) =>
    a.order !== b.order
      ? a.order - b.order
      : a.title.localeCompare(b.title, 'ar')
  );
}

// === main entrypoint ===
async function main() {
  const CONTENT_ROOT = path.join(process.cwd(), 'public', 'content');

  // build full tree from root
  const baseTree = await buildTree({
    fileSystemBasePath: CONTENT_ROOT,
    slugs: [],
    prefix: '',
    depth: 0,
  });
  if (!baseTree) {
    console.error('✖ failed to build base content tree');
    process.exit(1);
  }

  // for each subject/author/book, write a tree.json at depth 3
  for (const subject of baseTree) {
    for (const author of subject.children) {
      for (const book of author.children) {
        const lineageSlugs = [subject.slug, author.slug, book.slug];
        const lineagePrefix = lineageSlugs.join('/');

        const subtree = await buildTree({
          fileSystemBasePath: CONTENT_ROOT,
          dirNames: lineageSlugs,
          slugs: lineageSlugs,
          prefix: lineagePrefix,
          depth: 3,
        });
        if (!subtree) {
          console.warn(`⚠ skipped tree for ${lineageSlugs.join('/')}`);
          continue;
        }

        const outDir = path.join(
          CONTENT_ROOT,
          subject.slug,
          author.slug,
          book.slug
        );
        const outFile = path.join(outDir, 'tree.json');
        await fs.writeFile(outFile, JSON.stringify(subtree, null, 2), 'utf-8');
        console.log(`✔ wrote ${path.relative(process.cwd(), outFile)}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
