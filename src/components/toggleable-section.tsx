"use client";

import { Grid, List } from "lucide-react";
import type React from "react";
import { useState } from "react";

export function ToggleableSection({
  title,
  headerClassName,
  treeView,
  gridView,
}: {
  title: string;
  headerClassName: string;
  treeView: React.ReactNode;
  gridView: React.ReactNode;
}) {
  const [showGrid, setShowGrid] = useState(false);

  return (
    <>
      <SectionHeader
        title={title}
        headerClassName={headerClassName}
        showGrid={showGrid}
        onToggle={() => setShowGrid(!showGrid)}
      />
      <div className="transition-opacity duration-300 bg-red-200">
        {showGrid ? gridView : treeView}
      </div>
    </>
  );
}

function ToggleButton({
  showGrid,
  onClick,
}: {
  showGrid: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
      aria-label={showGrid ? "Switch to tree view" : "Switch to grid view"}
    >
      {showGrid ? (
        <>
          <List className="w-4 h-4" />
          <span>Show Tree</span>
        </>
      ) : (
        <>
          <Grid className="w-4 h-4" />
          <span>Show Grid</span>
        </>
      )}
    </button>
  );
}

function SectionHeader({
  title,
  headerClassName,
  showGrid,
  onToggle,
}: {
  title: string;
  headerClassName: string;
  showGrid: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <h2 className={headerClassName}>{title}</h2>
      <ToggleButton showGrid={showGrid} onClick={onToggle} />
    </div>
  );
}
