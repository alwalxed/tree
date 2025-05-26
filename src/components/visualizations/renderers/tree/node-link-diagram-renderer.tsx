'use client';

import type { SummaryNode } from '@/lib/content/types';
import * as d3 from 'd3';
import { memo, useEffect, useRef, useState } from 'react';

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

type TreeVisualizationProps = {
  nodes: SummaryNode[];
  height?: number;
};

export const NodeLinkDiagramRenderer = memo(
  ({ nodes, height = 600 }: TreeVisualizationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height });

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const updateDimensions = () => {
        if (containerRef.current) {
          const { width } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      };

      // Initial measurement
      updateDimensions();

      // Set up resize observer to handle container size changes
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(el);

      // Clean up
      return () => {
        resizeObserver.unobserve(el);
        resizeObserver.disconnect();
      };
    }, [height]);

    useEffect(() => {
      if (!containerRef.current || nodes.length === 0 || dimensions.width === 0)
        return;

      containerRef.current.innerHTML = '';

      const svg = d3
        .select(containerRef.current)
        .append('svg')
        .attr('width', '100%')
        .attr('height', dimensions.height)
        .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const contentGroup = svg.append('g').attr('class', 'content');

      const transformNodes = (inputNodes: SummaryNode[]): TreeNode[] => {
        return inputNodes.map((node, index) => ({
          id: node.slug || `node-${index}`,
          name: node.title,
          children: node.children?.length
            ? transformNodes(node.children)
            : undefined,
        }));
      };

      const treeData: TreeNode[] = transformNodes(nodes);
      const root = d3.hierarchy(treeData[0]);

      const isMobile = window.innerWidth < 768;

      const treeLayout = d3
        .tree<TreeNode>()
        .size(
          isMobile
            ? [dimensions.height - 100, dimensions.width - 100]
            : [dimensions.height - 40, dimensions.width - 180]
        )
        .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

      treeLayout(root);

      contentGroup
        .selectAll('path.link')
        .data(root.links())
        .join('path')
        .attr('class', 'link')
        .attr(
          'd',
          d3
            .linkHorizontal<
              d3.HierarchyLink<TreeNode>,
              d3.HierarchyPointNode<TreeNode>
            >()
            .x((d) => d.y)
            .y((d) => d.x)
        )
        .style('fill', 'none')
        .style('stroke', '#555')
        .style('stroke-width', 1.5);

      const nodeGroups = contentGroup
        .selectAll('g.node')
        .data(root.descendants())
        .join('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${d.y},${d.x})`);

      nodeGroups
        .append('circle')
        .attr('r', 6)
        .style('fill', (d: d3.HierarchyNode<TreeNode>) =>
          d.children ? '#555' : '#999'
        )
        .style('stroke', '#fff')
        .style('stroke-width', 2);

      // Adjust text position to prevent overlap
      nodeGroups
        .append('text')
        .attr('dy', '-1.2em') // Move text above the node
        .attr('x', 0) // Center text horizontally
        .style('text-anchor', 'middle') // Center text alignment
        .text((d: d3.HierarchyNode<TreeNode>) => d.data.name)
        .style('font-size', isMobile ? '10px' : '12px') // Smaller text on mobile
        .style('font-family', 'sans-serif')
        .style('fill', '#333');

      nodeGroups
        .on('mouseover', function () {
          d3.select(this)
            .select('circle')
            .transition()
            .duration(200)
            .attr('r', 8)
            .style('fill', '#0066cc');

          d3.select(this).select('text').style('font-weight', 'bold');
        })
        .on(
          'mouseout',
          function (event: MouseEvent, d: d3.HierarchyNode<TreeNode>) {
            d3.select(this)
              .select('circle')
              .transition()
              .duration(200)
              .attr('r', 6)
              .style('fill', d.children ? '#555' : '#999');

            d3.select(this).select('text').style('font-weight', 'normal');
          }
        );

      const zoom = d3
        .zoom()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
          contentGroup.attr('transform', event.transform);
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svg.call(zoom as any);

      if (isMobile) {
        // Mobile: Center on the root node only
        const rootNode = root;

        // Get the actual positioned coordinates of the root node
        const rootX = rootNode.y || 0; // horizontal position in tree layout
        const rootY = rootNode.x || 0; // vertical position in tree layout

        // Start with a scale that ensures the root is visible
        const scale = 1.0;

        // Calculate translation to center the root node
        const viewportCenterX = dimensions.width / 2;
        const viewportCenterY = dimensions.height / 2;

        // Transform: viewport_center - (node_position * scale)
        const translateX = viewportCenterX - rootX * scale;
        const translateY = viewportCenterY - rootY * scale;

        svg.call(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          zoom.transform as any,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
      } else {
        // Desktop: Center the entire tree
        const bounds = contentGroup.node()?.getBBox();
        if (bounds) {
          const scale = Math.min(
            dimensions.width / bounds.width,
            dimensions.height / bounds.height,
            0.9
          );
          const x = (dimensions.width - bounds.width * scale) / 2;
          const y = (dimensions.height - bounds.height * scale) / 2;

          svg.call(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            zoom.transform as any,
            d3.zoomIdentity.translate(x, y).scale(scale)
          );
        }
      }
    }, [nodes, dimensions.width, dimensions.height]);

    return (
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden rounded-lg bg-zinc-100 shadow ring-1 shadow-zinc-200 ring-zinc-200 dark:bg-zinc-900"
        style={{ minHeight: height }}
      />
    );
  }
);

NodeLinkDiagramRenderer.displayName = 'NodeLinkDiagramRenderer';
