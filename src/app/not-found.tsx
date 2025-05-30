// app/not-found.tsx
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-zinc-500" />
        <h1 className="mb-2 text-6xl font-bold text-zinc-800">٤٠٤</h1>
        <p className="mb-6 text-zinc-600">
          عفواً! الصفحة التي تبحث عنها غير موجودة.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-zinc-800 px-4 py-2 text-white transition-colors hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </main>
  );
}
