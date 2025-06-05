'use client';

import type { Node } from '@/lib/schema/bookTree';
import * as d3 from 'd3';
import { memo, useEffect, useRef, useState } from 'react';

export type CirclePackRendererProps = {
  nodes: Node[];
  width?: number;
  height?: number;
};

type HierarchyData = {
  title: string;
  children?: HierarchyData[];
};

export const CirclePackRenderer = memo(
  ({ nodes, width = 800, height = 800 }: CirclePackRendererProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width, height });

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const updateDimensions = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDimensions({
            width: rect.width || width,
            height: rect.height || height,
          });
        }
      };

      updateDimensions();

      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(el);

      return () => {
        resizeObserver.unobserve(el);
        resizeObserver.disconnect();
      };
    }, [width, height]);

    useEffect(() => {
      if (!svgRef.current || !containerRef.current || nodes.length === 0)
        return;

      // Transform data into hierarchy with proper typing
      const hierarchyData: HierarchyData = {
        title: 'root',
        children: nodes as HierarchyData[],
      };

      const root = d3
        .hierarchy(hierarchyData)
        .sum((d) => Math.max(20, d.title.length)); // Base size on text length

      // Create the pack layout with proper typing
      const pack = d3
        .pack<HierarchyData>()
        .size([dimensions.width, dimensions.height])
        .padding(20);
      const packedData = pack(root);

      // Create the visualization
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear previous content

      // Create a container for panning
      const g = svg.append('g');

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

        const currentTransform = d3.zoomTransform(g.node()!);
        const newTransform = d3.zoomIdentity
          .translate(currentTransform.x + deltaX, currentTransform.y + deltaY)
          .scale(currentTransform.k);

        g.attr('transform', newTransform.toString());
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

      // Function to wrap text
      function wrap(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        text: d3.Selection<SVGTextElement, any, any, any>,
        width: number
      ) {
        text.each(function () {
          const textElement = d3.select(this);
          const words = textElement.text().split(/\s+/);
          const lineHeight = 1.1;
          let line: string[] = [];
          let lineNumber = 0;
          const y = textElement.attr('y') || 0;
          const dy = parseFloat(textElement.attr('dy') || '0');

          // Clear the text and create the first tspan
          textElement.text('');

          let tspan = textElement
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', `${dy}em`);

          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            line.push(word);
            tspan.text(line.join(' '));

            // Check if the line is too long
            if (
              (tspan.node()?.getComputedTextLength() || 0) > width &&
              line.length > 1
            ) {
              // Remove the last word from the current line
              line.pop();
              tspan.text(line.join(' '));

              // Create a new line with the word that didn't fit
              line = [word];
              lineNumber++;
              tspan = textElement
                .append('tspan')
                .attr('x', 0)
                .attr('dy', `${lineHeight}em`)
                .text(word);
            }
          }

          // Center the text vertically based on number of lines
          const totalLines = lineNumber + 1;
          const offsetY = -(totalLines - 1) * lineHeight * 0.5;

          textElement.selectAll('tspan').each(function (d, i) {
            d3.select(this).attr(
              'dy',
              i === 0 ? `${dy + offsetY}em` : `${lineHeight}em`
            );
          });
        });
      }

      // Function to find the best text position for parent nodes
      function getTextPosition(d: d3.HierarchyCircularNode<HierarchyData>) {
        if (!d.children) {
          return { x: 0, y: 0 }; // Center for leaf nodes
        }

        // For parent nodes, find empty space
        const children = d.children;
        const radius = d.r;

        // Try different positions around the circle
        const positions = [
          { x: 0, y: -radius * 0.7 }, // Top
          { x: 0, y: radius * 0.7 }, // Bottom
          { x: -radius * 0.7, y: 0 }, // Left
          { x: radius * 0.7, y: 0 }, // Right
          { x: -radius * 0.5, y: -radius * 0.5 }, // Top-left
          { x: radius * 0.5, y: -radius * 0.5 }, // Top-right
          { x: -radius * 0.5, y: radius * 0.5 }, // Bottom-left
          { x: radius * 0.5, y: radius * 0.5 }, // Bottom-right
        ];

        // Find position with least overlap with children
        let bestPosition = positions[0];
        let minOverlap = Infinity;

        for (const pos of positions) {
          let overlap = 0;
          for (const child of children) {
            const distance = Math.sqrt(
              Math.pow(pos.x - (child.x - d.x), 2) +
                Math.pow(pos.y - (child.y - d.y), 2)
            );
            if (distance < child.r + 20) {
              // 20px buffer
              overlap += child.r + 20 - distance;
            }
          }

          if (overlap < minOverlap) {
            minOverlap = overlap;
            bestPosition = pos;
          }
        }

        return bestPosition;
      }

      // Helper function to check if node has children
      const hasChildren = (
        d: d3.HierarchyCircularNode<HierarchyData>
      ): boolean => {
        return Boolean(d.children && d.children.length > 0);
      };

      // Create node groups (exclude root node)
      const node = g
        .selectAll<SVGGElement, d3.HierarchyCircularNode<HierarchyData>>('g')
        .data(packedData.descendants().filter((d) => d.depth > 0))
        .join('g')
        .attr('transform', (d) => `translate(${d.x},${d.y})`);

      // First, draw all leaf node circles
      node
        .filter((d) => !hasChildren(d))
        .append('circle')
        .attr('r', (d) => d.r)
        .attr('fill', '#ffffff00') // leaf nodes
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('pointer-events', 'none') // Disable click events since we removed zoom
        .on('mouseover', function () {
          d3.select(this).attr('stroke-width', 2);
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke-width', 1);
        });

      // Then, draw parent node circles (excluding root)
      node
        .filter((d) => hasChildren(d))
        .append('circle')
        .attr('r', (d) => d.r)
        .attr('fill', '#ffffff00') // parent nodes
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('pointer-events', 'none') // Disable click events since we removed zoom
        .on('mouseover', function () {
          d3.select(this).attr('stroke-width', 2);
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke-width', 1);
        });

      // Add text labels (already filtered to depth > 0)
      const textElements = node
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => {
          const pos = getTextPosition(d);
          return `translate(${pos.x}, ${pos.y})`;
        })
        .style('font-size', (d) => {
          const baseSize = Math.min(d.r / 4, 14);
          const textLength = d.data.title.length;
          const scaleFactor = d.children ? 0.8 : 1; // Smaller text for parent nodes
          return `${Math.max(
            baseSize * scaleFactor * (25 / Math.max(textLength, 25)),
            8
          )}px`;
        })
        .style('fill', (d) => (d.children ? '#666666' : '#000000')) // Lighter color for parent nodes
        .style('font-weight', (d) => (d.children ? 'bold' : 'normal'))
        .style('pointer-events', 'none')
        .text((d) => d.data.title);

      // Apply text wrapping
      textElements.each(function (d) {
        const wrapWidth = d.children ? d.r * 0.8 : d.r * 1.6;
        wrap(d3.select(this), wrapWidth);
      });

      // Calculate initial centering and default zoom
      const bounds = g.node()?.getBBox();
      if (bounds) {
        const isMobile = window.innerWidth < 768;
        // Default zoom scale - quite zoomed in
        const defaultScale = isMobile ? 1.2 : 1.8;

        // Calculate center position of the packed circles
        const contentCenterX = bounds.x + bounds.width / 2;
        const contentCenterY = bounds.y + bounds.height / 2;

        const viewportCenterX = dimensions.width / 2;
        const viewportCenterY = dimensions.height / 2;

        // Calculate translation to center the content at the default scale
        const translateX = viewportCenterX - contentCenterX * defaultScale;
        const translateY = viewportCenterY - contentCenterY * defaultScale;

        // Apply the initial transform
        const initialTransform = d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(defaultScale);

        g.attr('transform', initialTransform.toString());
      }

      // Re-center function for window resize
      const recenter = () => {
        const bounds = g.node()?.getBBox();
        if (bounds) {
          const currentTransform = d3.zoomTransform(g.node()!);
          const currentScale = currentTransform.k;

          const contentCenterX = bounds.x + bounds.width / 2;
          const contentCenterY = bounds.y + bounds.height / 2;

          const viewportCenterX = dimensions.width / 2;
          const viewportCenterY = dimensions.height / 2;

          const translateX = viewportCenterX - contentCenterX * currentScale;
          const translateY = viewportCenterY - contentCenterY * currentScale;

          const centeredTransform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(currentScale);

          g.transition()
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
        className="flex items-center justify-center overflow-hidden rounded-lg bg-zinc-100 shadow ring-1 shadow-zinc-100 ring-zinc-200"
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      >
        <svg
          ref={svgRef}
          width={'100%'}
          height={'100%'}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    );
  }
);

CirclePackRenderer.displayName = 'CirclePackRenderer';
