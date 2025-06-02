'use client';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as UISidebar,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/common/tailwind-utils';
import type { Node } from '@/lib/schema/bookTree';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronsDownUp,
  FileText,
  Folder,
} from 'lucide-react';
import React from 'react';

type SidebarProps = {
  tree: Node[];
  bookUrlPath: string;
  label: string;
};

export function Sidebar({ tree, bookUrlPath, label }: SidebarProps) {
  const {
    flatItems,
    expandedSections,
    toggleSection,
    isCurrentPage,
    toggleAll,
    homeHref,
  } = useSidebar({ tree, bookUrlPath });

  return (
    <UISidebar side="right">
      <SidebarContent
        className={cn('overflow-y-scroll', '[&::-webkit-scrollbar]:w-0')}
      >
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupAction
            onClick={toggleAll}
            title="طي وبسط"
            className="cursor-pointer"
          >
            <ChevronsDownUp /> <span className="sr-only">Toggle</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Home link */}
              <SidebarMenuItem key="__home">
                <SidebarMenuButton
                  asChild
                  isActive={isCurrentPage('__home')}
                  className="pl-1.5"
                >
                  <a href={homeHref}>
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>مقدمة</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {flatItems.map(({ node, level, parentNodeFullPath, href }) => {
                if (level > 0 && !expandedSections[parentNodeFullPath!]) {
                  return null;
                }
                const hasChildren = node.children.length > 0;
                const isExpanded =
                  hasChildren && !!expandedSections[node.fullPathWithPrefixes];
                const isActive = isCurrentPage(node.fullPathWithPrefixes);

                return (
                  <SidebarMenuItem key={node.fullPathWithPrefixes}>
                    {hasChildren ? (
                      <SidebarMenuButton
                        onClick={() => toggleSection(node.fullPathWithPrefixes)}
                        aria-expanded={isExpanded}
                        className={cn(
                          'cursor-pointer pr-[calc(0.5rem*var(--level))] pl-1.5',
                          isActive &&
                            'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        )}
                        style={{ '--level': level + 1 } as React.CSSProperties}
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
                        className={cn(
                          'cursor-pointer pr-[calc(0.5rem*var(--level))]'
                        )}
                        style={{ '--level': level + 1 } as React.CSSProperties}
                      >
                        <a href={href}>
                          <FileText className="h-4 w-4 shrink-0" />
                          <span>{node.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </UISidebar>
  );
}
