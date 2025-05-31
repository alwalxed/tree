import { Section } from '@/components/common/section';
import { VisualizationSwitcher } from '@/components/visualizations/visualization-switcher';
import { CONTENT_URL } from '@/config/site';
import { ConfigSchema, type Config } from '@/lib/schema/bookConfig';
import { TreeSchema } from '@/lib/schema/bookTree';
import { Fragment } from 'react';

type Params = Promise<{
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
}>;

type Props = {
  params: Params;
};

export default async function BookLandingPage({ params }: Props) {
  const { subjectSlug, authorSlug, bookSlug } = await params;

  const decodedSlugs = {
    subject: decodeURIComponent(subjectSlug),
    author: decodeURIComponent(authorSlug),
    book: decodeURIComponent(bookSlug),
  };

  const cfgRes = await fetch(
    `${CONTENT_URL}/${decodedSlugs.subject}/${decodedSlugs.author}/${decodedSlugs.book}/config.json`
  );

  if (!cfgRes.ok) {
    throw new Error('Failed to fetch CONF');
  }

  const cfgJSON = await cfgRes.json();
  const cfgParsed = await ConfigSchema.safeParse(cfgJSON);

  if (!cfgParsed.success) {
    throw cfgParsed.error;
  }

  const cfgParsedData: Config = cfgParsed.data as Config;

  const treeRes = await fetch(
    `${CONTENT_URL}/${decodedSlugs.subject}/${decodedSlugs.author}/${decodedSlugs.book}/tree.json`
  );

  if (!treeRes.ok) {
    throw new Error('Failed to fetch TREE');
  }

  const treeJSON = await treeRes.json();
  const treeParsed = await TreeSchema.safeParse(treeJSON);

  if (!treeParsed.success) {
    throw treeParsed.error;
  }

  const treeParsedData = treeParsed.data;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12">
      {cfgParsedData.sections.map((section, index) => {
        switch (section.type) {
          case 'text':
            return (
              <Section key={`${index}-${section.title}-${section.type}`}>
                <Section.H level={2}>{section.title}</Section.H>
                <Section.P>
                  {section.content.map((line, i) => (
                    <Fragment
                      key={`${index}-${section.title}-${section.type}-${i}`}
                    >
                      {line}
                      <br />
                    </Fragment>
                  ))}
                </Section.P>
              </Section>
            );
          case 'visualization':
            return (
              <Section key={`${index}-${section.title}-${section.type}`}>
                <Section.H level={2}>{section.title}</Section.H>
                <VisualizationSwitcher
                  nodes={treeParsedData.filter((node) =>
                    node.title.includes(section.chapterIdentifier)
                  )}
                />
              </Section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
