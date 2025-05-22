"use client";

import { getNodeSlugPath } from "@/lib/content/tree/get-node-slug-path";
import type { Node } from "@/lib/content/types";
import { cn } from "@/lib/styles/tailwind";
import Link from "next/link";
import { memo, useId } from "react";

export const BoxesVisualization = memo(({ nodes }: { nodes: Node[] }) => {
  return (
    <div className="w-full bg-zinc-100 rounded-lg ring-1 ring-blue-200 overflow-hidden">
      <BoxView nodes={nodes} />
    </div>
  );
});

const BoxView = memo(
  ({ nodes, depth = 0 }: { nodes: Node[]; depth?: number }) => {
    const colorSchemes = [
      {
        bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
        border: "border-blue-200",
        text: "text-blue-800",
      },
      {
        bg: "bg-gradient-to-br from-emerald-50 to-teal-100",
        border: "border-emerald-200",
        text: "text-emerald-800",
      },
      {
        bg: "bg-gradient-to-br from-amber-50 to-orange-100",
        border: "border-amber-200",
        text: "text-amber-800",
      },
      {
        bg: "bg-gradient-to-br from-rose-50 to-pink-100",
        border: "border-rose-200",
        text: "text-rose-800",
      },
      {
        bg: "bg-gradient-to-br from-violet-50 to-purple-100",
        border: "border-violet-200",
        text: "text-violet-800",
      },
    ];

    const scheme = colorSchemes[depth % colorSchemes.length];
    const uniqueId = useId();

    // Calculate responsive sizing based on depth
    const getFontSize = (depth: number) => {
      if (depth === 0) return "text-lg md:text-xl";
      if (depth === 1) return "text-base md:text-lg";
      if (depth === 2) return "text-sm md:text-base";
      return "text-xs md:text-sm";
    };

    const getPadding = (depth: number) => {
      if (depth === 0) return "py-3 px-4 md:py-4 md:px-5";
      if (depth === 1) return "py-2 px-3 md:py-3 md:px-4";
      return "py-1.5 px-2 md:py-2 md:px-3";
    };

    return (
      <div
        className={cn(
          "w-full flex flex-wrap gap-2 md:gap-4",
          depth > 0 ? "mt-2 md:mt-4" : "justify-center"
        )}
      >
        {nodes.map((node) => (
          <div
            key={`${uniqueId}-${node.slug}`}
            className={cn(
              "w-full rounded-lg border transition-all duration-200",
              "group",
              scheme.bg,
              scheme.border,
              getPadding(depth)
            )}
          >
            <div
              className={cn(
                "font-medium",
                scheme.text,
                "group-hover:font-semibold",
                getFontSize(depth)
              )}
            >
              <Link
                href={`/learn/${getNodeSlugPath(node)}`}
                className="transition-all duration-200 block truncate"
              >
                {node.title}
              </Link>
            </div>

            {node.children.length > 0 && (
              <BoxView nodes={node.children} depth={depth + 1} />
            )}
          </div>
        ))}
      </div>
    );
  }
);
