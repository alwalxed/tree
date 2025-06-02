// TODO: A landing page for different books

import { redirect } from 'next/navigation';

export default function RootPage() {
  const subject = encodeURIComponent('النحو');
  const author = encodeURIComponent('سليمان_العيوني');
  const book = encodeURIComponent('النحو_الصغير');

  const target = `/learn/${subject}/${author}/${book}/`;

  redirect(target);
}
