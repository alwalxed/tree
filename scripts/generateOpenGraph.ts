#!/usr/bin/env tsx

import { listAllBooks, listAllPages } from '@/lib/common/content';
import fs from 'fs/promises';
import path from 'path';
import { deslugify, slugify } from 'reversible-arabic-slugifier';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'og');

const WIDTH = 1200;
const HEIGHT = 630;

function createBreadcrumb(urlParts: string[]): string {
  const decoded = urlParts.map(deslugify);
  const cleaned = decoded.map((part) => part.replace(/_/g, ' '));

  return cleaned.join(' ← ');
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  minFontSize: number = 16,
  maxFontSize: number = 60
): { fontSize: number; lines: string[] } {
  let fontSize = maxFontSize;
  let lines: string[] = [];

  while (fontSize >= minFontSize) {
    lines = wrapText(text, maxWidth, fontSize);
    const lineHeight = fontSize * 1.6;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      break;
    }

    fontSize -= 2;
  }

  return { fontSize: Math.max(fontSize, minFontSize), lines };
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  // More accurate character width estimation for Arabic/mixed text
  const avgCharWidth = fontSize * 0.65;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;

    // More conservative line breaking
    if (testLine.length > maxCharsPerLine * 0.85 && currentLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  // Handle very long words by breaking them intelligently
  const finalLines: string[] = [];
  for (const line of lines) {
    if (line.length > maxCharsPerLine) {
      const maxLineLength = Math.floor(maxCharsPerLine * 0.9);
      let remainingText = line;

      while (remainingText.length > maxLineLength) {
        let breakPoint = maxLineLength;
        // Look for a good break point (space, dash, etc.)
        const nearbySpace = remainingText.lastIndexOf(' ', breakPoint);
        const nearbyDash = remainingText.lastIndexOf('-', breakPoint);
        const bestBreak = Math.max(nearbySpace, nearbyDash);

        if (bestBreak > maxLineLength * 0.6) {
          breakPoint = bestBreak;
        }

        finalLines.push(remainingText.slice(0, breakPoint).trim());
        remainingText = remainingText.slice(breakPoint).trim();
      }

      if (remainingText) {
        finalLines.push(remainingText);
      }
    } else {
      finalLines.push(line);
    }
  }

  return finalLines;
}

function generateOpenGraphSVG(breadcrumb: string): string {
  // Increased margins for better spacing
  const horizontalMargin = 150;
  const verticalMargin = 100;

  // Site title configuration
  const titleFontSize = 96;
  const titleHeight = titleFontSize * 1.2;

  // Calculate available space for breadcrumb
  const maxBreadcrumbWidth = WIDTH - horizontalMargin * 2;
  const titleBottomY = verticalMargin + titleHeight;

  // Gap between title and breadcrumb
  const titleBreadcrumbGap = 80;

  // Available space for breadcrumb
  const breadcrumbStartY = titleBottomY + titleBreadcrumbGap;
  const maxBreadcrumbHeight = HEIGHT - breadcrumbStartY - verticalMargin;

  // Calculate optimal font size and lines for breadcrumb
  const { fontSize: breadcrumbFontSize, lines: breadcrumbLines } =
    calculateOptimalFontSize(
      breadcrumb,
      maxBreadcrumbWidth,
      maxBreadcrumbHeight,
      22, // min font size
      48 // max font size
    );

  const lineHeight = breadcrumbFontSize * 1.6;
  const totalBreadcrumbHeight = breadcrumbLines.length * lineHeight;

  // Center the breadcrumb vertically in available space
  const breadcrumbCenterY =
    breadcrumbStartY + (maxBreadcrumbHeight - totalBreadcrumbHeight) / 2;
  const firstLineY = breadcrumbCenterY + breadcrumbFontSize;

  const escapedLines = breadcrumbLines.map(escapeXml);
  const escapedTitle = escapeXml('شجرة');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient background -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
    
    <!-- Shadow filter -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000020"/>
    </filter>
  </defs>
  
  <!-- Gradient background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGradient)"/>
  
  <!-- Subtle border -->
  <rect x="2" y="2" width="${WIDTH - 4}" height="${HEIGHT - 4}" fill="none" stroke="#cbd5e1" stroke-width="2" rx="8"/>
  
  <!-- Site title - centered with proper spacing -->
  <text x="${WIDTH / 2}" y="${verticalMargin + titleFontSize}" 
        font-family="system-ui, -apple-system, Arial, sans-serif" 
        font-size="${titleFontSize}" 
        font-weight="900" 
        fill="#0f172a" 
        text-anchor="middle" 
        direction="rtl" 
        filter="url(#textShadow)">${escapedTitle}</text>
  
  <!-- Breadcrumb lines - dynamically sized and centered -->
  ${escapedLines
    .map(
      (line, index) => `
  <text x="${WIDTH / 2}" y="${firstLineY + index * lineHeight}" 
        font-family="system-ui, -apple-system, Arial, sans-serif" 
        font-size="${breadcrumbFontSize}" 
        font-weight="500"
        fill="#1e293b" 
        text-anchor="middle" 
        direction="rtl">${line}</text>`
    )
    .join('')}
</svg>`;

  return svg;
}

async function convertSvgToPng(
  svgContent: string,
  outputPath: string
): Promise<void> {
  try {
    await sharp(Buffer.from(svgContent))
      .png({
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true,
        force: true,
      })
      .toFile(outputPath);
  } catch (error) {
    console.error(`Error converting SVG to PNG for ${outputPath}:`, error);
    throw error;
  }
}

async function generateAllOpenGraphImages() {
  try {
    console.log('🖼️  Generating OpenGraph PNG images...');

    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const [books, pages] = await Promise.all([listAllBooks(), listAllPages()]);

    let generatedCount = 0;

    // Generate home image
    const homeBreadcrumb = 'شجرة - موقع الكتب المشجرة';
    const homeImage = generateOpenGraphSVG(homeBreadcrumb);
    await convertSvgToPng(homeImage, path.join(OUTPUT_DIR, 'home.png'));
    generatedCount++;

    // Generate book images
    for (const { subject, author, book } of books) {
      const urlSafePath = [subject, author, book].map(slugify);
      const breadcrumb = createBreadcrumb([subject, author, book]);
      const filename = urlSafePath.join('-') + '.png';

      const image = generateOpenGraphSVG(breadcrumb);
      await convertSvgToPng(image, path.join(OUTPUT_DIR, filename));
      generatedCount++;

      if (generatedCount % 10 === 0) {
        console.log(`📊 Generated ${generatedCount} images so far...`);
      }
    }

    // Generate page images
    for (const { subject, author, book, slug } of pages) {
      const urlSafePath = [subject, author, book, ...slug].map(slugify);
      const breadcrumb = createBreadcrumb([subject, author, book, ...slug]);
      const filename = urlSafePath.join('-') + '.png';

      const image = generateOpenGraphSVG(breadcrumb);
      await convertSvgToPng(image, path.join(OUTPUT_DIR, filename));
      generatedCount++;

      if (generatedCount % 50 === 0) {
        console.log(`📊 Generated ${generatedCount} images so far...`);
      }
    }

    console.log(
      `✅ Generated ${generatedCount} OpenGraph PNG images successfully`
    );
    console.log(
      `📁 Images saved to: ${path.relative(process.cwd(), OUTPUT_DIR)}`
    );
  } catch (error) {
    console.error('❌ Error generating OpenGraph images:', error);
    process.exit(1);
  }
}

export function generateSingleOGImage(urlPath: string): string {
  const parts = urlPath.split('/').filter(Boolean);
  if (parts[0] === 'learn') parts.shift();

  const filename = parts.map(slugify).join('-') + '.png';
  return filename;
}

if (require.main === module) {
  generateAllOpenGraphImages();
}
