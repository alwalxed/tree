'use client';

import type { Node } from '@/lib/schema/bookTree';
import { memo } from 'react';
import { TreeStructureDebugger } from './tree-structure.view';

type DevDebuggersComponentProps = { tree: Node[] };

function DevDebuggersComponent({ tree }: DevDebuggersComponentProps) {
  return (
    <>
      <TreeStructureDebugger tree={tree} />
    </>
  );
}

export const DevDebuggers = memo(DevDebuggersComponent);
