"use client";

import type { DocNode } from "@/lib/docs";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface TreeDiagramProps {
  data: DocNode[];
  width?: number;
  height?: number;
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export function TreeDiagramVisualization({
  data,
  width = 1000,
  height = 800,
}: TreeDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const margin = { top: 40, right: 90, bottom: 40, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Convert DocNode[] to TreeNode[]
    function toTreeNode(nodes: DocNode[]): TreeNode[] {
      return nodes.map((node) => ({
        name: node.title,
        children: node.children?.length ? toTreeNode(node.children) : undefined,
      }));
    }

    const rootData: TreeNode = {
      name: "root",
      children: toTreeNode(data),
    };

    const root = d3.hierarchy<TreeNode>(rootData);

    const treeLayout = d3.tree<TreeNode>().size([innerHeight, innerWidth]);
    treeLayout(root);

    // Draw links (paths)
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x)
      )
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5);

    // Draw nodes (groups)
    const node = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr(
        "class",
        (d) => `node ${d.children ? "node--internal" : "node--leaf"}`
      )
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    node
      .append("circle")
      .attr("r", 5)
      .attr("fill", (d) => (d.children ? "#555" : "#999"));

    node
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", (d) => (d.children ? -10 : 10))
      .style("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name)
      .attr("font-size", "12px")
      .attr("fill", "#333");
  }, [data, width, height]);

  return (
    <div className="w-full overflow-auto bg-white dark:bg-zinc-900 rounded-lg p-4">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
