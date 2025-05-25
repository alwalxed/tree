// TODO: Support multiple books in the future.
// For now, redirect to the only available book.

import { redirect } from "next/navigation";

export default function Page() {
  redirect("/alnhw/slyman-alaywny/alnhw-alsghyr/");
}
