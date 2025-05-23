import type { SummaryNode } from "@/lib/content/types";
import { cn } from "@/lib/styles/tailwind";
import { generateASCIITree } from "@/lib/text/ascii-generator";
import { memo } from "react";

export const ASCIITreeRenderer = memo(({ nodes }: { nodes: SummaryNode[] }) => {
  return (
    <div className="max-w-none rounded-lg overflow-hidden bg-zinc-100/80 ring-zinc-200 ring-1 shadow shadow-zinc-100">
      <p
        className={cn(
          "whitespace-pre text-base p-6 text-zinc-700 overflow-auto"
        )}
      >
        {generateASCIITree(nodes, {
          indent: "",
        })}
      </p>
    </div>
  );
});
