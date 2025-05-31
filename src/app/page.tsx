import { redirect } from 'next/navigation';

export default function Page() {
  const target = encodeURI('/النحو/سليمان_العيوني/النحو_الصغير/');
  redirect(target);
}
