'use client';

import type { SummaryNode } from '@/lib/content/types';
import { memo } from 'react';
import { TreeStructureDebugger } from './tree-structure.view';

function DevDebuggersComponent({ tree }: { tree: SummaryNode[] }) {
  return (
    <>
      <TreeStructureDebugger tree={tree} />
    </>
  );
}

export const DevDebuggers = memo(DevDebuggersComponent);
