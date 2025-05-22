"use client";

import type React from "react";

import { TreemapVisualization } from "@/components/visualizations/treemap-visualization";
import type { Node } from "@/lib/content/types";
import { Grid, LayoutGrid, List, Network, PieChart } from "lucide-react";
import { useMemo, useState } from "react";
import { ASCIITreeVisualization } from "./visualizations/ascii-tree-visualization";
import { CSSGridVisualization } from "./visualizations/css-grid-visualization";
import { SunburstVisualization } from "./visualizations/sunburst-visualization";
import { TreeDiagramVisualization } from "./visualizations/tree-diagram-visualization";

type VisualizationType = "tree" | "grid" | "treemap" | "sunburst" | "diagram";

export function Visualization({ nodes }: { nodes: Node[] }) {
  const [visualizationType, setVisualizationType] =
    useState<VisualizationType>("tree");

  const selectedVisualization = useMemo(() => {
    switch (visualizationType) {
      case "tree":
        return <ASCIITreeVisualization nodes={nodes} />;
      case "grid":
        return <CSSGridVisualization nodes={nodes} />;
      case "treemap":
        return <TreemapVisualization nodes={nodes} />;
      case "sunburst":
        return <SunburstVisualization nodes={nodes} />;
      case "diagram":
        return <TreeDiagramVisualization nodes={nodes} />;
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
}

function VisualizationToggleButton({
  visualizationType,
  onClick,
}: {
  visualizationType: VisualizationType;
  onClick: (type: VisualizationType) => void;
}) {
  const buttons: Array<{
    type: VisualizationType;
    icon: React.ReactNode;
    hiddenLabel: string;
    label: string;
  }> = [
    {
      type: "tree",
      icon: <List className="w-4 h-4" />,
      hiddenLabel: "Tree",
      label: "شجرة",
    },
    {
      type: "grid",
      icon: <Grid className="w-4 h-4" />,
      hiddenLabel: "Grid",
      label: "شبكة",
    },
    {
      type: "treemap",
      icon: <LayoutGrid className="w-4 h-4" />,
      hiddenLabel: "Treemap",
      label: "خريطة",
    },
    {
      type: "sunburst",
      icon: <PieChart className="w-4 h-4" />,
      hiddenLabel: "Sunburst",
      label: "تدفق",
    },
    {
      type: "diagram",
      icon: <Network className="w-4 h-4" />,
      hiddenLabel: "Diagram",
      label: "مخطط",
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
          aria-label={`Switch to ${button.label} view`}
          title={`Switch to ${button.label} view`}
        >
          {button.icon}
          <span className="hidden sm:inline">{button.label}</span>
        </button>
      ))}
    </div>
  );
}
