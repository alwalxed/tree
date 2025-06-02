#!/usr/bin/env node

const fs = require('fs/promises');
const Fs = require('fs');
const path = require('path');

// === constants + helpers ===
const MIN_DEPTH_FOR_PREFIXED_DIRS = 3;

function convertArabicNumeralsToEn(value) {
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
    return {
      fileOrder: order,
      fileName: rest,
      isPrefixed: true,
      originalDirectoryName: directoryName, // Keep the original name with prefix
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

function requiresPrefix(depth) {
  return depth >= MIN_DEPTH_FOR_PREFIXED_DIRS;
}

function normalizeTitle(raw) {
  return raw.replace(/[^\u0600-\u06FF_]/g, '').replace(/_+/g, ' ');
}

// === VALIDATION FUNCTIONS ===
function validateDirectoryName(dirName, dirPath, depth) {
  const issues = [];

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
  const hasNonArabicChars = /[^\u0600-\u06FF]/.test(
    withoutPrefixAndUnderscores
  );

  if (hasNonArabicChars) {
    const nonArabicChars =
      withoutPrefixAndUnderscores.match(/[^\u0600-\u06FF]/g);
    if (nonArabicChars) {
      issues.push(
        `Contains non-Arabic characters: "${nonArabicChars.join(', ')}"`
      );
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

async function validateLeafDirectory(dirPath) {
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
      const issues = [];

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

function isLeafDirectory(children) {
  return children.length === 0;
}

// === the generic tree-builder ===
async function buildTree({
  fileSystemBasePath,
  dirNames = [],
  slugs = [],
  slugsWithPrefix = [],
  prefix = '',
  prefixWithPrefixes = '',
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

    // Validate directory name
    const currentDirPath = path.join(root, de.name);
    validateDirectoryName(de.name, currentDirPath, depth);

    let fileName, fileOrder, originalDirectoryName;
    try {
      ({ fileName, fileOrder, originalDirectoryName } = parseDirName({
        directoryName: de.name,
        isDirectoryPrefixMandatory: requiresPrefix(depth),
      }));
    } catch (err) {
      console.warn(`Skipping "${de.name}" in ${root}: ${err.message}`);
      continue;
    }

    const title = normalizeTitle(fileName);
    const slug = fileName;
    const slugWithPrefix = originalDirectoryName;

    const newSlugs = [...slugs, slug];
    const newSlugsWithPrefix = [...slugsWithPrefix, slugWithPrefix];

    // build the "flat" prefix (no leading slash)
    const flatPrefix = prefix ? `${prefix}/${slug}` : slug;
    const flatPrefixWithPrefixes = prefixWithPrefixes
      ? `${prefixWithPrefixes}/${slugWithPrefix}`
      : slugWithPrefix;

    // make it absolute
    const fullPath = `/${flatPrefix}`;
    const fullPathWithPrefixes = `/${flatPrefixWithPrefixes}`;

    const children = await buildTree({
      fileSystemBasePath,
      dirNames: [...dirNames, de.name],
      slugs: newSlugs,
      slugsWithPrefix: newSlugsWithPrefix,
      prefix: flatPrefix,
      prefixWithPrefixes: flatPrefixWithPrefixes,
      depth: depth + 1,
    });
    if (children === null) return null;

    nodes.push({
      title,
      slug,
      slugWithPrefix,
      order: fileOrder,
      parentPath: slugs,
      parentPathWithPrefixedSlugs: slugsWithPrefix,
      fullPath,
      fullPathWithPrefixes,
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
      const leafPath = path.join(
        fileSystemBasePath,
        ...dirNames,
        node.slugWithPrefix
      );
      await validateLeafDirectory(leafPath);
    }
  }

  return sortedNodes;
}

// === main entrypoint ===
async function main() {
  const CONTENT_ROOT = path.join(process.cwd(), 'content');

  console.log('🔍 Starting content validation and tree generation...\n');

  // build full tree from root
  const baseTree = await buildTree({
    fileSystemBasePath: CONTENT_ROOT,
    slugs: [],
    slugsWithPrefix: [],
    prefix: '',
    prefixWithPrefixes: '',
    depth: 0,
  });
  if (!baseTree) {
    console.error('✖ failed to build base content tree');
    process.exit(1);
  }

  console.log('\n📁 Generating tree.json files...\n');

  // for each subject/author/book, write a tree.json at depth 3
  for (const subject of baseTree) {
    for (const author of subject.children) {
      for (const book of author.children) {
        const lineageSlugs = [subject.slug, author.slug, book.slug];
        const outDir = path.join(CONTENT_ROOT, ...lineageSlugs);
        const outFile = path.join(outDir, 'tree.json');

        // build subtree
        const subtree = await buildTree({
          fileSystemBasePath: CONTENT_ROOT,
          dirNames: lineageSlugs,
          slugs: lineageSlugs,
          slugsWithPrefix: [
            subject.slugWithPrefix,
            author.slugWithPrefix,
            book.slugWithPrefix,
          ],
          prefix: lineageSlugs.join('/'),
          prefixWithPrefixes: [
            subject.slugWithPrefix,
            author.slugWithPrefix,
            book.slugWithPrefix,
          ].join('/'),
          depth: 3,
        });
        if (!subtree) {
          console.warn(`⚠ skipped tree for ${lineageSlugs.join('/')}`);
          continue;
        }

        // prepare new content
        const newContent = JSON.stringify(subtree, null, 2);

        // read existing and compare
        let existingRaw = null;
        try {
          existingRaw = await fs.readFile(outFile, 'utf-8');
        } catch (err) {
          if (err.code !== 'ENOENT') throw err;
        }

        let shouldWrite = true;
        if (existingRaw !== null) {
          try {
            const existingObj = JSON.parse(existingRaw);
            const oldContent = JSON.stringify(existingObj, null, 2);
            if (oldContent === newContent) shouldWrite = false;
          } catch {
            // if parse fails, overwrite
          }
        }

        if (shouldWrite) {
          await fs.mkdir(outDir, { recursive: true });
          await fs.writeFile(outFile, newContent, 'utf-8');
          console.log(`✔ wrote ${path.relative(process.cwd(), outFile)}`);
        } else {
          console.log(
            `✓ skip (no changes) ${path.relative(process.cwd(), outFile)}`
          );
        }
      }
    }
  }

  console.log('\n✅ Validation and tree generation completed!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
