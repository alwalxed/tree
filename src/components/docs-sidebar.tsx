"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { DocNode } from "@/lib/docs";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DocSidebarProps {
  docsTree: DocNode[];
}

export function DocsSidebar({ docsTree }: DocSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!pathname) return;

    const currentPath = pathname.replace(/^\/docs\//, "");
    const parts = currentPath.split("/");

    const newExpanded: Record<string, boolean> = {};
    for (let i = 0; i < parts.length; i++) {
      const joined = parts.slice(0, i + 1).join("/");
      newExpanded[joined] = true;
    }

    setExpandedSections((prev) => ({ ...prev, ...newExpanded }));
  }, [pathname]);

  const toggleSection = (fullPath: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [fullPath]: !prev[fullPath],
    }));
  };

  const isCurrentPage = (fullPath: string) => pathname === `/docs/${fullPath}`;

  const renderTreeItem = (item: DocNode) => {
    const fullPathParts = [...item.parentPath, item.slug];
    const fullPath = fullPathParts.join("/");
    const hasChildren = item.children.length > 0;
    const isExpanded = expandedSections[fullPath] || false;
    const isActive = isCurrentPage(fullPath);

    if (!hasChildren) {
      return (
        <SidebarMenuItem key={fullPath}>
          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
            <Link href={`/docs/${fullPath}`}>
              <FileText className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <Collapsible
        key={fullPath}
        open={isExpanded}
        onOpenChange={() => toggleSection(fullPath)}
        className="w-full"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn(
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )}
            >
              <Folder className="h-4 w-4" />
              <span>{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub>
              {/* Render index (overview) page */}
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={isActive} size="md">
                  <Link href={`/docs/${fullPath}`}>
                    <FileText className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>

              {/* Render children recursively */}
              {item.children.map((child) => (
                <SidebarMenuSubItem
                  key={[...child.parentPath, child.slug].join("/")}
                >
                  {!child.children.length ? (
                    <SidebarMenuSubButton
                      asChild
                      isActive={isCurrentPage(
                        [...child.parentPath, child.slug].join("/")
                      )}
                      size="md"
                    >
                      <Link
                        href={`/docs/${[...child.parentPath, child.slug].join(
                          "/"
                        )}`}
                      >
                        <FileText className="h-4 w-4" />
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  ) : (
                    <div className="pl-2">{renderTreeItem(child)}</div>
                  )}
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  return (
    <Sidebar side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>النحو الرقمي</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{docsTree.map(renderTreeItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
