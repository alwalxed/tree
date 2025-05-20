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
import type { DocTreeItem } from "@/lib/docs";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DocSidebarProps {
  docsTree: DocTreeItem[];
}

export function DocsSidebar({ docsTree }: DocSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Determine which sections should be expanded based on the current path
  useEffect(() => {
    if (!pathname) return;

    const currentPath = pathname.replace(/^\/docs\//, "");
    const pathParts = currentPath.split("/");

    // Create a new expanded sections object
    const newExpandedSections: Record<string, boolean> = {};

    // For each level of the path, expand all parent sections
    for (let i = 0; i < pathParts.length; i++) {
      const currentPathPart = pathParts.slice(0, i + 1).join("/");
      newExpandedSections[currentPathPart] = true;
    }

    setExpandedSections((prev) => ({
      ...prev,
      ...newExpandedSections,
    }));
  }, [pathname]);

  // Toggle a section's expanded state
  const toggleSection = (slug: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Check if a page is the current page
  const isCurrentPage = (slug: string) => {
    return pathname === `/docs/${slug}`;
  };

  // Render a tree item and its children recursively
  const renderTreeItem = (item: DocTreeItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.slug] || false;
    const isActive = isCurrentPage(item.slug);

    if (!hasChildren) {
      // Render a leaf node (no children)
      return (
        <SidebarMenuItem key={item.slug}>
          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
            <Link href={`/docs/${item.slug}`}>
              <FileText className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    // Render a section with children
    return (
      <Collapsible
        key={item.slug}
        open={isExpanded}
        onOpenChange={() => toggleSection(item.slug)}
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
              {/* First, render the section's index page if it exists */}
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={isActive} size="md">
                  <Link href={`/docs/${item.slug}`}>
                    <FileText className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>

              {/* Then render all children */}
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.slug}>
                  {!child.children || child.children.length === 0 ? (
                    // Render leaf node
                    <SidebarMenuSubButton
                      asChild
                      isActive={isCurrentPage(child.slug)}
                      size="md"
                    >
                      <Link href={`/docs/${child.slug}`}>
                        <FileText className="h-4 w-4" />
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  ) : (
                    // Render nested section (recursively)
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
