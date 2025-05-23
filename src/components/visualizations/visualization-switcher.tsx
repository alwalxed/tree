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

interface VisualizationConfig {
  type: VisualizationType;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ nodes: Node[] }>;
}

const VISUALIZATION_CONFIGS: VisualizationConfig[] = [
  {
    type: "node-diagram",
    label: "شبكة",
    icon: <Network className="w-4 h-4" />,
    component: NodeLinkDiagramRenderer,
  },
  {
    type: "circle-pack",
    label: "تراص",
    icon: <Target className="w-4 h-4" />,
    component: CirclePackRenderer,
  },
  {
    type: "radial-sunburst",
    label: "شعاع",
    icon: <PieChart className="w-4 h-4" />,
    component: RadialSunburstRenderer,
  },
  {
    type: "ascii-tree",
    label: "تفرع",
    icon: <Terminal className="w-4 h-4" />,
    component: ASCIITreeRenderer,
  },
  {
    type: "collapsible-tree",
    label: "سلسلة",
    icon: <GitBranch className="w-4 h-4" />,
    component: CollapsibleTreeRenderer,
  },
  {
    type: "nested-boxes",
    label: "وعاء",
    icon: <Boxes className="w-4 h-4" />,
    component: NestedBoxesRenderer,
  },
  {
    type: "grid-layout",
    label: "مصفوفة",
    icon: <Grid className="w-4 h-4" />,
    component: GridLayoutRenderer,
  },
];

export const VisualizationSwitcher = memo(({ nodes }: { nodes: Node[] }) => {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>(
    VISUALIZATION_CONFIGS[0].type
  );

  const currentVisualization = useMemo(() => {
    const config = VISUALIZATION_CONFIGS.find(
      (cfg) => cfg.type === visualizationType
    );
    if (config) {
      const Component = config.component;
      return <Component nodes={nodes} />;
    }
    return null;
  }, [visualizationType, nodes]);

  return (
    <>
      <VisualizationTypeSelector
        visualizationType={visualizationType}
        onVisualizationChange={setVisualizationType}
        configs={VISUALIZATION_CONFIGS}
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
    configs,
  }: {
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
    configs: VisualizationConfig[];
  }) => {
    return (
      <div className="flex gap-2 flex-wrap">
        {configs.map((config) => (
          <button
            key={config.type}
            onClick={() => onVisualizationChange(config.type)}
            className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              visualizationType === config.type
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
            aria-label={`تغيير إلى ${config.label}`}
            title={`تغيير إلى ${config.label}`}
          >
            {config.icon}
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        ))}
      </div>
    );
  }
);

VisualizationTypeSelector.displayName = "VisualizationTypeSelector";
