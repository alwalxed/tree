import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges class names using `clsx` and `tailwind-merge`.
 *
 * Useful for conditionally applying Tailwind CSS classes in a consistent way.
 *
 * @param inputs - A list of class name strings or conditional class expressions.
 * @returns A merged, deduplicated class string.
 *
 * @example
 * ```ts
 * cn("text-sm", isActive && "text-bold") // "text-sm text-bold"
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
