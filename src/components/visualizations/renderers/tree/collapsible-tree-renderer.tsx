'use client';

import type { SummaryNode } from '@/lib/content/types';
import { cn } from '@/lib/styles/tailwind-utils';
import { transliterate } from '@/lib/text/transliteration';
import { memo } from 'react';

// Zinc shade progression for hierarchy levels
const ZINC_SHADES = [
  {
    background: 'bg-zinc-50 dark:bg-zinc-900',
    border: 'border-zinc-200 dark:border-zinc-700',
    text: 'text-zinc-900 dark:text-zinc-100',
    connection: 'border-zinc-300 dark:border-zinc-600',
  },
  {
    background: 'bg-zinc-100 dark:bg-zinc-800',
    border: 'border-zinc-300 dark:border-zinc-600',
    text: 'text-zinc-800 dark:text-zinc-200',
    connection: 'border-zinc-400 dark:border-zinc-500',
  },
  {
    background: 'bg-zinc-200 dark:bg-zinc-700',
    border: 'border-zinc-400 dark:border-zinc-500',
    text: 'text-zinc-700 dark:text-zinc-300',
    connection: 'border-zinc-500 dark:border-zinc-400',
  },
  {
    background: 'bg-zinc-300 dark:bg-zinc-600',
    border: 'border-zinc-500 dark:border-zinc-400',
    text: 'text-zinc-600 dark:text-zinc-400',
    connection: 'border-zinc-600 dark:border-zinc-300',
  },
  {
    background: 'bg-zinc-400 dark:bg-zinc-500',
    border: 'border-zinc-600 dark:border-zinc-300',
    text: 'text-white dark:text-zinc-100',
    connection: 'border-zinc-700 dark:border-zinc-200',
  },
  {
    background: 'bg-zinc-500 dark:bg-zinc-400',
    border: 'border-zinc-700 dark:border-zinc-200',
    text: 'text-white dark:text-zinc-900',
    connection: 'border-zinc-800 dark:border-zinc-100',
  },
] as const;

// Container colors
const CONTAINER_COLORS = {
  background: 'bg-zinc-50 dark:bg-zinc-900',
  ring: 'ring-zinc-200 dark:ring-zinc-700',
  shadow: 'shadow-zinc-100 dark:shadow-zinc-800',
} as const;

// Spacing constants
const SPACING = {
  container: 'p-6',
  nodeGap: 'space-y-3',
  nodeMargin: 'mt-3',
  nodePadding: 'px-4 py-3',
  indent: 'mr-4',
  connector: 'w-4',
} as const;

// Layout constants
const LAYOUT = {
  containerBase: 'w-full rounded-lg shadow ring-1',
  flexColumn: 'flex flex-col',
  flexRow: 'flex items-center',
  nodeBase: 'rounded-lg border transition-all duration-200',
  nodeParent: 'font-semibold',
  nodeLeaf: 'font-medium',
  connectionLine: 'border-l-2',
  connectionHorizontal: 'h-0.5',
  connectionHeight: 'h-6',
  connectionShort: 'h-3',
  hover: 'hover:shadow-md hover:scale-[1.01]',
} as const;

// Helper function to get colors for a specific level
const getColorsForLevel = (level: number) => {
  return ZINC_SHADES[level % ZINC_SHADES.length];
};

export const CollapsibleTreeRenderer = memo(
  ({ nodes }: { nodes: SummaryNode[] }) => {
    return (
      <div
        className={cn(
          LAYOUT.containerBase,
          CONTAINER_COLORS.background,
          CONTAINER_COLORS.ring,
          CONTAINER_COLORS.shadow,
          SPACING.container
        )}
      >
        <TreeView nodes={nodes} />
      </div>
    );
  }
);

const TreeView = memo(
  ({ nodes, level = 0 }: { nodes: SummaryNode[]; level?: number }) => {
    const levelColors = getColorsForLevel(level);

    return (
      <div className={cn(LAYOUT.flexColumn, SPACING.nodeGap)}>
        {nodes.map((node, index) => (
          <div key={node.slug}>
            <div className={LAYOUT.flexRow}>
              {level > 0 && (
                <div className={LAYOUT.flexRow}>
                  {Array.from({ length: level }).map((_, i) => {
                    const connectionColors = getColorsForLevel(i);
                    return (
                      <div
                        key={i}
                        className={cn(
                          SPACING.indent,
                          LAYOUT.connectionHeight,
                          SPACING.connector,
                          LAYOUT.connectionLine,
                          connectionColors.connection,
                          index === nodes.length - 1 &&
                            i === level - 1 &&
                            LAYOUT.connectionShort
                        )}
                      />
                    );
                  })}
                  <div
                    className={cn(
                      LAYOUT.connectionHorizontal,
                      SPACING.connector,
                      levelColors.connection.replace('border-', 'bg-'),
                      index === nodes.length - 1 && LAYOUT.connectionShort
                    )}
                  />
                </div>
              )}

              {/* SummaryNode title */}
              <div
                className={cn(
                  LAYOUT.nodeBase,
                  LAYOUT.hover,
                  SPACING.nodePadding,
                  levelColors.background,
                  levelColors.border,
                  levelColors.text,
                  node.children.length > 0 ? LAYOUT.nodeParent : LAYOUT.nodeLeaf
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{node.title}</span>
                  {node.children.length > 0 && (
                    <span
                      className={cn(
                        'ml-3 rounded-full px-2 py-1 text-xs',
                        'bg-white/20 dark:bg-black/20'
                      )}
                    >
                      {transliterate({
                        input: node.children.length,
                        mode: 'latin-numbers-to-arabic-digits',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Render children recursively */}
            {node.children.length > 0 && (
              <div className={SPACING.nodeMargin}>
                <TreeView nodes={node.children} level={level + 1} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);
