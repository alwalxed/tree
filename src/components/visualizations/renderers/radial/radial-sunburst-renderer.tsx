'use client';

import type { Node } from '@/lib/schema/bookTree';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

export type RadialSunburstRendererProps = {
  nodes: Node[];
  initialWidth?: number;
  initialHeight?: number;
};

type HierarchyDatum = {
  name: string;
  value: number;
  children?: HierarchyDatum[];
};

const GRADIENT_DEFINITIONS = [
  { id: 'gradient-1', from: '#fafafa', to: '#f4f4f5' }, // zinc-50 to zinc-100
  { id: 'gradient-2', from: '#f4f4f5', to: '#e4e4e7' }, // zinc-100 to zinc-200
  { id: 'gradient-3', from: '#e4e4e7', to: '#d4d4d8' }, // zinc-200 to zinc-300
  { id: 'gradient-4', from: '#d4d4d8', to: '#a1a1aa' }, // zinc-300 to zinc-400
  { id: 'gradient-5', from: '#a1a1aa', to: '#71717a' }, // zinc-400 to zinc-500
  { id: 'gradient-6', from: '#71717a', to: '#52525b' }, // zinc-500 to zinc-600
  { id: 'gradient-7', from: '#52525b', to: '#3f3f46' }, // zinc-600 to zinc-700
  { id: 'gradient-8', from: '#3f3f46', to: '#27272a' }, // zinc-700 to zinc-800
  { id: 'gradient-9', from: '#27272a', to: '#18181b' }, // zinc-800 to zinc-900
] as const;

export const RadialSunburstRenderer = memo(
  ({
    nodes,
    initialWidth = 1000,
    initialHeight = 1000,
  }: RadialSunburstRendererProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [dimensions, setDimensions] = useState({
      width: initialWidth,
      height: initialHeight,
    });

    // Transform nodes data to hierarchical format for D3
    const transformData = useCallback((nodes: Node[]): HierarchyDatum[] => {
      const transform = (nodes: Node[]): HierarchyDatum[] => {
        return nodes.map(
          (node): HierarchyDatum => ({
            name: node.title,
            value: node.children.length ? 0 : 1,
            children: node.children.length
              ? transform(node.children)
              : undefined,
          })
        );
      };

      return transform(nodes);
    }, []);

    // Handle dimensions based on container size
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
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, [initialWidth, initialHeight]);

    // Zoom control handlers
    const handleZoomIn = useCallback(() => {
      const newScale = Math.min(transform.scale * 1.5, 5);
      setTransform((prev) => ({ ...prev, scale: newScale }));
      setZoomLevel(newScale);
    }, [transform.scale]);

    const handleZoomOut = useCallback(() => {
      const newScale = Math.max(transform.scale / 1.5, 0.5);
      setTransform((prev) => ({ ...prev, scale: newScale }));
      setZoomLevel(newScale);
    }, [transform.scale]);

    const handleResetZoom = useCallback(() => {
      const { width, height } = dimensions;
      const centerX = width / 2;
      const centerY = height / 2;

      setTransform({ x: centerX, y: centerY, scale: 1 });
      setZoomLevel(1);
    }, [dimensions]);

    // Main rendering effect
    useEffect(() => {
      if (!svgRef.current || !nodes.length || !dimensions.width) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const { width, height } = dimensions;
      const radius = Math.min(width, height) / 2.2;

      // Create gradient definitions
      const defs = svg.append('defs');
      GRADIENT_DEFINITIONS.forEach((gradientDef) => {
        const gradient = defs
          .append('radialGradient')
          .attr('id', gradientDef.id)
          .attr('cx', '50%')
          .attr('cy', '50%')
          .attr('r', '50%');

        gradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', gradientDef.from);

        gradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', gradientDef.to);
      });

      // Create main group element with transform
      const g = svg
        .append('g')
        .attr(
          'transform',
          `translate(${transform.x || width / 2},${transform.y || height / 2}) scale(${transform.scale})`
        );

      // Mobile-friendly pan and zoom behavior
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;
      let lastDistance = 0;
      const activePointers = new Map();

      // Unified pointer event handlers for pan and pinch-zoom
      const handlePointerStart = (event: PointerEvent) => {
        event.preventDefault();
        activePointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });

        if (activePointers.size === 1) {
          // Single pointer - start pan
          isDragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
          svg.style('cursor', 'grabbing');
        } else if (activePointers.size === 2) {
          // Two pointers - start pinch zoom
          isDragging = false;
          const pointers = Array.from(activePointers.values());
          lastDistance = Math.sqrt(
            Math.pow(pointers[1].x - pointers[0].x, 2) +
              Math.pow(pointers[1].y - pointers[0].y, 2)
          );
        }

        (event.target as Element).setPointerCapture(event.pointerId);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!activePointers.has(event.pointerId)) return;

        event.preventDefault();
        activePointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });

        if (activePointers.size === 1 && isDragging) {
          // Single pointer pan
          const deltaX = event.clientX - lastX;
          const deltaY = event.clientY - lastY;

          lastX = event.clientX;
          lastY = event.clientY;

          setTransform((prev) => ({
            ...prev,
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));
        } else if (activePointers.size === 2) {
          // Two pointer pinch zoom
          const pointers = Array.from(activePointers.values());
          const currentDistance = Math.sqrt(
            Math.pow(pointers[1].x - pointers[0].x, 2) +
              Math.pow(pointers[1].y - pointers[0].y, 2)
          );

          if (lastDistance > 0) {
            const scaleChange = currentDistance / lastDistance;
            const newScale = Math.min(
              Math.max(transform.scale * scaleChange, 0.5),
              5
            );

            setTransform((prev) => ({ ...prev, scale: newScale }));
            setZoomLevel(newScale);
          }

          lastDistance = currentDistance;
        }
      };

      const handlePointerEnd = (event: PointerEvent) => {
        if (!activePointers.has(event.pointerId)) return;

        event.preventDefault();
        activePointers.delete(event.pointerId);

        if (activePointers.size === 0) {
          isDragging = false;
          svg.style('cursor', 'grab');
        } else if (activePointers.size === 1) {
          // Back to single pointer mode
          const pointer = Array.from(activePointers.values())[0];
          isDragging = true;
          lastX = pointer.x;
          lastY = pointer.y;
        }

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
      svg.style('cursor', 'grab').style('touch-action', 'none');

      // Create hierarchy and partition layout
      const root = d3
        .hierarchy<HierarchyDatum>({
          name: 'root',
          value: 0,
          children: transformData(nodes),
        })
        .sum((d) => d.value);

      const partition = d3
        .partition<HierarchyDatum>()
        .size([2 * Math.PI, radius * 0.95]);

      const rootWithPartition = partition(root);

      // Create gradient scale
      const gradientScale = d3
        .scaleOrdinal<number, string>()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9])
        .range(GRADIENT_DEFINITIONS.map((def) => def.id));

      // Create arc generator
      const arc = d3
        .arc<d3.HierarchyRectangularNode<HierarchyDatum>>()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .innerRadius((d) => d.y0)
        .outerRadius((d) => d.y1);

      // Create segments
      const segments = g
        .selectAll('path')
        .data(rootWithPartition.descendants().slice(1))
        .enter()
        .append('path')
        .attr('d', (d) => arc(d as d3.HierarchyRectangularNode<HierarchyDatum>))
        .style('fill', (d) => `url(#${gradientScale(d.depth)})`)
        .style('opacity', 0.9)
        .style('stroke', '#ffffff')
        .style('stroke-width', '1px')
        .style('cursor', 'pointer')
        .on('mouseover', function () {
          d3.select(this).style('opacity', 1).style('stroke-width', '2px');
        })
        .on('mouseout', function () {
          d3.select(this).style('opacity', 0.9).style('stroke-width', '1px');
        });

      segments.append('title').text((d) => d.data.name);

      // Filter nodes that are large enough for text
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

      // Create text containers
      const textContainers = g
        .selectAll('.text-container')
        .data(textNodes)
        .enter()
        .append('g')
        .attr('class', 'text-container');

      // Render text in segments
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

        // Calculate font size based on depth and available space
        const baseFontSize =
          Math.min(dimensions.width, dimensions.height) / 100;
        let fontSize;

        if (d.depth === 1) {
          fontSize = Math.min(baseFontSize * 2.5, arcWidth * 0.4);
        } else if (d.depth === 2) {
          fontSize = Math.min(baseFontSize * 2, arcWidth * 0.3);
        } else {
          fontSize = Math.min(baseFontSize * 1.5, arcWidth * 0.25);
        }

        fontSize = Math.max(fontSize, 8);

        // Calculate rotation for text
        let rotation = (middleAngle * 180) / Math.PI;
        if (rotation > 90 && rotation < 270) {
          rotation += 180;
        }

        // Get text color based on depth
        const textColor = d.depth <= 4 ? '#18181b' : '#ffffff';

        const textElement = d3
          .select(this)
          .attr('transform', `translate(${x},${y}) rotate(${rotation})`)
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', textColor)
          .attr('font-size', `${fontSize}px`)
          .attr('font-family', 'var(--font-ibmPlexSansArabic)')
          .attr('font-weight', '600')
          .style(
            'text-shadow',
            textColor === '#ffffff'
              ? '1px 1px 3px rgba(0,0,0,0.8)'
              : '1px 1px 3px rgba(255,255,255,0.8)'
          );

        // Handle text wrapping
        const words = d.data.name.split(/\s+/);
        const lineHeight = fontSize * 1.2;
        const maxLines = Math.max(1, Math.floor(boxHeight / lineHeight));
        const charsPerLine = Math.max(
          3,
          Math.floor(boxWidth / (fontSize * 0.55))
        );

        if (
          words.length === 1 &&
          words[0].length > charsPerLine &&
          maxLines > 1
        ) {
          // Handle single long word
          const word = words[0];
          let currentLine = '';
          let lineNumber = 0;

          for (let i = 0; i < word.length && lineNumber < maxLines; i++) {
            currentLine += word[i];

            if (currentLine.length >= charsPerLine || i === word.length - 1) {
              const isLastLine =
                lineNumber === maxLines - 1 || i === word.length - 1;
              const text =
                isLastLine && i < word.length - 1
                  ? currentLine + '...'
                  : currentLine;

              textElement
                .append('tspan')
                .attr('x', 0)
                .attr(
                  'y',
                  lineNumber * lineHeight - ((maxLines - 1) * lineHeight) / 2
                )
                .text(text);

              currentLine = '';
              lineNumber++;
            }
          }
        } else {
          // Handle multiple words
          let currentLine = '';
          let lineNumber = 0;

          for (let i = 0; i < words.length && lineNumber < maxLines; i++) {
            const word = words[i];
            const testLine = currentLine + (currentLine ? ' ' : '') + word;

            if (testLine.length <= charsPerLine || currentLine === '') {
              currentLine = testLine;
            } else {
              textElement
                .append('tspan')
                .attr('x', 0)
                .attr(
                  'y',
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
                  ? currentLine + '...'
                  : currentLine;

              textElement
                .append('tspan')
                .attr('x', 0)
                .attr(
                  'y',
                  lineNumber * lineHeight - ((maxLines - 1) * lineHeight) / 2
                )
                .text(text);
            }
          }
        }
      });

      // Cleanup function
      return () => {
        svgElement.removeEventListener('pointerdown', handlePointerStart);
        svgElement.removeEventListener('pointermove', handlePointerMove);
        svgElement.removeEventListener('pointerup', handlePointerEnd);
        svgElement.removeEventListener('pointercancel', handlePointerEnd);
      };
    }, [nodes, dimensions, transformData, transform]);

    // Update transform when state changes
    useEffect(() => {
      if (!svgRef.current) return;

      const svg = d3.select(svgRef.current);
      const g = svg.select('g');

      if (!g.empty()) {
        g.attr(
          'transform',
          `translate(${transform.x || dimensions.width / 2},${transform.y || dimensions.height / 2}) scale(${transform.scale})`
        );
      }
    }, [transform, dimensions]);

    return (
      <div
        ref={containerRef}
        className="relative h-[80vh] w-full rounded-lg bg-zinc-100/80 shadow ring-1 shadow-zinc-100 ring-zinc-200 dark:bg-slate-800"
        style={{ touchAction: 'none' }}
      >
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 shadow-xs transition-shadow hover:shadow-sm dark:border-zinc-600 dark:bg-zinc-700"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 shadow-xs transition-shadow hover:shadow-sm dark:border-zinc-600 dark:bg-zinc-700"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          </button>
          <button
            onClick={handleResetZoom}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 shadow-xs transition-shadow hover:shadow-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
            title="Reset Zoom"
          >
            اضبط
          </button>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute right-4 bottom-4 z-10 rounded-lg border border-zinc-200 bg-white px-3 py-1 shadow-xs dark:border-zinc-600 dark:bg-zinc-700">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* SVG Container */}
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
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

RadialSunburstRenderer.displayName = 'RadialSunburstRenderer';
