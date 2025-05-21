"use client";

import type { Node } from "@/lib/content/types";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

// Properly typed hierarchical data
interface TreemapDatum {
  name: string;
  value: number;
  children?: TreemapDatum[];
}

// Move transformation out of component to avoid re-creation
function transformData(nodes: Node[]): TreemapDatum[] {
  return nodes.map(
    (node): TreemapDatum => ({
      name: node.title,
      value: node.children.length ? 0 : 1,
      children: node.children.length ? transformData(node.children) : undefined,
    })
  );
}

export function TreemapVisualization({
  nodes,
  width = 800,
  height = 600,
}: {
  nodes: Node[];
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const hierarchyData = d3
      .hierarchy<TreemapDatum>({ name: "root", children: transformData(nodes) })
      .sum((d) => d.value || 0);

    const treemap = d3
      .treemap<TreemapDatum>()
      .size([width, height])
      .padding(1)
      .round(true);
    treemap(hierarchyData);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const cell = svg
      .selectAll("g")
      .data(hierarchyData.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    cell
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => colorScale(d.depth.toString()))
      .attr("opacity", 0.8)
      .attr("stroke", "#fff");

    cell
      .append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("font-size", "10px")
      .attr("fill", "#000")
      .text((d) => d.data.name);
  }, [nodes, width, height]); // ✅ no transformData in deps

  return (
    <div className="w-full overflow-auto bg-white dark:bg-zinc-900 rounded-lg p-4">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
