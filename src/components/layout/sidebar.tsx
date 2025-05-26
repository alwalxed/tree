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
import type { SummaryNode } from '@/lib/content/types';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronsDownUp,
  FileText,
  Folder,
} from 'lucide-react';
import Link from 'next/link';
import React, { memo, useCallback } from 'react';

type Props = {
  tree: SummaryNode[];
  label: string;
  bookLandingPath: string;
};

function SidebarComponent({ tree, label, bookLandingPath }: Props) {
  const {
    flatItems,
    expandedSections,
    toggleSection,
    isCurrentPage,
    toggleAll,
  } = useSidebar({ tree });

  const isVisible = useCallback(
    (node: SummaryNode): boolean => {
      let path = '';
      for (const part of node.parentPath) {
        path = path ? `${path}/${part}` : part;
        if (!expandedSections[path]) return false;
      }
      return true;
    },
    [expandedSections]
  );

  return (
    <UISidebar side="right">
      <SidebarContent
        className={cn('overflow-y-scroll', '[&::-webkit-scrollbar]:w-0')}
      >
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupAction onClick={toggleAll} title="طي وبسط">
            <ChevronsDownUp /> <span className="sr-only">Toggle</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="__home">
                <SidebarMenuButton
                  asChild
                  isActive={isCurrentPage('__home')}
                  className="pl-1.5"
                >
                  <Link href={bookLandingPath}>
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>مقدمة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {flatItems.map(({ node, level }) => {
                const fullPath = [...node.parentPath, node.slug].join('/');
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
                          'pr-[calc(0.5rem*var(--level))] pl-1.5',
                          isActive &&
                            'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        )}
                        style={{ '--level': 1 + level } as React.CSSProperties}
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
                        className={cn('pr-[calc(0.5rem*var(--level))]')}
                        style={{ '--level': 1 + level } as React.CSSProperties}
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
    </UISidebar>
  );
}

export const Sidebar = memo(SidebarComponent);
