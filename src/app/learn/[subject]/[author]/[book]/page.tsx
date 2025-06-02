// [subject]/[author]/[book]/page.tsx
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

// Helper function to safely decode URI components
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
  console.info('RAN: src/app/[subject]/[author]/[book]/page.tsx');

  const resolvedParams = await params;

  // Safely decode parameters
  const d = {
    subject: safeDecodeURIComponent(resolvedParams.subject),
    author: safeDecodeURIComponent(resolvedParams.author),
    book: safeDecodeURIComponent(resolvedParams.book),
  };

  try {
    // Fetch config
    const cfgUrl = `${CONTENT_URL}/${encodeURIComponent(d.subject)}/${encodeURIComponent(d.author)}/${encodeURIComponent(d.book)}/config.json`;
    console.log('Fetching config from:', cfgUrl);

    const cfgRes = await fetch(cfgUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!cfgRes.ok) {
      console.error('Failed to fetch config:', cfgRes.status);
      throw new Error('Failed to fetch CONF');
    }

    const cfgJSON = await cfgRes.json();
    const cfgParsed = ConfigSchema.safeParse(cfgJSON);

    if (!cfgParsed.success) {
      console.error('Config schema validation failed:', cfgParsed.error);
      throw cfgParsed.error;
    }

    const cfgParsedData: Config = cfgParsed.data as Config;

    // Fetch tree
    const treeUrl = `${CONTENT_URL}/${encodeURIComponent(d.subject)}/${encodeURIComponent(d.author)}/${encodeURIComponent(d.book)}/tree.json`;
    console.log('Fetching tree from:', treeUrl);

    const treeRes = await fetch(treeUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!treeRes.ok) {
      console.error('Failed to fetch tree:', treeRes.status);
      throw new Error('Failed to fetch TREE');
    }

    const treeJSON = await treeRes.json();
    const treeParsed = TreeSchema.safeParse(treeJSON);

    if (!treeParsed.success) {
      console.error('Tree schema validation failed:', treeParsed.error);
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
    // Return a fallback UI instead of throwing
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
