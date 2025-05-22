"use client";

import type React from "react";

import type { Node } from "@/lib/content/types";
import {
  AccessibilityIcon,
  Boxes,
  GitBranch,
  Grid,
  Network,
  Package,
  PieChart,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { ASCIITreeVisualization } from "./visualizations/ascii-tree-visualization";
import { BoxesVisualization } from "./visualizations/boxes-visualization";
import { CSSGridVisualization } from "./visualizations/css-grid-visualization";
import { HTMLTreeVisualization } from "./visualizations/html-tree-visualization";
import { PackVisualization } from "./visualizations/pack-visualization";
import { SunburstVisualization } from "./visualizations/sunburst-visualization";
import { TreeDiagramVisualization } from "./visualizations/tree-diagram-visualization";

type VisualizationType =
  | "html-tree"
  | "ascii-tree"
  | "boxes"
  | "css-grid"
  | "sunburst"
  | "diagram"
  | "pack";

export const Visualization = memo(({ nodes }: { nodes: Node[] }) => {
  const [visualizationType, setVisualizationType] =
    useState<VisualizationType>("ascii-tree");

  const selectedVisualization = useMemo(() => {
    switch (visualizationType) {
      case "ascii-tree":
        return <ASCIITreeVisualization nodes={nodes} />;
      case "html-tree":
        return <HTMLTreeVisualization nodes={nodes} />;
      case "boxes":
        return <BoxesVisualization nodes={nodes} />;
      case "css-grid":
        return <CSSGridVisualization nodes={nodes} />;
      case "sunburst":
        return <SunburstVisualization nodes={nodes} />;
      case "diagram":
        return <TreeDiagramVisualization nodes={nodes} />;
      case "pack":
        return <PackVisualization nodes={nodes} />;
      default:
        return null;
    }
  }, [visualizationType, nodes]);

  const handleToggle = (type: VisualizationType) => {
    setVisualizationType(type);
  };

  return (
    <>
      <VisualizationToggleButton
        visualizationType={visualizationType}
        onClick={handleToggle}
      />
      <div className="transition-opacity duration-300">
        {selectedVisualization}
      </div>
    </>
  );
});

const VisualizationToggleButton = memo(
  ({
    visualizationType,
    onClick,
  }: {
    visualizationType: VisualizationType;
    onClick: (type: VisualizationType) => void;
  }) => {
    const buttons: Array<{
      type: VisualizationType;
      icon: React.ReactNode;
      label: string;
    }> = [
      {
        type: "ascii-tree",
        label: "آسكي",
        icon: <AccessibilityIcon className="w-4 h-4" />,
      },
      {
        type: "html-tree",
        icon: <GitBranch className="w-4 h-4" />,
        label: "إتشتمل",
      },
      {
        type: "boxes",
        icon: <Boxes className="w-4 h-4" />,
        label: "صناديق",
      },
      {
        type: "css-grid",
        icon: <Grid className="w-4 h-4" />,
        label: "شبكة",
      },

      {
        type: "sunburst",
        icon: <PieChart className="w-4 h-4" />,
        label: "تدفق",
      },
      {
        type: "diagram",
        icon: <Network className="w-4 h-4" />,
        label: "مخطط",
      },
      {
        type: "pack",
        icon: <Package className="w-4 h-4" />,
        label: "شحنة",
      },
    ];

    return (
      <div className="flex gap-2">
        {buttons.map((button) => (
          <button
            key={button.type}
            onClick={() => onClick(button.type)}
            className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              visualizationType === button.type
                ? "bg-zinc-200 dark:bg-zinc-700"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            }`}
            aria-label={`غير إلى ${button.label}`}
            title={`غير إلى ${button.label}`}
          >
            {button.icon}
            <span className="hidden sm:inline">{button.label}</span>
          </button>
        ))}
      </div>
    );
  }
);
