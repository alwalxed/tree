import { DevDebuggers } from "@/components/debug";
import { Sidebar } from "@/components/layout/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { buildBookContentOnlyTree } from "@/lib/content/core/tree-builder";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    subjectSlug: string;
    authorSlug: string;
    bookSlug: string;
    slug: string[];
  }>;
};

export default async function Layout({ children, params }: Props) {
  const resolvedParams = await params;
  const { subjectSlug, authorSlug, bookSlug } = resolvedParams;
  const summaryTree = await buildBookContentOnlyTree([
    subjectSlug,
    authorSlug,
    bookSlug,
  ]);
  return (
    <>
      <DevDebuggers summaryTree={summaryTree} />
      <SidebarProvider>
        <Sidebar summaryTree={summaryTree} />
        <SidebarInset className="px-4 py-6 md:px-8">
          <header className="mb-4 flex items-center">
            <SidebarTrigger />
          </header>
          <main className="pb-16">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
