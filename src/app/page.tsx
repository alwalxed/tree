import { redirect } from 'next/navigation';

export default function RootPage() {
  console.info('RAN: src/app/page.tsx');

  const target = encodeURI('/النحو/سليمان_العيوني/النحو_الصغير/');
  redirect(target);
}
