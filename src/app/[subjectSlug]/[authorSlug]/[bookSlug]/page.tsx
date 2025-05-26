// import { Section } from '@/components/common/section';
// import { VisualizationSwitcher } from '@/components/visualizations/visualization-switcher';
// import type {
//   ProcessedTextLandingSection,
//   ProcessedVisualizationLandingSection,
// } from '@/lib/content/types';
// import { notFound } from 'next/navigation';

// type Props = {
//   params: Promise<{
//     subjectSlug: string;
//     authorSlug: string;
//     bookSlug: string;
//   }>;
// };

// export default async function BookLandingPage({ params }: Props) {
//   const resolvedParams = await params;
//   const { subjectSlug, authorSlug, bookSlug } = resolvedParams;
//   const slugPath = [subjectSlug, authorSlug, bookSlug];

//   const bookNode = await getContentNodeBySlugPath(slugPath);

//   if (!bookNode) {
//     notFound();
//   }

//   if (!bookNode.landingPageConfig || !bookNode.landingPageConfig.sections) {
//     return (
//       <div className="mx-auto flex max-w-4xl flex-col gap-12 p-6">
//         <Section>
//           <Section.H level={1}>{bookNode.title}</Section.H>
//           <Section.P>
//             This book does not have a custom landing page configuration.
//           </Section.P>
//           {bookNode.children && bookNode.children.length > 0 && (
//             <div className="mt-6">
//               <Section.H level={3}>Content Overview:</Section.H>
//               <ul>
//                 {bookNode.children.map((child) => (
//                   <li key={child.slug}>
//                     <a
//                       href={`/${slugPath.join('/')}/${child.slug}`}
//                       className="text-blue-600 hover:underline"
//                     >
//                       {child.title}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </Section>
//       </div>
//     );
//   }

//   const { landingPageConfig } = bookNode;

//   return (
//     <div className="mx-auto flex max-w-4xl flex-col gap-12 p-6">
//       <Section>
//         <Section.H level={1}>{bookNode.title}</Section.H>
//       </Section>

//       {landingPageConfig.sections.map((section, index) => (
//         <Section key={`${section.type}-${index}`}>
//           <Section.H level={2}>{section.title}</Section.H>
//           {section.type === 'text' && (
//             <div>
//               {(section as ProcessedTextLandingSection).content.map(
//                 (paragraph, pIndex) => (
//                   <Section.P key={pIndex}>{paragraph}</Section.P>
//                 )
//               )}
//             </div>
//           )}
//           {section.type === 'visualization' && (
//             <VisualizationSwitcher
//               nodes={(section as ProcessedVisualizationLandingSection).nodes}
//             />
//           )}
//         </Section>
//       ))}
//     </div>
//   );
// }

export default function Page() {
  return <p>hi</p>;
}
