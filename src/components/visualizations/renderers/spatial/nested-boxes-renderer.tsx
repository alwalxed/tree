"use client";

import { getNodeSlugPath } from "@/lib/content/query/get-node-path";
import type { SummaryNode } from "@/lib/content/types";
import { cn } from "@/lib/styles/tailwind-utils";
import Link from "next/link";
import { memo, useId } from "react";

// Color scheme constants
const COLOR_SCHEMES = [
  {
    bg: "bg-gradient-to-br from-zinc-50 to-zinc-100",
    border: "border-zinc-200",
    text: "text-zinc-700",
  },
  {
    bg: "bg-gradient-to-br from-zinc-100 to-zinc-200",
    border: "border-zinc-300",
    text: "text-zinc-800",
  },
  {
    bg: "bg-gradient-to-br from-zinc-200 to-zinc-300",
    border: "border-zinc-400",
    text: "text-zinc-900",
  },
  {
    bg: "bg-gradient-to-br from-zinc-300 to-zinc-400",
    border: "border-zinc-500",
    text: "text-white",
  },
  {
    bg: "bg-gradient-to-br from-zinc-400 to-zinc-500",
    border: "border-zinc-600",
    text: "text-white",
  },
] as const;

// Font size constants
const FONT_SIZES = {
  0: "text-lg md:text-xl",
  1: "text-base md:text-lg",
  2: "text-sm md:text-base",
  default: "text-xs md:text-sm",
} as const;

// Padding constants
const PADDINGS = {
  0: "py-3 px-4 md:py-4 md:px-5",
  1: "py-2 px-3 md:py-3 md:px-4",
  default: "py-1.5 px-2 md:py-2 md:px-3",
} as const;

// Gap constants
const GAPS = {
  container: "gap-2 md:gap-4",
  margin: "mt-2 md:mt-4",
} as const;

// Container styling constants
const CONTAINER_STYLES = {
  wrapper: "w-full bg-zinc-100 rounded-lg ring-1 ring-zinc-200 overflow-hidden",
  flexContainer: "w-full flex flex-wrap",
  centerContent: "justify-center",
} as const;

// Box styling constants
const BOX_STYLES = {
  base: "w-full rounded-lg border transition-all duration-200",
  interactive: "group cursor-pointer",
  textBase: "font-medium transition-all duration-200",
  linkBase: "transition-all duration-200 block truncate",
} as const;

// Animation constants
const ANIMATIONS = {
  duration: "duration-200",
  fontWeight: "group-hover:font-semibold",
} as const;

export const NestedBoxesRenderer = memo(
  ({ nodes }: { nodes: SummaryNode[] }) => {
    return (
      <div className={CONTAINER_STYLES.wrapper}>
        <BoxView nodes={nodes} />
      </div>
    );
  }
);

const BoxView = memo(
  ({ nodes, depth = 0 }: { nodes: SummaryNode[]; depth?: number }) => {
    const scheme = COLOR_SCHEMES[depth % COLOR_SCHEMES.length];
    const uniqueId = useId();

    // Get responsive font size based on depth
    const getFontSize = (depth: number): string => {
      if (depth in FONT_SIZES) {
        return FONT_SIZES[depth as keyof typeof FONT_SIZES];
      }
      return FONT_SIZES.default;
    };

    // Get responsive padding based on depth
    const getPadding = (depth: number): string => {
      if (depth in PADDINGS) {
        return PADDINGS[depth as keyof typeof PADDINGS];
      }
      return PADDINGS.default;
    };

    return (
      <div
        className={cn(
          CONTAINER_STYLES.flexContainer,
          GAPS.container,
          depth > 0 ? GAPS.margin : CONTAINER_STYLES.centerContent
        )}
      >
        {nodes.map((node) => (
          <div
            key={`${uniqueId}-${node.slug}`}
            className={cn(
              BOX_STYLES.base,
              BOX_STYLES.interactive,
              scheme.bg,
              scheme.border,
              getPadding(depth)
            )}
          >
            <div
              className={cn(
                BOX_STYLES.textBase,
                scheme.text,
                ANIMATIONS.fontWeight,
                getFontSize(depth)
              )}
            >
              <Link
                href={`/learn/${getNodeSlugPath(node)}`}
                className={BOX_STYLES.linkBase}
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
