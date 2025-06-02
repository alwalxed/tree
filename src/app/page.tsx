// TODO: A landing page for different books

import { redirect } from 'next/navigation';

export default function RootPage() {
  const subject = encodeURI('النحو');
  const author = encodeURI('سليمان_العيوني');
  const book = encodeURI('النحو_الصغير');

  const target = `/learn/${subject}/${author}/${book}`;

  redirect(target);
}
