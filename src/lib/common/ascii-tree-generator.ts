import type { Node } from '../schema/bookTree';

export function generateASCIITree(
  docs: Node[],
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
