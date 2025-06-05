'use client';

import type { Node } from '@/lib/schema/bookTree';
import * as d3 from 'd3';
import { memo, useEffect, useRef, useState } from 'react';

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

export type NodeLinkDiagramRendererProps = {
  nodes: Node[];
  height?: number;
};

export const NodeLinkDiagramRenderer = memo(
  ({ nodes, height = 600 }: NodeLinkDiagramRendererProps) => {
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

      const transformNodes = (inputNodes: Node[]): TreeNode[] => {
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

      // Create links
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

      // Create node groups
      const nodeGroups = contentGroup
        .selectAll('g.node')
        .data(root.descendants())
        .join('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${d.y},${d.x})`);

      // Add circles
      nodeGroups
        .append('circle')
        .attr('r', 6)
        .style('fill', (d: d3.HierarchyNode<TreeNode>) =>
          d.children ? '#555' : '#999'
        )
        .style('stroke', '#fff')
        .style('stroke-width', 2);

      // Add text labels
      nodeGroups
        .append('text')
        .attr('dy', '-1.2em')
        .attr('x', 0)
        .style('text-anchor', 'middle')
        .text((d: d3.HierarchyNode<TreeNode>) => d.data.name)
        .style('font-size', isMobile ? '10px' : '12px')
        .style('font-family', 'sans-serif')
        .style('fill', '#333');

      // Add hover effects
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

      // Mobile-friendly pan behavior
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;

      // Unified pointer event handlers for both mouse and touch
      const handlePointerStart = (event: PointerEvent) => {
        event.preventDefault();
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        svg.style('cursor', 'grabbing');

        // Capture pointer for consistent tracking
        (event.target as Element).setPointerCapture(event.pointerId);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!isDragging) return;

        event.preventDefault();

        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;

        lastX = event.clientX;
        lastY = event.clientY;

        const currentTransform = d3.zoomTransform(contentGroup.node()!);
        const newTransform = d3.zoomIdentity
          .translate(currentTransform.x + deltaX, currentTransform.y + deltaY)
          .scale(currentTransform.k);

        contentGroup.attr('transform', newTransform.toString());
      };

      const handlePointerEnd = (event: PointerEvent) => {
        if (!isDragging) return;

        event.preventDefault();
        isDragging = false;
        svg.style('cursor', 'grab');

        // Release pointer capture
        (event.target as Element).releasePointerCapture(event.pointerId);
      };

      // Add pointer event listeners to SVG
      const svgElement = svg.node()!;
      svgElement.addEventListener('pointerdown', handlePointerStart, {
        passive: false,
      });
      svgElement.addEventListener('pointermove', handlePointerMove, {
        passive: false,
      });
      svgElement.addEventListener('pointerup', handlePointerEnd, {
        passive: false,
      });
      svgElement.addEventListener('pointercancel', handlePointerEnd, {
        passive: false,
      });

      // Set initial cursor and touch-action
      svg.style('cursor', 'grab').style('touch-action', 'none'); // Prevent default touch behaviors

      // Calculate initial centering and default zoom
      const bounds = contentGroup.node()?.getBBox();
      if (bounds) {
        // Default zoom scale - quite zoomed in
        const defaultScale = isMobile ? 1.5 : 2.0;

        // Calculate center position
        const treeCenterX = bounds.x + bounds.width / 2;
        const treeCenterY = bounds.y + bounds.height / 2;

        const viewportCenterX = dimensions.width / 2;
        const viewportCenterY = dimensions.height / 2;

        // Calculate translation to center the tree at the default scale
        const translateX = viewportCenterX - treeCenterX * defaultScale;
        const translateY = viewportCenterY - treeCenterY * defaultScale;

        // Apply the initial transform
        const initialTransform = d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(defaultScale);

        contentGroup.attr('transform', initialTransform.toString());
      }

      // Re-center function for window resize
      const recenter = () => {
        const bounds = contentGroup.node()?.getBBox();
        if (bounds) {
          const currentTransform = d3.zoomTransform(contentGroup.node()!);
          const currentScale = currentTransform.k;

          const treeCenterX = bounds.x + bounds.width / 2;
          const treeCenterY = bounds.y + bounds.height / 2;

          const viewportCenterX = dimensions.width / 2;
          const viewportCenterY = dimensions.height / 2;

          const translateX = viewportCenterX - treeCenterX * currentScale;
          const translateY = viewportCenterY - treeCenterY * currentScale;

          const centeredTransform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(currentScale);

          contentGroup
            .transition()
            .duration(300)
            .attr('transform', centeredTransform.toString());
        }
      };

      // Add a small delay to ensure proper centering after render
      setTimeout(recenter, 50);

      // Cleanup function
      return () => {
        svgElement.removeEventListener('pointerdown', handlePointerStart);
        svgElement.removeEventListener('pointermove', handlePointerMove);
        svgElement.removeEventListener('pointerup', handlePointerEnd);
        svgElement.removeEventListener('pointercancel', handlePointerEnd);
      };
    }, [nodes, dimensions.width, dimensions.height]);

    return (
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden rounded-lg bg-zinc-100 shadow ring-1 shadow-zinc-200 ring-zinc-200 dark:bg-zinc-900"
        style={{ minHeight: height, touchAction: 'none' }}
      />
    );
  }
);

NodeLinkDiagramRenderer.displayName = 'NodeLinkDiagramRenderer';
