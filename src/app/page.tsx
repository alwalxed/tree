import { ToggleableSection } from "@/components/toggleable-section";
import { TreeDisplay } from "@/components/tree-display";
import { getDocsTree, getLeafDocs, printFolderTree } from "@/lib/docs";
import { Info } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function Home() {
  const fullDocs = await getDocsTree();
  const leafDocs = getLeafDocs(fullDocs);
  const gridSplitIndex = leafDocs.findIndex(
    (doc) => doc.title.trim() === "المبني"
  );

  const parts = {
    first: {
      grid:
        gridSplitIndex >= 0 ? leafDocs.slice(0, gridSplitIndex + 1) : leafDocs,
      tree: printFolderTree(fullDocs, {
        splitLevel: 0,
        splitString: "الكلمة",
      }),
    },
    second: {
      grid: gridSplitIndex >= 0 ? leafDocs.slice(gridSplitIndex + 1) : [],
      tree: printFolderTree(fullDocs, {
        splitLevel: 0,
        splitString: "الكلام",
      }),
    },
  };

  const styles = {
    headerClassname: "text-3xl font-bold",
    paragraphClassname: "text-lg",
    gridClassname:
      "grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-4",
    gridItemClassname:
      "p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors",
    gridItemTitleClassname: "text-base",
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12">
      <Section>
        <h2 className={styles.headerClassname}>{`مقدمة`}</h2>
        <p className={styles.paragraphClassname}>
          {`النحو مكون من جزأين كبيرين لا ثالث لهما. فيدرس في الجزء الأول الكلمة: (أنواع الكلمة. وانقسام الاسم إلى نكرة ومعرفة. وانقسام الكلمة إلى معرب ومبني) ويدرس في الجزء الثاني الكلام: (الجملة الفعلية. الجملة الاسمية. مكملات الجملة الفعلية والاسمية. وإعراب الفعل المضارع)`}
        </p>
      </Section>

      <Separator />

      <Section>
        <ToggleableSection
          title={`الجزء الأول (الكلمة)`}
          headerClassName={styles.headerClassname}
          treeView={<TreeDisplay content={parts.first.tree} />}
          gridView={
            <div className={styles.gridClassname}>
              {parts.first.grid.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/learn/${doc.slug}`}
                  className={styles.gridItemClassname}
                >
                  <h2 className={styles.gridItemTitleClassname}>{doc.title}</h2>
                </Link>
              ))}
            </div>
          }
        />
      </Section>

      <Separator />

      <Section>
        <ToggleableSection
          title={`الجزء الثاني (الكلام)`}
          headerClassName={styles.headerClassname}
          treeView={<TreeDisplay content={parts.second.tree} />}
          gridView={
            <div className={styles.gridClassname}>
              {parts.second.grid.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/learn/${doc.slug}`}
                  className={styles.gridItemClassname}
                >
                  <h2 className={styles.gridItemTitleClassname}>{doc.title}</h2>
                </Link>
              ))}
            </div>
          }
        />
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
