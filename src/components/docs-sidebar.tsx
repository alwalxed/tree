"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useDocsSidebar } from "@/hooks/use-docs-sidebar";
import type { DocNode } from "@/lib/docs";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronsDownUp,
  FileText,
  Folder,
  Hash,
} from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  docsTree: DocNode[];
};

export function DocsSidebar({ docsTree }: Props) {
  const {
    flatItems,
    expandedSections,
    toggleSection,
    isCurrentPage,
    toggleAll,
  } = useDocsSidebar(docsTree);

  const isVisible = (node: DocNode): boolean => {
    // If all of its parent paths are expanded, it's visible
    let path = "";
    for (let part of node.parentPath) {
      path = path ? `${path}/${part}` : part;
      if (!expandedSections[path]) return false;
    }
    return true;
  };

  return (
    <Sidebar side="right">
      <SidebarContent
        className={cn("overflow-y-scroll", "[&::-webkit-scrollbar]:w-0")}
      >
        <SidebarGroup>
          <SidebarGroupLabel>النحو الرقمي</SidebarGroupLabel>
          <SidebarGroupAction onClick={toggleAll} title="طي وبسط">
            <ChevronsDownUp /> <span className="sr-only">Toggle</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="__home">
                <SidebarMenuButton
                  asChild
                  isActive={isCurrentPage("__home")}
                  className="pl-1.5"
                >
                  <Link href="/">
                    <Hash className="h-4 w-4 shrink-0" />
                    <span>الرئسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {flatItems.map(({ node, level }) => {
                const fullPath = [...node.parentPath, node.slug].join("/");
                const hasChildren = node.children.length > 0;
                const isExpanded = expandedSections[fullPath] || false;
                const isActive = isCurrentPage(fullPath);
                const visible = isVisible(node);

                if (!visible) return null;

                return (
                  <SidebarMenuItem key={fullPath}>
                    {hasChildren ? (
                      <SidebarMenuButton
                        className={cn(
                          "pl-1.5 pr-[calc(0.5rem*var(--level))]",
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
                          <ChevronLeft className="mr-auto h-4 w-4" />
                        )}
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn("pr-[calc(0.5rem*var(--level))]")}
                        style={{ "--level": 1 + level } as React.CSSProperties}
                      >
                        <Link href={`/learn/${fullPath}`}>
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
