import type { SummaryNode } from '../content/common/types';

/**
 * Generates an ASCII-style visual representation of a hierarchy of documentation nodes.
 *
 * Each node is displayed as a branch in a tree structure, useful for CLI output,
 * debugging, or visualizing nested documentation such as Markdown folder trees.
 *
 * @param docs - An array of `DocNode` objects representing the documentation hierarchy.
 * @param options - Configuration options for customizing the tree rendering.
 * @param options.indent - A string used to control the indentation of each level (used internally).
 * @param options.splitLevel - Stops rendering beyond a certain tree depth. Defaults to `Infinity`.
 * @param options.splitString - If provided, only renders branches that match this value at `splitLevel`.
 * @param options.currentLevel - The current depth level of recursion (used internally).
 *
 * @returns A string representing the ASCII tree structure.
 *
 * @example
 * ```ts
 * console.log(createASCIITree(docs));
 * // ├── مقدمة النحو
 * // │   ├── الاسم
 * // │   └── الفعل
 * //     ├── الماضي
 * //     └── المضارع
 * ```
 */
export function generateASCIITree(
  docs: SummaryNode[],
  options: {
    indent?: string;
    splitLevel?: number;
    splitString?: string;
    currentLevel?: number;
  } = {}
): string {
  const {
    indent = '',
    splitLevel = Infinity,
    splitString = '',
    currentLevel = 0,
  } = options;

  return docs
    .map((node, index) => {
      const isLast = index === docs.length - 1;
      const branch = isLast ? '└── ' : '├── ';
      const nextIndent = indent + (isLast ? '    ' : '│   ');
      const label = node.title.replace(/_/g, ' ');

      let output = '';

      if (currentLevel === splitLevel && label !== splitString) {
        return '';
      }

      output += `${ indent }${ branch }${ label }\n`;

      if (node.children.length > 0) {
        output += generateASCIITree(node.children, {
          indent: nextIndent,
          splitLevel,
          splitString,
          currentLevel: currentLevel + 1,
        });
      }

      return output;
    })
    .join('');
}
