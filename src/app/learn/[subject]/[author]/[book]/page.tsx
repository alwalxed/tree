import { Section } from '@/components/common/section';
import { VisualizationSwitcher } from '@/components/visualizations/visualization-switcher';
import { CONTENT_URL } from '@/config/site';
import { ConfigSchema, type Config } from '@/lib/schema/bookConfig';
import { TreeSchema } from '@/lib/schema/bookTree';
import { Fragment } from 'react';

type Params = Promise<{
  subject: string;
  author: string;
  book: string;
}>;

type Props = {
  params: Params;
};

function safeDecodeURIComponent(str: string): string {
  try {
    const decoded = decodeURIComponent(str);
    if (decoded === decodeURIComponent(decoded)) {
      return decoded;
    }
    return str;
  } catch {
    return str;
  }
}

export default async function BookPage({ params }: Props) {
  const resolvedParams = await params;

  const d = {
    subject: safeDecodeURIComponent(resolvedParams.subject),
    author: safeDecodeURIComponent(resolvedParams.author),
    book: safeDecodeURIComponent(resolvedParams.book),
  };

  try {
    const cfgUrl = `${CONTENT_URL}/${encodeURIComponent(d.subject)}/${encodeURIComponent(d.author)}/${encodeURIComponent(d.book)}/config.json`;

    const cfgRes = await fetch(cfgUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!cfgRes.ok) {
      throw new Error('Failed to fetch CONF');
    }

    const cfgJSON = await cfgRes.json();
    const cfgParsed = ConfigSchema.safeParse(cfgJSON);

    if (!cfgParsed.success) {
      throw cfgParsed.error;
    }

    const cfgParsedData: Config = cfgParsed.data as Config;

    const treeUrl = `${CONTENT_URL}/${encodeURIComponent(d.subject)}/${encodeURIComponent(d.author)}/${encodeURIComponent(d.book)}/tree.json`;

    const treeRes = await fetch(treeUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!treeRes.ok) {
      throw new Error('Failed to fetch TREE');
    }

    const treeJSON = await treeRes.json();
    const treeParsed = TreeSchema.safeParse(treeJSON);

    if (!treeParsed.success) {
      throw treeParsed.error;
    }

    const treeParsedData = treeParsed.data;

    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        {treeParsedData && cfgParsedData.sections
          ? cfgParsedData.sections.map((section, index) => {
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
            })
          : null}
      </div>
    );
  } catch (error) {
    console.error('Error in BookPage:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">خطأ في تحميل الكتاب</h1>
          <p className="text-muted-foreground">
            حدث خطأ أثناء تحميل محتوى الكتاب
          </p>
        </div>
      </div>
    );
  }
}
