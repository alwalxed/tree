import type { Node } from "@/lib/content/types";
import { cn } from "@/lib/styles/tailwind";
import { createASCIIString } from "@/lib/text/create-ascii-string";
import { memo } from "react";

export const ASCIITreeVisualization = memo(({ nodes }: { nodes: Node[] }) => {
  return (
    <div className="max-w-none rounded-lg overflow-hidden bg-zinc-100/80 ring-zinc-200 ring-1">
      <p
        className={cn(
          "whitespace-pre text-base p-6 text-zinc-700 overflow-auto"
        )}
      >
        {createASCIIString(nodes, {
          indent: "",
        })}
      </p>
    </div>
  );
});
