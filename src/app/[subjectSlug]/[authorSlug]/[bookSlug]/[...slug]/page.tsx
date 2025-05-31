type Params = Promise<{
  subjectSlug: string;
  authorSlug: string;
  bookSlug: string;
  slug: string[];
}>;

type Props = {
  params: Params;
};

// export async function generateMetadata({
//   params,
// }: {
//   params: Params;
// }): Promise<Metadata> {
//   const { subjectSlug, authorSlug, bookSlug, slug } = await params;
//   const decoded = {
//     subject: decodeURIComponent(subjectSlug),
//     author: decodeURIComponent(authorSlug),
//     book: decodeURIComponent(bookSlug),
//     slug: slug.map(decodeURIComponent),
//   };

//   const page = await loadBookPage({
//     fileSystemBasePath: FILESYSTEM_CONTENT_PATH,
//     contentPath: {
//       subjectSlug: decoded.subject,
//       authorSlug: decoded.author,
//       bookSlug: decoded.book,
//       slug: decoded.slug,
//     },
//   });

//   if (!page) return { title: '404' };

//   return {
//     title: page.pageTitle,
//     description: page.excerpt ?? undefined,
//   };
// }

export default async function Page({ params }: Props) {
  const { subjectSlug, authorSlug, bookSlug, slug } = await params;

  const decodedSlugs = {
    subject: decodeURIComponent(subjectSlug),
    author: decodeURIComponent(authorSlug),
    book: decodeURIComponent(bookSlug),
    slug: slug.map((item) => decodeURIComponent(item)),
  };

  return <h1>ss</h1>;

  // return (
  //   <article className="prose prose-slate dark:prose-invert mx-auto max-w-4xl p-6">
  //     <h1>{contentNode.pageTitle}</h1>

  //     {contentNode.pageTitle &&
  //       contentNode.pageTitle !== contentNode.pageTitle && (
  //         <p className="lead text-muted-foreground">
  //           (From Frontmatter: {contentNode.pageTitle})
  //         </p>
  //       )}

  //     {contentNode.contentHtml ? (
  //       <MarkdownRenderer content={contentNode.contentHtml} />
  //     ) : (
  //       <p className="text-muted-foreground">
  //         No content available for this section.
  //       </p>
  //     )}
  //   </article>
  // );
}
