import { getDocsTree, getLeafDocs } from "@/lib/docs";
import Link from "next/link";

export default async function Home() {
  const tree = await getDocsTree();
  const leafDocs = getLeafDocs(tree);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">الرئيسة</h1>
      <p className="mb-8 text-lg">
        مرحبًا بك في موقع النحو الرقمي! أُنشئ لتيسير فهم النحو بتشجيرٍ واضح
        وتقسيمٍ مرتّب. اعتمد في تقسيمه وبنائه على كتاب النحو الصغير للشيخ د.
        سليمان العيوني –حفظه الله– بعد الاستئذان منه عبر البريد، من غير إشراف
        مباشر، فما كان من خطأ فعلى المطوّر. الموقع مفتوح المصدر، ومساهمتك محلّ
        ترحيب
      </p>

      <div className="grid gap-4 grid-cols-3">
        {leafDocs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <h2 className="text-xl font-semibold">{doc.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
