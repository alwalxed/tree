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
import Link from 'next/link';
import React, { memo } from 'react';

type SidebarComponentProps = {
  sidebarConfig: { bookUrlPath: string; tree: Node[]; label: string };
};

function SidebarComponent({
  sidebarConfig: { tree, label, bookUrlPath },
}: SidebarComponentProps) {
  console.log(label);
  console.log(bookUrlPath);
  const {
    flatItems,
    expandedSections,
    toggleSection,
    isCurrentPage,
    toggleAll,
  } = useSidebar({ tree, bookUrlPath });

  return (
    <UISidebar side="right">
      <SidebarContent
        className={cn('overflow-y-scroll', '[&::-webkit-scrollbar]:w-0')}
      >
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupAction
            className="cursor-pointer"
            onClick={toggleAll}
            title="طي وبسط"
          >
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
                  <Link href={bookUrlPath}>
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>مقدمة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {flatItems.map(({ node, level, parentNodeFullPath }) => {
                let itemShouldBeRendered = true;
                if (level > 0) {
                  // A child item (level > 0) is rendered only if its direct parent folder is expanded.
                  // parentNodeFullPath is the fullPath of the actual parent node from the tree.
                  if (
                    !parentNodeFullPath ||
                    !expandedSections[parentNodeFullPath]
                  ) {
                    itemShouldBeRendered = false;
                  }
                }

                if (!itemShouldBeRendered) {
                  return null;
                }

                const hasChildren = node.children && node.children.length > 0;
                // An item is expanded if it has children and its path is in expandedSections
                const isExpanded =
                  hasChildren && (expandedSections[node.fullPath] || false);
                const isActive = isCurrentPage(node.fullPath);

                const itemHref = node.fullPath;

                return (
                  <SidebarMenuItem key={node.fullPath}>
                    {hasChildren ? (
                      <SidebarMenuButton
                        className={cn(
                          'cursor-pointer pr-[calc(0.5rem*var(--level))] pl-1.5',
                          isActive &&
                            'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        )}
                        style={{ '--level': 1 + level } as React.CSSProperties}
                        onClick={() => toggleSection(node.fullPath)}
                        aria-expanded={isExpanded}
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
                        style={{ '--level': 1 + level } as React.CSSProperties}
                      >
                        <Link href={itemHref}>
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
