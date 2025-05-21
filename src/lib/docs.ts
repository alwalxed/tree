const arabicToEnglishMap: Record<string, string> = {
  // letters
  ا: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ء: "",
  ى: "a",
  ئ: "y",
  ؤ: "w",
  ة: "h",
  "ٓ": "",
  إ: "i",
  أ: "a",
  آ: "aa",

  // numbers
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function arabicToEnglish(text: string): string {
  return [...text].map((char) => arabicToEnglishMap[char] ?? "").join("");
}

function extractOrderAndName(name: string): { order: number; raw: string } {
  const match = name.match(/^([٠-٩0-9]+)_+(.+)$/);
  if (!match) return { order: 0, raw: name };
  const arabicNumber = match[1];
  const raw = match[2];
  const order = parseInt(arabicToEnglish(arabicNumber), 10);
  return { order, raw };
}

function normalizeSlug(raw: string): string {
  const withoutExt = raw.replace(/\.md$/, "");
  const arabicOnly = withoutExt.replace(/[^\u0600-\u06FF_]/g, "");
  const transliterated = arabicToEnglish(arabicOnly);
  return transliterated.replace(/_+/g, "-");
}

function normalizeTitle(raw: string): string {
  const arabicOnly = raw.replace(/[^\u0600-\u06FF_]/g, "");
  return arabicOnly.replace(/_+/g, " ");
}

import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

export interface DocNode {
  title: string;
  slug: string;
  order: number;
  excerpt?: string;
  contentHtml?: string;
  children: DocNode[];
  parentPath: string[];
}

const basePath = path.join(process.cwd(), "markdown");

export async function getDocsTree(
  dir = basePath,
  parentPath: string[] = []
): Promise<DocNode[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const nodes: DocNode[] = [];

  for (const entry of entries) {
    if (entry.name === "index.md") continue;

    const fullPath = path.join(dir, entry.name);
    const { order, raw } = extractOrderAndName(entry.name);
    const title = normalizeTitle(raw);
    const slug = normalizeSlug(raw);
    const currentPath = [...parentPath, slug];

    let node: DocNode = {
      title,
      slug,
      order,
      children: [],
      parentPath,
    };

    if (entry.isDirectory()) {
      const indexPath = path.join(fullPath, "index.md");
      if (fs.existsSync(indexPath)) {
        const fileContents = fs.readFileSync(indexPath, "utf8");
        const { data, content } = matter(fileContents);
        const processedContent = await remark().use(html).process(content);
        node.excerpt = data.excerpt || "";
        node.contentHtml = processedContent.toString();
      }
      node.children = await getDocsTree(fullPath, currentPath);
    }

    nodes.push(node);
  }

  // Sort by `order`
  nodes.sort((a, b) => a.order - b.order);
  return nodes;
}

export function findDeepestNode(
  tree: DocNode[],
  slugPath: string[]
): DocNode | null {
  let current: DocNode | undefined;

  for (const slug of slugPath) {
    current = (current?.children ?? tree).find((node) => node.slug === slug);
    if (!current) return null;
  }

  return current ?? null;
}

// For getStaticPaths in Next.js
export async function getAllDocSlugs() {
  const tree = await getDocsTree();

  const slugs: string[][] = [];
  function walk(node: DocNode, currentPath: string[]) {
    const newPath = [...currentPath, node.slug];
    slugs.push(newPath);
    node.children.forEach((child) => walk(child, newPath));
  }

  tree.forEach((node) => walk(node, []));
  return slugs;
}

export async function getDocBySlug(slugPath: string[]) {
  const tree = await getDocsTree();
  const node = findDeepestNode(tree, slugPath);
  return node;
}

export function getLeafDocs(
  docs: DocNode[]
): { title: string; slug: string }[] {
  const leaves: { title: string; slug: string }[] = [];

  function walk(node: DocNode, path: string[] = []) {
    const fullPath = [...path, node.slug];
    if (node.children.length === 0) {
      leaves.push({
        title: node.title,
        slug: fullPath.join("/"),
      });
    } else {
      node.children.forEach((child) => walk(child, fullPath));
    }
  }

  docs.forEach((doc) => walk(doc));
  return leaves;
}

/**
 * Prints a normalized ASCII folder tree from DocNodes.
 * @param docs The document tree (from getDocsTree).
 * @param options Options for tree rendering.
 */
export function printFolderTree(
  docs: DocNode[],
  options: {
    indent?: string;
    splitLevel?: number;
    splitString?: string;
    currentLevel?: number;
  } = {}
): string {
  const {
    indent = "",
    splitLevel = Infinity,
    splitString = "",
    currentLevel = 0,
  } = options;

  let result = "";

  docs.forEach((node, index) => {
    const isLast = index === docs.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const nextIndent = indent + (isLast ? "    " : "│   ");

    const cleanTitle = node.title.replace(/_/g, " ");

    if (currentLevel === splitLevel) {
      // Only include the node matching splitString
      if (cleanTitle === splitString) {
        result += `${indent}${branch}${cleanTitle}\n`;
        if (node.children.length > 0) {
          result += printFolderTree(node.children, {
            indent: nextIndent,
            splitLevel: Infinity, // Prevent further filtering
            splitString,
            currentLevel: currentLevel + 1,
          });
        }
      }
    } else {
      // Normal printing until splitLevel
      result += `${indent}${branch}${cleanTitle}\n`;
      if (node.children.length > 0) {
        result += printFolderTree(node.children, {
          indent: nextIndent,
          splitLevel,
          splitString,
          currentLevel: currentLevel + 1,
        });
      }
    }
  });

  return result;
}

function getBreadcrumbs(
  node: DocNode,
  fullTree: DocNode[]
): { title: string; slug: string }[] {
  const breadcrumbs: { title: string; slug: string }[] = [];
  let current: DocNode | null = findDeepestNode(fullTree, node.parentPath);

  while (current) {
    breadcrumbs.unshift({ title: current.title, slug: current.slug });
    current = findDeepestNode(fullTree, current.parentPath);
  }

  return breadcrumbs;
}
