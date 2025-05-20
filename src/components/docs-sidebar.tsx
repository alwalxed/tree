"use client";

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
import { useDocsSidebar } from "@/hooks/use-docs-sidebar";
import type { DocNode } from "@/lib/docs";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import Link from "next/link";
import type React from "react";

type Props = {
  docsTree: DocNode[];
};

export function DocsSidebar({ docsTree }: Props) {
  const { flatItems, expandedSections, toggleSection, isCurrentPage } =
    useDocsSidebar(docsTree);

  return (
    <Sidebar side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>النحو الرقمي</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {flatItems.map(({ node, level }) => {
                const fullPathParts = [...node.parentPath, node.slug];
                const fullPath = fullPathParts.join("/");
                const hasChildren = node.children.length > 0;
                const isExpanded = expandedSections[fullPath] || false;
                const isActive = isCurrentPage(fullPath);

                return (
                  <SidebarMenuItem key={fullPath}>
                    {hasChildren ? (
                      <SidebarMenuButton
                        className={cn(
                          "pr-[calc(0.5rem*var(--level))]",
                          isActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )}
                        style={{ "--level": 1 + level } as React.CSSProperties}
                        onClick={() => toggleSection(fullPath)}
                      >
                        <Folder className="h-4 w-4 shrink-0" />
                        <span>{node.title}</span>
                        {isExpanded ? (
                          <ChevronDown className="mr-auto h-4 w-4" />
                        ) : (
                          <ChevronRight className="mr-auto h-4 w-4" />
                        )}
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn("pr-[calc(0.5rem*var(--level))]")}
                        style={{ "--level": 1 + level } as React.CSSProperties}
                      >
                        <Link href={`/docs/${fullPath}`}>
                          <FileText className="h-4 w-4 shrink-0" />
                          <span>{node.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
