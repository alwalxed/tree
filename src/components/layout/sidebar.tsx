'use client';

import { Input } from '@/components/ui/input';
import {
  SidebarContent,
  SidebarFooter,
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
  Search,
} from 'lucide-react';
import React, { useState } from 'react';

type SidebarProps = {
  tree: Node[];
  bookUrlPath: string;
  label: string;
};

export function Sidebar({ tree, bookUrlPath, label }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    flatItems,
    expandedSections,
    toggleSection,
    isCurrentPage,
    toggleAll,
    homeHref,
  } = useSidebar({ tree, bookUrlPath });

  const isSearching = searchQuery.trim().length > 0;

  const shouldShowItem = (item: (typeof flatItems)[0]) => {
    if (isSearching) {
      const itemTitle = item.node.title.toLowerCase();
      const searchTerm = searchQuery.toLowerCase().trim();
      return itemTitle.includes(searchTerm);
    }

    if (item.level > 0 && !expandedSections[item.parentNodeFullPath!]) {
      return false;
    }

    return true;
  };

  const visibleItems = flatItems.filter(shouldShowItem);
  const homeMatches =
    !isSearching ||
    'مقدمة'.toLowerCase().includes(searchQuery.toLowerCase().trim());

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
              {/* Home link - show if not searching or matches search */}
              {homeMatches && (
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
              )}

              {flatItems.map(({ node, level, parentNodeFullPath, href }) => {
                if (
                  !shouldShowItem({ node, level, parentNodeFullPath, href })
                ) {
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

              {/* Show message when searching and no results found */}
              {isSearching && visibleItems.length === 0 && !homeMatches && (
                <SidebarMenuItem>
                  <div className="text-muted-foreground px-2 py-3 text-center text-sm">
                    لا توجد نتائج
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 text-right"
            dir="rtl"
          />
        </div>
      </SidebarFooter>
    </UISidebar>
  );
}
