import { Node } from "../types";

/**
 * Constructs the full slug path for a given Node by combining
 * its parent path and its own slug.
 *
 * @param node - The Node whose full slug path is to be constructed.
 * @returns A string representing the complete slug path (e.g., "section/topic/item").
 */
export function getNodeSlugPath(node: Node): string {
  return [...node.parentPath, node.slug].join("/");
}
