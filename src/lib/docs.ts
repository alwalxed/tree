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
};

export function getAllDocSlugs() {
  const fileNames = fs.readdirSync(docsDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ""),
    };
  });
}

export async function getDocBySlug(slug: string): Promise<DocItem | null> {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);

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

    return {
      slug,
      title: data.title || slug,
      content: contentHtml,
    };
  } catch (error) {
    console.error(`Error loading doc with slug ${slug}:`, error);
    return null;
  }
}

export async function getAllDocs(): Promise<DocItem[]> {
  const slugs = getAllDocSlugs();
  const docs = await Promise.all(
    slugs.map(async ({ slug }) => {
      const doc = await getDocBySlug(slug);
      return doc;
    })
  );

  // Filter out any null docs and sort by title
  return docs
    .filter((doc): doc is DocItem => doc !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}
