import { generateASCIITree } from '@/lib/common/ascii-tree-generator';
import { cn } from '@/lib/common/tailwind-utils';
import type { Node } from '@/lib/schema/bookTree';
import { memo } from 'react';

export type ASCIITreeRendererProps = { nodes: Node[] };

export const ASCIITreeRenderer = memo(({ nodes }: ASCIITreeRendererProps) => {
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

ASCIITreeRenderer.displayName = 'ASCIITreeRenderer';
