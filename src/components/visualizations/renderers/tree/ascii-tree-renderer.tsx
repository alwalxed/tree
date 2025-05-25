import type { SummaryNode } from '@/lib/content/types';
import { cn } from '@/lib/styles/tailwind-utils';
import { generateASCIITree } from '@/lib/text/ascii-tree-generator';
import { memo } from 'react';

export const ASCIITreeRenderer = memo(({ nodes }: { nodes: SummaryNode[] }) => {
  return (
    <div className="max-w-none overflow-hidden rounded-lg bg-zinc-100/80 shadow ring-1 shadow-zinc-100 ring-zinc-200">
      <p
        className={cn(
          'overflow-auto p-6 text-base whitespace-pre text-zinc-700'
        )}
      >
        {generateASCIITree(nodes, {
          indent: '',
        })}
      </p>
    </div>
  );
});
