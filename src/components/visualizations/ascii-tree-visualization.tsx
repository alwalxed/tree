import { kawkabMonoArabic } from "@/app/fonts";
import type { Node } from "@/lib/content/types";
import { cn } from "@/lib/styles/tailwind";
import { createASCIIString } from "@/lib/text/create-ascii-string";

export function ASCIITreeVisualization({ nodes }: { nodes: Node[] }) {
  return (
    <div className="prose max-w-none rounded-xl p-4 overflow-x-auto text-sm bg-green-200">
      <pre className="m-0">
        <code
          className={cn(kawkabMonoArabic.className, "whitespace-pre text-base")}
        >
          {createASCIIString(nodes)}
        </code>
      </pre>
    </div>
  );
}
