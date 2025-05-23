import { Section } from "@/components/common/section";
import { Visualizations } from "@/components/visualizations/visualizations";
import { buildContentTree } from "@/lib/content/operations/build-tree";

export default async function Page() {
  const tree = await buildContentTree();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12">
      <Section>
        <Section.H level={2}>{`مقدمة`}</Section.H>
        <Section.P>
          {`النحو مكون من جزأين كبيرين لا ثالث لهما. فيدرس في الجزء الأول الكلمة: (أنواع الكلمة. وانقسام الاسم إلى نكرة ومعرفة. وانقسام الكلمة إلى معرب ومبني) ويدرس في الجزء الثاني الكلام: (الجملة الفعلية. الجملة الاسمية. مكملات الجملة الفعلية والاسمية. وإعراب الفعل المضارع)`}
        </Section.P>
      </Section>

      <Section>
        <Section.H level={2}>{`الجزء الأول (الكلمة)`}</Section.H>
        <Visualizations
          nodes={tree.filter((node) => node.title.includes("الكلمة"))}
        />
      </Section>

      <Section>
        <Section.H level={2}>{`الجزء الثاني (الكلام)`}</Section.H>
        <Visualizations
          nodes={tree.filter((node) => node.title.includes("الكلام"))}
        />
      </Section>
    </div>
  );
}
