'use client';

import type { Node } from '@/lib/schema/bookTree';
import * as d3 from 'd3';
import { memo, useEffect, useRef } from 'react';

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
      const pack = d3.pack<HierarchyData>().size([width, height]).padding(20);
      const packedData = pack(root);

      // Create the visualization
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear previous content

      // Create a container for zooming
      const g = svg.append('g');

      // Add zoom behavior
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      svg.call(zoom);

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

      // Add double-click to zoom behavior
      node.on('dblclick', (event, d) => {
        event.stopPropagation();
        const dx = d.x;
        const dy = d.y;
        const scale = Math.min(width / (d.r * 2), height / (d.r * 2)) * 0.9;

        svg
          .transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(scale)
              .translate(-dx, -dy)
          );
      });

      // Add double-click on background to reset zoom
      svg.on('dblclick', () => {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      });
    }, [nodes, width, height]);

    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center overflow-hidden rounded-lg bg-zinc-100 shadow ring-1 shadow-zinc-100 ring-zinc-200"
        style={{ width: '100%', height: '100%' }}
      >
        <svg
          ref={svgRef}
          width={'100%'}
          height={'100%'}
          viewBox={`0 0 ${width} ${height}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    );
  }
);
