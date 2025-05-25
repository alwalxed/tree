'use client';

import type { SummaryNode } from '@/lib/content/types';
import { memo } from 'react';
import { TreeStructureDebugger } from './tree-structure.view';

function DevDebuggersComponent({
  summaryTree,
}: {
  summaryTree: SummaryNode[];
}) {
  return (
    <>
      <TreeStructureDebugger summaryTree={summaryTree} />
    </>
  );
}

export const DevDebuggers = memo(DevDebuggersComponent);
