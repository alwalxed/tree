"use client";

import type { TreeNode } from "@/lib/markdown/tree-builder";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

export function SunburstVisualization({
  nodes,
  width = 800,
  height = 800,
}: {
  nodes: TreeNode[];
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Convert DocNode tree to hierarchical data for d3
    const hierarchyData = d3
      .hierarchy({ name: "root", children: transformData(nodes) })
      .sum((d) => d.value || 0);

    // Create partition layout
    const partition = d3.partition().size([2 * Math.PI, radius]);

    // Apply the partition layout
    partition(hierarchyData);

    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create arcs
    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    // Add the arcs
    g.selectAll("path")
      .data(hierarchyData.descendants())
      .enter()
      .append("path")
      .attr("d", arc as any)
      .style("fill", (d) => colorScale(d.depth.toString()))
      .style("opacity", 0.8)
      .style("stroke", "#fff")
      .style("stroke-width", "1px")
      .append("title")
      .text((d) => d.data.name);

    // Add text labels for larger arcs
    g.selectAll("text")
      .data(hierarchyData.descendants().filter((d) => d.x1 - d.x0 > 0.2))
      .enter()
      .append("text")
      .attr("transform", (d) => {
        const x = (d.x0 + d.x1) / 2;
        const y = (d.y0 + d.y1) / 2;
        const rotation = (x * 180) / Math.PI - 90;
        return `rotate(${rotation}) translate(${y},0) rotate(${
          rotation >= 90 && rotation <= 270 ? 180 : 0
        })`;
      })
      .attr("dx", "6")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#fff")
      .text((d) => d.data.name);
  }, [nodes, width, height]);

  // Transform DocNode structure to format needed for d3 hierarchy
  function transformData(nodes: TreeNode[]): any[] {
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
