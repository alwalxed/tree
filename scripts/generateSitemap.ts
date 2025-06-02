#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { slugify } from 'reversible-arabic-slugifier';

import { listAllBooks, listAllPages } from '../src/lib/common/content.js';

const SITE_URL = process.env.SITE_URL || 'https://tree.alwalxed.com';
const OUTPUT_DIR = path.join(process.cwd(), 'public');

function generateSitemapXML(
  entries: Array<{
    url: string;
    lastModified: string;
    changeFrequency: string;
    priority: string;
  }>
) {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const footer = `</urlset>`;

  const urls = entries
    .map(
      (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('');

  return header + urls + footer;
}

async function generateSitemap() {
  try {
    console.log('🗺️  Generating sitemap using existing content functions...');

    const [books, pages] = await Promise.all([listAllBooks(), listAllPages()]);

    const currentDate = new Date().toISOString().split('T')[0];

    const sitemapEntries = [
      // Homepage
      {
        url: SITE_URL,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: '1.0',
      },
    ];

    // Book root pages
    books.forEach(({ subject, author, book }) => {
      const urlSafePath = [subject, author, book].map(slugify).join('/');
      sitemapEntries.push({
        url: `${SITE_URL}/learn/${urlSafePath}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: '0.8',
      });
    });

    // Individual content pages
    pages.forEach(({ subject, author, book, slug }) => {
      const urlSafePath = [subject, author, book, ...slug]
        .map(slugify)
        .join('/');
      sitemapEntries.push({
        url: `${SITE_URL}/learn/${urlSafePath}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: '0.6',
      });
    });

    console.log(`📊 Generated ${sitemapEntries.length} sitemap entries`);
    console.log(`📚 Found ${books.length} books and ${pages.length} pages`);

    const sitemapXML = generateSitemapXML(sitemapEntries);

    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const sitemapPath = path.join(OUTPUT_DIR, 'sitemap.xml');
    await fs.writeFile(sitemapPath, sitemapXML, 'utf-8');

    console.log(
      `✅ Sitemap generated successfully: ${path.relative(process.cwd(), sitemapPath)}`
    );

    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: *.json

Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}
`;

    const robotsPath = path.join(OUTPUT_DIR, 'robots.txt');
    await fs.writeFile(robotsPath, robotsTxt, 'utf-8');

    console.log(
      `✅ Robots.txt generated successfully: ${path.relative(process.cwd(), robotsPath)}`
    );
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
