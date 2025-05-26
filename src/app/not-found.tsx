// import { Button } from "@/components/ui/button";
// import { flattenTree } from "@/lib/content/api";
// import { buildFullContentSummaryTree } from "@/lib/content/core/tree-builder";
// import { getNodeSlugPath } from "@/lib/content/query/get-node-path";
// import { FileQuestion, Home, Search } from "lucide-react";
// import Link from "next/link";

// export const metadata = {
//   title: "Page Not Found | Documentation",
//   description: "The page you're looking for doesn't exist or has been moved.",
// };

// export default async function NotFound() {
//   const summaryTree = await buildFullContentSummaryTree();
//   const flatTree = flattenTree(summaryTree);

//   const suggestedPages = flatTree.sort(() => 0.5 - Math.random()).slice(0, 3);

//   return (
//     <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
//       <div className="mb-8 rounded-full bg-slate-100 p-6 dark:bg-slate-800">
//         <FileQuestion className="h-16 w-16 text-slate-500" />
//       </div>

//       <h1 className="mb-2 text-4xl font-bold tracking-tight">
//         {`404 - Page Not Found`}
//       </h1>

//       <p className="mb-8 max-w-md text-lg text-slate-500 dark:text-slate-400">
//         {`The documentation page you're looking for doesn't exist or has been
//         moved to a new location.`}
//       </p>

//       <div className="mb-12 flex flex-wrap justify-center gap-4">
//         <Button asChild>
//           <Link href="/">
//             <Home className="mr-2 h-4 w-4" />
//             Back to Home
//           </Link>
//         </Button>

//         <Button variant="outline" asChild>
//           <Link href="/learn">
//             <Search className="mr-2 h-4 w-4" />
//             Browse All Docs
//           </Link>
//         </Button>
//       </div>

//       {suggestedPages.length > 0 && (
//         <>
//           <h2 className="mb-4 text-xl font-semibold">
//             You might be interested in:
//           </h2>

//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {suggestedPages.map((page) => (
//               <Link
//                 key={page.slug}
//                 href={`/learn/${getNodeSlugPath(page)}`}
//                 className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
//               >
//                 <h3 className="font-medium">{page.title}</h3>
//               </Link>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

export default function NotFound() {
  return <p>Not Found</p>;
}
