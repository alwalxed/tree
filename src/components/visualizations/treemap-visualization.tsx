"use client";

import type { DocNode } from "@/lib/docs";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface TreemapProps {
  data: DocNode[];
  width?: number;
  height?: number;
}

export function TreemapVisualization({
  data,
  width = 800,
  height = 600,
}: TreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Convert DocNode tree to hierarchical data for d3
    const hierarchyData = d3
      .hierarchy({ name: "root", children: transformData(data) })
      .sum((d) => d.value || 0);

    // Create treemap layout
    const treemap = d3.treemap().size([width, height]).padding(1).round(true);

    // Apply the treemap layout
    treemap(hierarchyData);

    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create the treemap cells
    const cell = svg
      .selectAll("g")
      .data(hierarchyData.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cell
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => colorScale(d.depth.toString()))
      .attr("opacity", 0.8)
      .attr("stroke", "#fff");

    // Add text labels
    cell
      .append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("font-size", "10px")
      .attr("fill", "#000")
      .text((d) => d.data.name)
      .attr("clip-path", (d) => `inset(0px 0px 0px 0px)`);
  }, [data, width, height]);

  // Transform DocNode structure to format needed for d3 hierarchy
  function transformData(nodes: DocNode[]): any[] {
    return nodes.map((node) => {
      const result: any = {
        name: node.title,
        value: node.children.length ? 0 : 1, // Leaf nodes have value 1
      };

      if (node.children.length) {
        result.children = transformData(node.children);
      }

      return result;
    });
  }

  return (
    <div className="w-full overflow-auto bg-white dark:bg-zinc-900 rounded-lg p-4">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
