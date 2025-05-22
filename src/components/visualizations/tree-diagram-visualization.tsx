"use client";

import type { Node } from "@/lib/content/types";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

type TreeVisualizationProps = {
  nodes: Node[];
  width?: number;
  height?: number;
};

export function TreeDiagramVisualization({
  nodes,
  width = 800,
  height = 600,
}: TreeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // Clear previous visualization
    containerRef.current.innerHTML = "";

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const contentGroup = svg
      .append("g")
      .attr("class", "content")
      .attr("transform", "translate(90, 20)");

    const transformNodes = (inputNodes: Node[]): TreeNode[] => {
      return inputNodes.map((node, index) => ({
        id: node.slug || `node-${index}`,
        name: node.title,
        children: node.children?.length
          ? transformNodes(node.children)
          : undefined,
      }));
    };

    // Instead of creating a root node, use the first node as root
    const treeData: TreeNode[] = transformNodes(nodes);
    const root = d3.hierarchy(treeData[0]); // Use the first node directly

    const treeLayout = d3
      .tree<TreeNode>()
      .size([height - 40, width - 180])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

    treeLayout(root);

    contentGroup
      .selectAll("path.link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal<
            d3.HierarchyLink<TreeNode>,
            d3.HierarchyPointNode<TreeNode>
          >()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .style("fill", "none")
      .style("stroke", "#555")
      .style("stroke-width", 1.5);

    const nodeGroups = contentGroup
      .selectAll("g.node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    nodeGroups
      .append("circle")
      .attr("r", 6)
      .style("fill", (d: d3.HierarchyNode<TreeNode>) =>
        d.children ? "#555" : "#999"
      )
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    // Adjust text position to prevent overlap
    nodeGroups
      .append("text")
      .attr("dy", "-1.2em") // Move text above the node
      .attr("x", 0) // Center text horizontally
      .style("text-anchor", "middle") // Center text alignment
      .text((d: d3.HierarchyNode<TreeNode>) => d.data.name)
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .style("fill", "#333");

    nodeGroups
      .on(
        "mouseover",
        function (event: MouseEvent, d: d3.HierarchyNode<TreeNode>) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(200)
            .attr("r", 8)
            .style("fill", "#0066cc");

          d3.select(this).select("text").style("font-weight", "bold");
        }
      )
      .on(
        "mouseout",
        function (event: MouseEvent, d: d3.HierarchyNode<TreeNode>) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(200)
            .attr("r", 6)
            .style("fill", d.children ? "#555" : "#999");

          d3.select(this).select("text").style("font-weight", "normal");
        }
      );

    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        contentGroup.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const bounds = contentGroup.node()?.getBBox();
    if (bounds) {
      const scale = Math.min(width / bounds.width, height / bounds.height, 0.9);
      const x = (width - bounds.width * scale) / 2;
      const y = (height - bounds.height * scale) / 2;

      svg.call(
        zoom.transform as any,
        d3.zoomIdentity.translate(x, y).scale(scale)
      );
    }
  }, [nodes, width, height]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 shadow shadow-zinc-200 p-4"
      style={{ minHeight: height }}
    />
  );
}
