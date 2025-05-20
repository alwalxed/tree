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
  author?: string;
  keywords?: string[];
  coverImage?: string;
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

export function getAllDocSlugs() {
  const filePaths = getAllDocFilePaths();

  return filePaths.map((filePath) => {
    // Convert file path to slug
    // e.g., "getting-started/installation.md" -> "getting-started/installation"
    // Special case for index.md files
    let slug = filePath.replace(/\.md$/, "");
    if (slug.endsWith("/index")) {
      slug = slug.replace(/\/index$/, "");
    }

    return { slug };
  });
}

export async function getDocBySlug(slug: string): Promise<DocItem | null> {
  try {
    // Handle index files
    let filePath = `${slug}.md`;
    if (slug === "" || slug.endsWith("/")) {
      filePath = `${slug}index.md`;
    } else {
      // Check if this is a directory with an index.md file
      const potentialDirPath = path.join(docsDirectory, slug);
      const potentialIndexPath = path.join(potentialDirPath, "index.md");
      if (
        fs.existsSync(potentialDirPath) &&
        fs.statSync(potentialDirPath).isDirectory() &&
        fs.existsSync(potentialIndexPath)
      ) {
        filePath = `${slug}/index.md`;
      }
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

    return {
      slug,
      title: data.title || getDefaultTitleFromSlug(slug),
      content: contentHtml,
      excerpt,
      date: data.date ? new Date(data.date).toISOString() : undefined,
      author: data.author,
      keywords: data.keywords,
      coverImage: data.coverImage,
      order: data.order || 999, // Default order if not specified
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
