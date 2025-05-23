"use client";

import type React from "react";

import type { Node } from "@/lib/content/types";
import {
  Boxes,
  GitBranch,
  Grid,
  Network,
  PieChart,
  Target,
  Terminal,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { RadialSunburstRenderer } from "./renderers/radial/radial-sunburst-renderer";
import { CirclePackRenderer } from "./renderers/spatial/circle-pack-renderer";
import { GridLayoutRenderer } from "./renderers/spatial/grid-layout-renderer";
import { NestedBoxesRenderer } from "./renderers/spatial/nested-boxes-renderer";
import { ASCIITreeRenderer } from "./renderers/tree/ascii-tree-renderer";
import { CollapsibleTreeRenderer } from "./renderers/tree/collapsible-tree-renderer";
import { NodeLinkDiagramRenderer } from "./renderers/tree/node-link-diagram-renderer";

type VisualizationType =
  | "collapsible-tree"
  | "ascii-tree"
  | "nested-boxes"
  | "grid-layout"
  | "radial-sunburst"
  | "node-diagram"
  | "circle-pack";

export const VisualizationSwitcher = memo(({ nodes }: { nodes: Node[] }) => {
  const [visualizationType, setVisualizationType] =
    useState<VisualizationType>("ascii-tree");

  const currentVisualization = useMemo(() => {
    switch (visualizationType) {
      case "ascii-tree":
        return <ASCIITreeRenderer nodes={nodes} />;
      case "collapsible-tree":
        return <CollapsibleTreeRenderer nodes={nodes} />;
      case "nested-boxes":
        return <NestedBoxesRenderer nodes={nodes} />;
      case "grid-layout":
        return <GridLayoutRenderer nodes={nodes} />;
      case "radial-sunburst":
        return <RadialSunburstRenderer nodes={nodes} />;
      case "node-diagram":
        return <NodeLinkDiagramRenderer nodes={nodes} />;
      case "circle-pack":
        return <CirclePackRenderer nodes={nodes} />;
      default:
        return null;
    }
  }, [visualizationType, nodes]);

  const switchVisualization = (type: VisualizationType) => {
    setVisualizationType(type);
  };

  return (
    <>
      <VisualizationTypeSelector
        visualizationType={visualizationType}
        onVisualizationChange={switchVisualization}
      />
      <div className="transition-opacity duration-300">
        {currentVisualization}
      </div>
    </>
  );
});

VisualizationSwitcher.displayName = "VisualizationSwitcher";

const VisualizationTypeSelector = memo(
  ({
    visualizationType,
    onVisualizationChange,
  }: {
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
  }) => {
    const buttons: Array<{
      type: VisualizationType;
      icon: React.ReactNode;
      label: string;
    }> = [
      {
        type: "ascii-tree",
        label: "تفرع",
        icon: <Terminal className="w-4 h-4" />,
      },
      {
        type: "collapsible-tree",
        label: "سلسلة",
        icon: <GitBranch className="w-4 h-4" />,
      },
      {
        type: "nested-boxes",
        label: "وعاء",
        icon: <Boxes className="w-4 h-4" />,
      },
      {
        type: "grid-layout",
        label: "مصفوفة",
        icon: <Grid className="w-4 h-4" />,
      },
      {
        type: "radial-sunburst",
        label: "شعاع",
        icon: <PieChart className="w-4 h-4" />,
      },
      {
        type: "node-diagram",
        label: "شبكة",
        icon: <Network className="w-4 h-4" />,
      },
      {
        type: "circle-pack",
        label: "تراص",
        icon: <Target className="w-4 h-4" />,
      },
    ];

    return (
      <div className="flex gap-2 flex-wrap">
        {buttons.map((button) => (
          <button
            key={button.type}
            onClick={() => onVisualizationChange(button.type)}
            className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              visualizationType === button.type
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
            aria-label={`تغيير إلى ${button.label}`}
            title={`تغيير إلى ${button.label}`}
          >
            {button.icon}
            <span className="hidden sm:inline">{button.label}</span>
          </button>
        ))}
      </div>
    );
  }
);

VisualizationTypeSelector.displayName = "VisualizationTypeSelector";
