import { slugify } from 'reversible-arabic-slugifier';

export function getOGImagePath(urlPath: string): string {
  const parts = urlPath.split('/').filter(Boolean);
  if (parts[ 0 ] === 'learn') parts.shift();

  const filename = parts.map(part => slugify(part)).join('-') + '.png';
  return `/og/${ filename }`;
}

// For home page, add this helper:
export function getHomeOGImagePath(): string {
  return '/og/home.png';
}