import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getAllDocs } from "@/lib/docs";
import Link from "next/link";

export async function DocsSidebar({ currentSlug }: { currentSlug?: string }) {
  const docs = await getAllDocs();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {docs.map((doc) => (
                <SidebarMenuItem key={doc.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentSlug === doc.slug}
                    tooltip={doc.title}
                  >
                    <Link href={`/docs/${doc.slug}`}>
                      <span>{doc.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
