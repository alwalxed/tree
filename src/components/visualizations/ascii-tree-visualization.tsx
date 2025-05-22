import { kawkabMonoArabic } from "@/app/fonts";
import type { Node } from "@/lib/content/types";
import { cn } from "@/lib/styles/tailwind";
import { createASCIIString } from "@/lib/text/create-ascii-string";

export function ASCIITreeVisualization({ nodes }: { nodes: Node[] }) {
  return (
    <div className="max-w-none rounded-xl overflow-hidden p-4 bg-zinc-50">
      <p
        className={cn(
          kawkabMonoArabic.className,
          "whitespace-pre text-base p-4 rounded-lg ring-1 ring-zinc-200 text-zinc-700 font-normal"
        )}
      >
        {createASCIIString(nodes, {
          indent: "",
        })}
      </p>
    </div>
  );
}
