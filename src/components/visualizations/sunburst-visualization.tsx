"use client";

import type { Node } from "@/lib/content/types";
import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";

// Define the shape of the hierarchical data for D3
interface HierarchyDatum {
  name: string;
  value: number;
  children?: HierarchyDatum[];
}

export function SunburstVisualization({
  nodes,
  width = 800,
  height = 800,
}: {
  nodes: Node[];
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Transform DocNode structure to format needed for d3 hierarchy
  const transformData = useCallback((nodes: Node[]): HierarchyDatum[] => {
    return nodes.map(
      (node): HierarchyDatum => ({
        name: node.title,
        value: node.children.length ? 0 : 1,
        children: node.children.length
          ? transformData(node.children)
          : undefined,
      })
    );
  }, []);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const root = d3
      .hierarchy<HierarchyDatum>({
        name: "root",
        children: transformData(nodes),
      })
      .sum((d) => d.value);

    const partition = d3
      .partition<HierarchyDatum>()
      .size([2 * Math.PI, radius]);
    partition(root);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const arc = d3
      .arc<d3.HierarchyRectangularNode<HierarchyDatum>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    g.selectAll("path")
      .data(root.descendants())
      .enter()
      .append("path")
      .attr("d", arc)
      .style("fill", (d) => colorScale(d.depth.toString()))
      .style("opacity", 0.8)
      .style("stroke", "#fff")
      .style("stroke-width", "1px")
      .append("title")
      .text((d) => d.data.name);

    g.selectAll("text")
      .data(root.descendants().filter((d) => d.x1 - d.x0 > 0.2))
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
  }, [nodes, width, height, transformData]);

  return (
    <div className="w-full overflow-auto bg-white dark:bg-zinc-900 rounded-lg p-4">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
