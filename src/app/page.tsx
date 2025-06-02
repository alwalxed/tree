// src/app/page.tsx
// TODO: A landing page for different books

import { redirect } from 'next/navigation';
import { slugify } from 'reversible-arabic-slugifier';

export default function RootPage() {
  const subject = slugify('النحو');
  const author = slugify('سليمان_العيوني');
  const book = slugify('النحو_الصغير');

  const target = `/learn/${subject}/${author}/${book}`;

  redirect(target);
}
