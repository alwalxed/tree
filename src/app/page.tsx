// TODO: Support multiple books in the future.
// For now, redirect to the only available book.

import { redirect } from 'next/navigation';

export default function Page() {
  // encodeURI will percent-encode the Arabic characters so they’re
  // valid in the Location header:
  const target = encodeURI('/النحو/سليمان_العيوني/النحو_الصغير/');
  redirect(target);
}
