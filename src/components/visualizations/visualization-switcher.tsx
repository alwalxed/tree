'use client';

import type React from 'react';

import type { Node } from '@/lib/schema/bookTree';
import { GitBranch, Grid, Mail, Terminal } from 'lucide-react';
import {
  memo,
  useMemo,
  useState,
  type JSX,
  type MemoExoticComponent,
} from 'react';
import { type RadialSunburstRendererProps } from './renderers/radial/radial-sunburst-renderer';
import { type CirclePackRendererProps } from './renderers/spatial/circle-pack-renderer';
import {
  GridLayoutRenderer,
  type GridLayoutRendererProps,
} from './renderers/spatial/grid-layout-renderer';
import {
  NestedBoxesRenderer,
  type NestedBoxesRendererProps,
} from './renderers/spatial/nested-boxes-renderer';
import {
  ASCIITreeRenderer,
  type ASCIITreeRendererProps,
} from './renderers/tree/ascii-tree-renderer';
import {
  CollapsibleTreeRenderer,
  type CollapsibleTreeRendererProps,
} from './renderers/tree/collapsible-tree-renderer';
import { type NodeLinkDiagramRendererProps } from './renderers/tree/node-link-diagram-renderer';

type VisualizationType =
  | 'collapsible-tree'
  | 'ascii-tree'
  | 'nested-boxes'
  | 'grid-layout';
// | 'radial-sunburst'
// | 'node-diagram'
// | 'circle-pack';

type Component =
  | MemoExoticComponent<
      ({ nodes, height }: NodeLinkDiagramRendererProps) => JSX.Element
    >
  | MemoExoticComponent<
      ({ nodes, width, height }: CirclePackRendererProps) => JSX.Element
    >
  | MemoExoticComponent<
      ({
        nodes,
        initialWidth,
        initialHeight,
      }: RadialSunburstRendererProps) => JSX.Element
    >
  | MemoExoticComponent<({ nodes }: ASCIITreeRendererProps) => JSX.Element>
  | MemoExoticComponent<
      ({ nodes }: CollapsibleTreeRendererProps) => JSX.Element
    >
  | MemoExoticComponent<({ nodes }: NestedBoxesRendererProps) => JSX.Element>
  | MemoExoticComponent<({ nodes }: GridLayoutRendererProps) => JSX.Element>;

type VisualizationConfig = Readonly<{
  type: VisualizationType;
  label: string;
  icon: React.ReactNode;
  component: Component;
}>;

const VISUALIZATION_CONFIGS: VisualizationConfig[] = [
  // {
  //   type: 'node-diagram',
  //   label: 'شبكة',
  //   icon: <Network className="h-4 w-4" />,
  //   component: NodeLinkDiagramRenderer,
  // },
  // {
  //   type: 'circle-pack',
  //   label: 'تراص',
  //   icon: <Target className="h-4 w-4" />,
  //   component: CirclePackRenderer,
  // },
  // {
  //   type: 'radial-sunburst',
  //   label: 'دائرة',
  //   icon: <PieChart className="h-4 w-4" />,
  //   component: RadialSunburstRenderer,
  // },
  {
    type: 'ascii-tree',
    label: 'تفرع',
    icon: <Terminal className="h-4 w-4" />,
    component: ASCIITreeRenderer,
  },
  {
    type: 'collapsible-tree',
    label: 'سلسلة',
    icon: <GitBranch className="h-4 w-4" />,
    component: CollapsibleTreeRenderer,
  },
  {
    type: 'nested-boxes',
    label: 'أظرف',
    icon: <Mail className="h-4 w-4" />,
    component: NestedBoxesRenderer,
  },
  {
    type: 'grid-layout',
    label: 'مصفوفة',
    icon: <Grid className="h-4 w-4" />,
    component: GridLayoutRenderer,
  },
];

type VisualizationSwitcherProps = { nodes: Node[] };
export const VisualizationSwitcher = memo(
  ({ nodes }: VisualizationSwitcherProps) => {
    const [visualizationType, setVisualizationType] =
      useState<VisualizationType>(VISUALIZATION_CONFIGS[0].type);

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
  }
);

VisualizationSwitcher.displayName = 'VisualizationSwitcher';

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
      <div className="flex flex-wrap gap-2">
        {configs.map((config) => (
          <button
            key={config.type}
            onClick={() => onVisualizationChange(config.type)}
            className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
              visualizationType === config.type
                ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
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

VisualizationTypeSelector.displayName = 'VisualizationTypeSelector';
