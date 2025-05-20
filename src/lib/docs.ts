import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

const docsDirectory = path.join(process.cwd(), "docs");

export type DocItem = {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  date?: string;
  order?: number;
};

export type DocTreeItem = DocItem & {
  children: DocTreeItem[];
  isExpanded?: boolean;
  level: number;
  parentSlug?: string;
};

// Recursively get all markdown files
export function getAllDocFilePaths(
  dir = docsDirectory,
  rootDir = docsDirectory
): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = entries
    .filter((entry) => !entry.name.startsWith(".")) // Skip hidden files
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getAllDocFilePaths(fullPath, rootDir);
      } else if (entry.name.endsWith(".md")) {
        // Return path relative to the docs directory
        return [fullPath.replace(rootDir + path.sep, "")];
      } else {
        return [];
      }
    });

  return files;
}

// Extract slug from file path, removing numeric prefixes
function slugFromFilePath(filePath: string): string {
  let slug = filePath.replace(/\.md$/, "");

  if (slug.endsWith("/index")) {
    slug = slug.replace(/\/index$/, "");
  }

  const segments = slug.split("/");

  const cleanedSegments = segments.map((segment) => {
    // Remove leading numbers (Western or Arabic) followed by - or _
    return segment.replace(/^([\d\u0660-\u0669]+)[-_]+/, "");
  });

  return cleanedSegments.join("/");
}

export function getAllDocSlugs() {
  const filePaths = getAllDocFilePaths();

  return filePaths.map((filePath) => {
    const slug = slugFromFilePath(filePath);
    return { slug };
  });
}

// Get the original file path from a slug
function getFilePathFromSlug(slug: string): string | null {
  // Handle empty slug (root)
  if (slug === "") {
    if (fs.existsSync(path.join(docsDirectory, "index.md"))) {
      return "index.md";
    }
    return null;
  }

  // Split the slug into segments
  const slugSegments = slug.split("/");

  // Current directory we're checking
  let currentDir = docsDirectory;
  let currentPath = "";

  // Process each segment
  for (let i = 0; i < slugSegments.length; i++) {
    const segment = slugSegments[i];
    const isLast = i === slugSegments.length - 1;

    if (!isLast) {
      // This is a directory segment
      // Find the directory that matches this segment (possibly with numeric prefix)
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      const matchingDir = entries.find((entry) => {
        if (!entry.isDirectory()) return false;
        // Check if the directory name matches our segment after removing numeric prefix
        return entry.name.replace(/^(\d+)[-_]/, "") === segment;
      });

      if (!matchingDir) return null;

      // Update current directory and path
      currentDir = path.join(currentDir, matchingDir.name);
      currentPath = currentPath
        ? `${currentPath}/${matchingDir.name}`
        : matchingDir.name;
    } else {
      // This is the file segment
      // Check for direct file match first
      const mdFile = `${segment}.md`;
      if (fs.existsSync(path.join(currentDir, mdFile))) {
        return currentPath ? `${currentPath}/${mdFile}` : mdFile;
      }

      // Check for file with numeric prefix
      const entries = fs.readdirSync(currentDir);
      const matchingFile = entries.find((entry) => {
        if (!entry.endsWith(".md")) return false;
        // Remove .md and check if the name matches our segment after removing numeric prefix
        const entryName = entry.slice(0, -3);
        return entryName.replace(/^(\d+)[-_]/, "") === segment;
      });

      if (matchingFile) {
        return currentPath ? `${currentPath}/${matchingFile}` : matchingFile;
      }

      // Check for index.md in a matching directory
      const dirPath = path.join(currentDir, segment);
      const indexPath = path.join(dirPath, "index.md");
      if (
        fs.existsSync(dirPath) &&
        fs.statSync(dirPath).isDirectory() &&
        fs.existsSync(indexPath)
      ) {
        return currentPath
          ? `${currentPath}/${segment}/index.md`
          : `${segment}/index.md`;
      }

      // Check for directory with numeric prefix
      const matchingDir = entries.find((entry) => {
        const fullEntryPath = path.join(currentDir, entry);
        if (
          !fs.existsSync(fullEntryPath) ||
          !fs.statSync(fullEntryPath).isDirectory()
        )
          return false;
        // Check if the directory name matches our segment after removing numeric prefix
        return entry.replace(/^(\d+)[-_]/, "") === segment;
      });

      if (matchingDir) {
        const indexInMatchingDir = path.join(
          currentDir,
          matchingDir,
          "index.md"
        );
        if (fs.existsSync(indexInMatchingDir)) {
          return currentPath
            ? `${currentPath}/${matchingDir}/index.md`
            : `${matchingDir}/index.md`;
        }
      }
    }
  }

  return null;
}

export async function getDocBySlug(slug: string): Promise<DocItem | null> {
  try {
    // Get the actual file path for this slug
    const filePath = getFilePathFromSlug(slug);

    if (!filePath) {
      return null;
    }

    const fullPath = path.join(docsDirectory, filePath);

    // Check if the file exists
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark().use(html).process(content);

    const contentHtml = processedContent.toString();

    // Create an excerpt if one isn't provided
    const excerpt =
      data.excerpt ||
      content.trim().replace(/\s+/g, " ").slice(0, 160).trim() + "...";

    // Extract order from filename if not specified in frontmatter
    let order = data.order;
    if (order === undefined) {
      // Check if the filename has a numeric prefix
      const filename = path.basename(filePath);
      const match = filename.match(/^(\d+)[-_]/);
      if (match) {
        order = Number.parseInt(match[1], 10);
      } else {
        order = 999; // Default order if not specified
      }
    }

    return {
      slug,
      title: data.title || getDefaultTitleFromSlug(slug),
      content: contentHtml,
      excerpt,
      date: data.date ? new Date(data.date).toISOString() : undefined,
      order,
    };
  } catch (error) {
    console.error(`Error loading doc with slug ${slug}:`, error);
    return null;
  }
}

// Helper function to get a default title from a slug
function getDefaultTitleFromSlug(slug: string): string {
  // Get the last part of the slug
  const parts = slug.split("/");
  const lastPart = parts[parts.length - 1];

  // Convert kebab-case to Title Case
  return lastPart
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function getAllDocs(): Promise<DocItem[]> {
  const slugs = getAllDocSlugs();
  const docs = await Promise.all(
    slugs.map(async ({ slug }) => {
      const doc = await getDocBySlug(slug);
      return doc;
    })
  );

  // Filter out any null docs and sort by order then title
  return docs
    .filter((doc): doc is DocItem => doc !== null)
    .sort((a, b) => {
      // First sort by order
      if (a.order !== b.order) {
        return (a.order || 999) - (b.order || 999);
      }
      // Then sort by title
      return a.title.localeCompare(b.title);
    });
}

// Build a tree structure from flat docs list
export async function getDocsTree(): Promise<DocTreeItem[]> {
  const allDocs = await getAllDocs();

  // Create a map for quick lookup
  const docMap = new Map<string, DocTreeItem>();

  // Initialize all docs as tree items with empty children arrays
  allDocs.forEach((doc) => {
    docMap.set(doc.slug, {
      ...doc,
      children: [],
      level: doc.slug.split("/").filter(Boolean).length,
      isExpanded: false,
    });
  });

  // Build the tree structure
  const rootItems: DocTreeItem[] = [];

  // Process each doc
  docMap.forEach((docItem, slug) => {
    const pathParts = slug.split("/").filter(Boolean);

    if (pathParts.length === 0) {
      // This is a root item (empty slug means root index.md)
      rootItems.push(docItem);
    } else if (pathParts.length === 1) {
      // This is a top-level item
      rootItems.push(docItem);
    } else {
      // This is a nested item
      // Find the parent by removing the last part of the path
      const parentPath = pathParts.slice(0, -1).join("/");
      const parent = docMap.get(parentPath);

      if (parent) {
        parent.children.push(docItem);
        docItem.parentSlug = parentPath;
      } else {
        // If parent doesn't exist, add to root (shouldn't happen with proper structure)
        rootItems.push(docItem);
      }
    }
  });

  // Sort children recursively
  const sortChildren = (items: DocTreeItem[]) => {
    items.sort((a, b) => {
      // First sort by order
      if (a.order !== b.order) {
        return (a.order || 999) - (b.order || 999);
      }
      // Then sort by title
      return a.title.localeCompare(b.title);
    });

    // Sort children recursively
    items.forEach((item) => {
      if (item.children.length > 0) {
        sortChildren(item.children);
      }
    });
  };

  sortChildren(rootItems);

  return rootItems;
}
