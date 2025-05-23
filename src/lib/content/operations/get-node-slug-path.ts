import { SummaryNode } from "../types";

/**
 * Constructs the full slug path for a given SummaryNode by combining
 * its parent path and its own slug.
 *
 * @param node - The SummaryNode whose full slug path is to be constructed.
 * @returns A string representing the complete slug path (e.g., "section/topic/item").
 */
export function getNodeSlugPath(node: SummaryNode): string {
  return [...node.parentPath, node.slug].join("/");
}
