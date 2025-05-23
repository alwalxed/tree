import { getLeafNodes } from "@/lib/content/operations/get-leaf-nodes";
import type { Node } from "@/lib/content/types";
import { memo } from "react";

export const CSSGridVisualization = memo(({ nodes }: { nodes: Node[] }) => {
  const leafNodes = getLeafNodes(nodes);
  return (
    <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-4">
      {leafNodes.map((node) => (
        <a
          key={node.slug}
          href={`/learn/${node.slug}`}
          className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <h2 className="text-base">{node.title}</h2>
        </a>
      ))}
    </div>
  );
});
