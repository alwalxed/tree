import { getDocsTree, getLeafDocs } from "@/lib/docs";
import { Info } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function Home() {
  const tree = await getDocsTree();
  const leafDocs = getLeafDocs(tree);
  const splitIndex = leafDocs.findIndex((doc) => doc.title.trim() === "المبني");

  const firstPart =
    splitIndex >= 0 ? leafDocs.slice(0, splitIndex + 1) : leafDocs;
  const secondPart = splitIndex >= 0 ? leafDocs.slice(splitIndex + 1) : [];

  const headerClassname = "text-3xl font-bold";
  const paragraphClassname = "text-lg";
  const gridClassname =
    "grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-4";
  const gridItemClassname =
    "p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors";
  const gridItemTitleClassname = "text-base";
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12">
      <Section>
        <h2 className={headerClassname}>{`مقدمة`}</h2>
        <p className={paragraphClassname}>
          {`النحو مكون من جزأين كبيرين لا ثالث لهما. فيدرس في الجزء الأول الكلمة: (أنواع الكلمة. وانقسام الاسم إلى نكرة ومعرفة. وانقسام الكلمة إلى معرب ومبني) ويدرس في الجزء الثاني الكلام: (الجملة الفعلية. الجملة الاسمية. مكملات الجملة الفعلية والاسمية. وإعراب الفعل المضارع)`}
        </p>
      </Section>

      <Separator />

      <Section>
        <h2 className={headerClassname}>{`الجزء الأول (الكلمة)`}</h2>
        <div className={gridClassname}>
          {firstPart.map((doc) => (
            <Link
              key={doc.slug}
              href={`/learn/${doc.slug}`}
              className={gridItemClassname}
            >
              <h2 className={gridItemTitleClassname}>{doc.title}</h2>
            </Link>
          ))}
        </div>
      </Section>

      <Separator />

      <Section>
        <h2 className={headerClassname}>{`الجزء الثاني (الكلام)`}</h2>
        <div className={gridClassname}>
          {secondPart.map((doc) => (
            <Link
              key={doc.slug}
              href={`/learn/${doc.slug}`}
              className={gridItemClassname}
            >
              <h2 className={gridItemTitleClassname}>{doc.title}</h2>
            </Link>
          ))}
        </div>
      </Section>

      <Separator />

      <Section>
        <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-md">
          <Info className="w-5 h-5 mt-1 text-green-600 dark:text-green-300" />
          <p className="text-sm leading-relaxed text-green-800 dark:text-green-200">
            {`أُنشئ مشروع النحو الرقمي لتيسير فهم النحو بتشجير واضح، معتمدا في تقسيمه على كتاب النحو الصغير للشيخ د. سليمان العيوني - بإذنه عبر البريد، ومن غير إشراف مباشر. الموقع مفتوح المصدر، ومساهمتك مرحّب بها.`}
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <section className="flex gap-6 flex-col">{children}</section>;
}

function Separator() {
  return <div className="w-full h-2 border-t border-zinc-200"></div>;
}
