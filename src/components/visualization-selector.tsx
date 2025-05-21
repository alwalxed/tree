"use client";

import type React from "react";

import { TreemapVisualization } from "@/components/visualizations/treemap-visualization";
import type { DocNode } from "@/lib/docs";
import { Grid, LayoutGrid, List, Network, PieChart } from "lucide-react";
import { useState } from "react";
import { ASCIITreeVisualization } from "./visualizations/ascii-tree-visualization";
import { CSSGridVisualization } from "./visualizations/css-grid-visualization";
import { SunburstVisualization } from "./visualizations/sunburst-visualization";
import { TreeDiagramVisualization } from "./visualizations/tree-diagram-visualization";

type VisualizationType = "tree" | "grid" | "treemap" | "sunburst" | "diagram";

type VisualizationSelectorProps = {
  title: string;
  headerClassName: string;
  treeContent: string;
  gridItems: { title: string; slug: string }[];
  docData: DocNode[];
};

export function VisualizationSelector({
  title,
  headerClassName,
  treeContent,
  gridItems,
  docData,
}: VisualizationSelectorProps) {
  const [visualizationType, setVisualizationType] =
    useState<VisualizationType>("tree");

  return (
    <>
      <SectionHeader
        title={title}
        headerClassName={headerClassName}
        visualizationType={visualizationType}
        onToggle={setVisualizationType}
      />
      <div className="transition-opacity duration-300">
        {visualizationType === "tree" && (
          <ASCIITreeVisualization content={treeContent} />
        )}

        {visualizationType === "grid" && (
          <CSSGridVisualization gridItems={gridItems} />
        )}

        {visualizationType === "treemap" && (
          <TreemapVisualization data={docData} />
        )}

        {visualizationType === "sunburst" && (
          <SunburstVisualization data={docData} />
        )}

        {visualizationType === "diagram" && (
          <TreeDiagramVisualization data={docData} />
        )}
      </div>
    </>
  );
}

function ToggleButton({
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
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
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

function SectionHeader({
  title,
  headerClassName,
  visualizationType,
  onToggle,
}: {
  title: string;
  headerClassName: string;
  visualizationType: VisualizationType;
  onToggle: (type: VisualizationType) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className={headerClassName}>{title}</h2>
      <ToggleButton visualizationType={visualizationType} onClick={onToggle} />
    </div>
  );
}
