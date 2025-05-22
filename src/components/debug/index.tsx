"use client";

import type { Node } from "@/lib/content/types";
import { TreeStructureDebugger } from "./tree-structure.view";
import { memo } from 'react';

function DevDebuggersComponent({ tree }: { tree: Node[] }) {
  return (
    <>
      <TreeStructureDebugger tree={tree} />
    </>
  );
}

export const DevDebuggers = memo(DevDebuggersComponent);
