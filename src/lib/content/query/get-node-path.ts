import type { SummaryNode } from "../types";
export function getNodeSlugPath(node: SummaryNode): string {
  return [...node.parentPath, node.slug].join("/");
}
