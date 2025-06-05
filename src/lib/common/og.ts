import { deslugify, slugify } from 'reversible-arabic-slugifier';

export function getOGImagePath(urlPath: string): string {
  const parts = urlPath.split('/').filter(Boolean);
  if (parts[0] === 'learn') parts.shift();

  const decodedParts = parts.map((part) => deslugify(part));
  const filename = decodedParts.map((part) => slugify(part)).join('-') + '.png';
  return `/og/${filename}`;
}

export function getHomeOGImagePath(): string {
  return '/og/home.png';
}
