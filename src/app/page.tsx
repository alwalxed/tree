import { VisualizationSelector } from "@/components/visualization-selector";
import { getDocsTree, getLeafDocs, printFolderTree } from "@/lib/docs";
import type { ReactNode } from "react";

export default async function Home() {
  const fullDocs = await getDocsTree();
  const leafDocs = getLeafDocs(fullDocs);
  const gridSplitIndex = leafDocs.findIndex(
    (doc) => doc.title.trim() === "المبني"
  );

  const firstPartDocs = fullDocs.filter((doc) => doc.title.includes("الكلمة"));
  const secondPartDocs = fullDocs.filter((doc) => doc.title.includes("الكلام"));

  const parts = {
    first: {
      grid:
        gridSplitIndex >= 0 ? leafDocs.slice(0, gridSplitIndex + 1) : leafDocs,
      tree: printFolderTree(fullDocs, {
        splitLevel: 0,
        splitString: "الكلمة",
      }),
      docs: firstPartDocs,
    },
    second: {
      grid: gridSplitIndex >= 0 ? leafDocs.slice(gridSplitIndex + 1) : [],
      tree: printFolderTree(fullDocs, {
        splitLevel: 0,
        splitString: "الكلام",
      }),
      docs: secondPartDocs,
    },
  };

  const styles = {
    headerClassname: "text-3xl font-bold",
    paragraphClassname: "text-lg",
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
        <VisualizationSelector
          title={`الجزء الأول (الكلمة)`}
          headerClassName={styles.headerClassname}
          treeContent={parts.first.tree}
          gridItems={parts.first.grid}
          docData={parts.first.docs}
        />
      </Section>

      <Separator />

      <Section>
        <VisualizationSelector
          title={`الجزء الثاني (الكلام)`}
          headerClassName={styles.headerClassname}
          treeContent={parts.second.tree}
          gridItems={parts.second.grid}
          docData={parts.second.docs}
        />
      </Section>

      <Separator />
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <section className="flex gap-6 flex-col">{children}</section>;
}

function Separator() {
  return <div className="w-full h-2 border-t border-zinc-200"></div>;
}
