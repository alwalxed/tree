import { kawkabMonoArabic } from "@/app/fonts";
import { createASCIIString } from "@/lib/ascii";
import type { TreeNode } from "@/lib/markdown/tree-builder";
import { cn } from "@/lib/tailwind";

export function ASCIITreeVisualization({ nodes }: { nodes: TreeNode[] }) {
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
