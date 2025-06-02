// page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Use properly encoded URL parts to avoid redirect loops
  const subject = encodeURIComponent('النحو');
  const author = encodeURIComponent('سليمان_العيوني');
  const book = encodeURIComponent('النحو_الصغير');

  const target = `/learn/${subject}/${author}/${book}/`;

  console.log('Redirecting to:', target);
  redirect(target);
}
