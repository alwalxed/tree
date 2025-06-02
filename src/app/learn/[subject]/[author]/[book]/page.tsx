import { Section } from '@/components/common/section';
import { VisualizationSwitcher } from '@/components/visualizations/visualization-switcher';
import { listAllBooks, loadConfig, loadTree } from '@/lib/common/content';
import { Node } from '@/lib/schema/bookTree';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listAllBooks()).map(({ subject, author, book }) => ({
    subject: encodeURIComponent(subject),
    author: encodeURIComponent(author),
    book: encodeURIComponent(book),
  }));
}

export default async function BookPage({
  params: { subject, author, book },
}: {
  params: {
    subject: string;
    author: string;
    book: string;
  };
}) {
  const real = {
    subject: decodeURIComponent(subject),
    author: decodeURIComponent(author),
    book: decodeURIComponent(book),
  };
  const cfg = await loadConfig(real);
  const tree = await loadTree(real);
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {cfg.sections?.map((sec, i) => {
        if (sec.type === 'text') {
          return (
            <Section key={i}>
              <Section.H level={2}>{sec.title}</Section.H>
              <Section.P>
                {sec.content.map((l, j) => (
                  <span key={j}>
                    {l}
                    <br />
                  </span>
                ))}
              </Section.P>
            </Section>
          );
        }
        if (sec.type === 'visualization') {
          const nodes = (tree as Node[]).filter((n) =>
            n.title.includes(sec.chapterIdentifier)
          );
          return (
            <Section key={i}>
              <Section.H level={2}>{sec.title}</Section.H>
              <VisualizationSwitcher nodes={nodes} />
            </Section>
          );
        }
        return null;
      })}
    </div>
  );
}
