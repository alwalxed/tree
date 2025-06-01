import { listLeafNodes } from '@/lib/nodes/list-leaves';
import type { Node } from '@/lib/schema/bookTree';
import { memo } from 'react';

export type GridLayoutRendererProps = {
  nodes: Node[];
};
export const GridLayoutRenderer = memo(({ nodes }: GridLayoutRendererProps) => {
  const leafNodes = listLeafNodes(nodes);
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
});

GridLayoutRenderer.displayName = 'GridLayoutRenderer';
