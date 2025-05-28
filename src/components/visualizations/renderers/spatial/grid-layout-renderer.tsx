import { getLeafNodes } from '@/lib/content/query/get-leaf-nodes';
import type { SummaryNode } from '@/lib/content/types';
import { memo } from 'react';

export const GridLayoutRenderer = memo(
  ({ nodes }: { nodes: SummaryNode[] }) => {
    const leafNodes = getLeafNodes(nodes);
    return (
      <div className="xs:grid-cols-2 grid grid-cols-1 gap-4 py-4 md:grid-cols-3 lg:grid-cols-4">
        {leafNodes.map((node) => (
          <span
            key={node.fullSlugPath}
            className="rounded-lg border p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <h2 className="text-base">{node.title}</h2>
          </span>
        ))}
      </div>
    );
  }
);

GridLayoutRenderer.displayName = 'GridLayoutRenderer';
