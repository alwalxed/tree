"use client";

import type { Node } from "@/lib/content/types";
import { cn } from "@/lib/styles/tailwind";
import { memo } from "react";

export const HTMLTreeVisualization = memo(({ nodes }: { nodes: Node[] }) => {
  return (
    <div className="w-full rounded-md border p-4">
      <TreeView nodes={nodes} />
    </div>
  );
});

const TreeView = memo(
  ({ nodes, level = 0 }: { nodes: Node[]; level?: number }) => {
    return (
      <div className="flex flex-col space-y-2">
        {nodes.map((node, index) => (
          <div key={node.slug}>
            <div className="flex items-center">
              {/* Indent and show connection lines */}
              {level > 0 && (
                <div className="flex items-center">
                  {Array.from({ length: level }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "mr-4 h-6 w-4 border-l-2 border-gray-300",
                        index === nodes.length - 1 && i === level - 1 && "h-3"
                      )}
                    />
                  ))}
                  <div
                    className={cn(
                      "h-0.5 w-4 bg-gray-300",
                      index === nodes.length - 1 && "h-3"
                    )}
                  />
                </div>
              )}

              {/* Node title */}
              <div
                className={cn(
                  "rounded-md border px-3 py-2",
                  node.children.length > 0 && "bg-gray-50 font-medium"
                )}
              >
                {node.title}
              </div>
            </div>

            {/* Render children recursively */}
            {node.children.length > 0 && (
              <div className="mt-2">
                <TreeView nodes={node.children} level={level + 1} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);
