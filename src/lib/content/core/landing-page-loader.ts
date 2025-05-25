import { transliterate } from "@/lib/text/transliteration";
import fs from "fs/promises";
import path from "path";
import type {
  BookLandingPageConfigJson,
  ProcessedBookLandingPageConfig,
  ProcessedBookLandingSection,
  ProcessedTextLandingSection,
  ProcessedVisualizationLandingSection,
  SummaryNode,
} from "../types";

const CONTENT_BASE_PATH = path.join(process.cwd(), "content");
const LANDING_CONFIG_FILENAME = "landing.json";

const LOG_PREFIX = "[LandingPageLoader]";

export async function loadBookLandingPageConfigForBuild(
  bookNodeLatinSlugPath: string[],
  bookChapters: SummaryNode[],
) {
  if (bookNodeLatinSlugPath.length === 0) {
    console.log(
      `${LOG_PREFIX} Received empty bookNodeLatinSlugPath. Skipping.`,
    );
    return null;
  }

  const bookNodeArabicPathParts = bookNodeLatinSlugPath.map((latinSlugPart) =>
    transliterate({ input: latinSlugPart, mode: "latin-to-arabic" }),
  );

  const bookPathStringLatin = bookNodeLatinSlugPath.join("/");

  const landingConfigPath = path.join(
    CONTENT_BASE_PATH,
    ...bookNodeArabicPathParts, // Use Arabic parts for file system
    LANDING_CONFIG_FILENAME,
  );

  try {
    const fileContent = await fs.readFile(landingConfigPath, "utf-8");
    const rawConfig = JSON.parse(fileContent) as BookLandingPageConfigJson;

    if (!rawConfig || !Array.isArray(rawConfig.sections)) {
      return null;
    }

    const processedSections: ProcessedBookLandingSection[] = [];

    for (const [, section] of rawConfig.sections.entries()) {
      if (section.type === "text") {
        processedSections.push(section as ProcessedTextLandingSection);
      } else if (section.type === "visualization") {
        const vizSectionJson =
          section as import("../types").VisualizationLandingSectionJson;
        const chapterIdentifier = vizSectionJson.chapterIdentifier;

        const identifiedChapterNode = bookChapters.find((chapter) => {
          return chapter.title.includes(chapterIdentifier);
        });

        if (identifiedChapterNode) {
          const nodesForViz = identifiedChapterNode.children || [];
          processedSections.push({
            type: "visualization",
            title: vizSectionJson.title,
            nodes: nodesForViz,
          } as ProcessedVisualizationLandingSection);
        }

        const finalConfig: ProcessedBookLandingPageConfig = {
          sections: processedSections,
        };
        return finalConfig;
      }
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      console.log(
        `${LOG_PREFIX} Optional landing config file ${landingConfigPath} not found for book (Latin slug path: "${bookPathStringLatin}"). This is acceptable.`,
      );
    } else if (error instanceof SyntaxError) {
      console.warn(
        `${LOG_PREFIX} Invalid JSON in ${landingConfigPath}: ${error.message}`,
      );
    } else {
      console.error(
        `${LOG_PREFIX} Could not load or parse ${LANDING_CONFIG_FILENAME} for book (Latin slug path: ${bookPathStringLatin}). Path: ${landingConfigPath}. Error: ${err.message}`,
        err.stack,
      );
    }
    return null;
  }
}
