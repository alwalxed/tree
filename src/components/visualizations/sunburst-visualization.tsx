"use client";

import type { Node } from "@/lib/content/types";
import * as d3 from "d3";
import { ZoomIn, ZoomOut } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

type HierarchyDatum = {
  name: string;
  value: number;
  children?: HierarchyDatum[];
};

type Dimensions = {
  width: number;
  height: number;
};

export const SunburstVisualization = memo(
  ({
    nodes,
    initialWidth = 4000,
    initialHeight = 4000,
  }: {
    nodes: Node[];
    initialWidth?: number;
    initialHeight?: number;
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const transformData = useDataTransformation();
    const dimensions = useDimensions(containerRef, initialWidth, initialHeight);
    const { zoomBehaviorRef, handleZoomIn, handleZoomOut, handleResetZoom } =
      useZoomBehavior(svgRef, dimensions);

    useSunburstVisualization(
      svgRef,
      nodes,
      dimensions,
      transformData,
      zoomBehaviorRef,
      setZoomLevel
    );

    return (
      <div
        ref={containerRef}
        className="ring-1 ring-zinc-200 shadow shadow-zinc-100 w-full h-[80vh] bg-zinc-100/80 dark:bg-slate-800 rounded-lg relative"
      >
        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />

        <ZoomLevelIndicator zoomLevel={zoomLevel} />

        <div className="w-full h-full flex justify-center items-center overflow-hidden">
          <svg
            ref={svgRef}
            className="cursor-grab active:cursor-grabbing"
            width={`${dimensions.width}px`}
            height={`${dimensions.height}px`}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
      </div>
    );
  }
);

const useSunburstVisualization = (
  svgRef: RefObject<SVGSVGElement | null>,
  nodes: Node[],
  dimensions: Dimensions,
  transformData: (nodes: Node[]) => HierarchyDatum[],
  zoomBehaviorRef: RefObject<d3.ZoomBehavior<SVGSVGElement, unknown> | null>,
  onZoomChange: (zoomLevel: number) => void
) => {
  useEffect(() => {
    if (!svgRef.current || !nodes.length || !dimensions.width) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const radius = Math.min(width, height) / 2.2;

    svg.attr("width", width).attr("height", height);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        onZoomChange(event.transform.k);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const root = d3
      .hierarchy<HierarchyDatum>({
        name: "root",
        value: 0,
        children: transformData(nodes),
      })
      .sum((d) => d.value);

    const partition = d3
      .partition<HierarchyDatum>()
      .size([2 * Math.PI, radius * 0.95]);

    const rootWithPartition = partition(root);
    const colorScale = createColorScale();

    const arc = d3
      .arc<d3.HierarchyRectangularNode<HierarchyDatum>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    // Create segments
    const segments = g
      .selectAll("path")
      .data(rootWithPartition.descendants().slice(1))
      .enter()
      .append("path")
      .attr("d", (d) => arc(d as d3.HierarchyRectangularNode<HierarchyDatum>))
      .style("fill", (d) => colorScale(d.depth.toString()))
      .style("opacity", 0.9)
      .style("stroke", "#ffffff")
      .style("stroke-width", "1px")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).style("opacity", 1).style("stroke-width", "2px");
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 0.9).style("stroke-width", "1px");
      });

    segments.append("title").text((d) => d.data.name);

    // Filter and render text
    const textNodes = rootWithPartition
      .descendants()
      .slice(1)
      .filter((d) => {
        const node = d as d3.HierarchyRectangularNode<HierarchyDatum>;
        const arcAngleDegrees = (node.x1 - node.x0) * (180 / Math.PI);
        const radialThickness = node.y1 - node.y0;

        const minAngle = node.depth === 1 ? 3 : node.depth === 2 ? 2 : 1.5;
        const minThickness = radius * 0.02;

        return arcAngleDegrees > minAngle && radialThickness > minThickness;
      });

    const textContainers = g
      .selectAll(".text-container")
      .data(textNodes)
      .enter()
      .append("g")
      .attr("class", "text-container");

    renderText(textContainers, dimensions, radius);
  }, [nodes, dimensions, transformData, zoomBehaviorRef, onZoomChange]);
};

function ZoomControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-600 flex justify-center items-center"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-600 flex justify-center items-center"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>
      <button
        onClick={onResetZoom}
        className="px-3 py-2 font-bold bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300"
        title="Reset Zoom"
      >
        اضبط
      </button>
    </div>
  );
}

function ZoomLevelIndicator({ zoomLevel }: { zoomLevel: number }) {
  return (
    <div className="absolute bottom-4 right-4 z-10 px-3 py-1 bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200 dark:border-slate-600">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {Math.round(zoomLevel * 100)}%
      </span>
    </div>
  );
}

function useDataTransformation() {
  return useCallback((nodes: Node[]): HierarchyDatum[] => {
    return nodes.map(
      (node): HierarchyDatum => ({
        name: node.title,
        value: node.children.length ? 0 : 1,
        children: node.children.length
          ? transformData(node.children)
          : undefined,
      })
    );

    function transformData(nodes: Node[]): HierarchyDatum[] {
      return nodes.map(
        (node): HierarchyDatum => ({
          name: node.title,
          value: node.children.length ? 0 : 1,
          children: node.children.length
            ? transformData(node.children)
            : undefined,
        })
      );
    }
  }, []);
}

function useDimensions(
  containerRef: React.RefObject<HTMLDivElement | null>,
  initialWidth: number,
  initialHeight: number
) {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: initialWidth,
    height: initialHeight,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const size = Math.max(
        Math.min(
          Math.min(containerWidth - 40, containerHeight - 100),
          initialWidth
        ),
        1000
      );

      setDimensions({ width: size, height: size });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [initialWidth, initialHeight]);

  return dimensions;
}

function useZoomBehavior(
  svgRef: React.RefObject<SVGSVGElement | null>,
  dimensions: Dimensions
) {
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);

  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.5);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1 / 1.5);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3.select(svgRef.current);

      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      const transform = d3.zoomIdentity.translate(centerX, centerY).scale(1);

      svg
        .transition()
        .duration(500)
        .call(zoomBehaviorRef.current.transform, transform);
    }
  }, [dimensions]);

  useEffect(() => {
    if (!svgRef.current) return;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .translateExtent([
        [-dimensions.width, -dimensions.height],
        [dimensions.width * 2, dimensions.height * 2],
      ]);

    zoomBehaviorRef.current = zoom;
  }, [dimensions]);

  return {
    zoomBehaviorRef,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
  };
}

function createColorScale() {
  const colorPalette = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f97316", // orange-500
    "#10b981", // emerald-500
    "#06b6d4", // cyan-500
    "#6366f1", // indigo-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#14b8a6", // teal-500
  ];

  return d3
    .scaleOrdinal<string>()
    .domain([...Array(10).keys()].map(String))
    .range(colorPalette);
}

function renderText(
  textContainers: d3.Selection<
    SVGGElement,
    d3.HierarchyRectangularNode<HierarchyDatum>,
    SVGGElement,
    unknown
  >,
  dimensions: Dimensions,
  radius: number
) {
  textContainers.each(function (d) {
    const node = d as d3.HierarchyRectangularNode<HierarchyDatum>;

    const middleAngle = (node.x0 + node.x1) / 2;
    const middleRadius = (node.y0 + node.y1) / 2;

    const x = Math.sin(middleAngle) * middleRadius;
    const y = -Math.cos(middleAngle) * middleRadius;

    const arcWidth = node.y1 - node.y0;
    const arcAngle = node.x1 - node.x0;
    const arcLength = arcAngle * middleRadius;

    const boxWidth = Math.min(arcLength * 0.9, arcWidth * 2);
    const boxHeight = arcWidth * 0.9;

    let fontSize;
    const baseFontSize = Math.min(dimensions.width, dimensions.height) / 100;

    if (d.depth === 1) {
      fontSize = Math.min(baseFontSize * 2.5, arcWidth * 0.4);
    } else if (d.depth === 2) {
      fontSize = Math.min(baseFontSize * 2, arcWidth * 0.3);
    } else {
      fontSize = Math.min(baseFontSize * 1.5, arcWidth * 0.25);
    }

    fontSize = Math.max(fontSize, 8);

    let rotation = (middleAngle * 180) / Math.PI;
    if (rotation > 90 && rotation < 270) {
      rotation += 180;
    }

    const textColor = d.depth > 2 ? "#ffffff" : "#000000";

    const textElement = d3
      .select(this)
      .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", textColor)
      .attr("font-size", `${fontSize}px`)
      .attr("font-family", "var(--font-ibmPlexSansArabic)")
      .style(
        "text-shadow",
        d.depth > 2 ? "1px 1px 2px rgba(0,0,0,0.5)" : "none"
      );

    const words = d.data.name.split(/\s+/);
    const lineHeight = fontSize * 1.2;
    const maxLines = Math.max(1, Math.floor(boxHeight / lineHeight));
    const charsPerLine = Math.max(3, Math.floor(boxWidth / (fontSize * 0.55)));

    if (words.length === 1 && words[0].length > charsPerLine && maxLines > 1) {
      const word = words[0];
      let currentLine = "";
      let lineNumber = 0;

      for (let i = 0; i < word.length && lineNumber < maxLines; i++) {
        currentLine += word[i];

        if (currentLine.length >= charsPerLine || i === word.length - 1) {
          const isLastLine =
            lineNumber === maxLines - 1 || i === word.length - 1;
          const text =
            isLastLine && i < word.length - 1
              ? currentLine + "..."
              : currentLine;

          textElement
            .append("tspan")
            .attr("x", 0)
            .attr(
              "y",
              lineNumber * lineHeight - ((maxLines - 1) * lineHeight) / 2
            )
            .text(text);

          currentLine = "";
          lineNumber++;
        }
      }
    } else {
      let currentLine = "";
      let lineNumber = 0;

      for (let i = 0; i < words.length && lineNumber < maxLines; i++) {
        const word = words[i];
        const testLine = currentLine + (currentLine ? " " : "") + word;

        if (testLine.length <= charsPerLine || currentLine === "") {
          currentLine = testLine;
        } else {
          textElement
            .append("tspan")
            .attr("x", 0)
            .attr(
              "y",
              lineNumber * lineHeight - ((maxLines - 1) * lineHeight) / 2
            )
            .text(currentLine);

          currentLine = word;
          lineNumber++;
        }

        if (i === words.length - 1 && lineNumber < maxLines) {
          const isLastPossibleLine = lineNumber === maxLines - 1;
          const hasMoreWords = i < words.length - 1;
          const text =
            isLastPossibleLine && hasMoreWords
              ? currentLine + "..."
              : currentLine;

          textElement
            .append("tspan")
            .attr("x", 0)
            .attr(
              "y",
              lineNumber * lineHeight - ((maxLines - 1) * lineHeight) / 2
            )
            .text(text);
        }
      }
    }
  });
}

// Main Component
