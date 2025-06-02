type FilterOptions = {
  arabicLetters?: boolean;
  arabicNumbers?: boolean;
  englishLetters?: boolean;
  englishNumbers?: boolean;
  underscores?: boolean;
  spaces?: boolean;
  forwardSlashes?: boolean;
  asciiSingleQuotes?: boolean;
  asciiDoubleQuotes?: boolean;
  smartSingleQuotes?: boolean;
  smartDoubleQuotes?: boolean;
  guillemets?: boolean;
  custom?: string;
};

export function filterString({
  input,
  options,
}: {
  input: string;
  options: FilterOptions;
}): string {
  const parts: string[] = [];

  for (const [ key, value ] of Object.entries(options) as [
    keyof FilterOptions,
    boolean | string,
  ][]) {
    const rangeOrChars = getRangeForOption(key, value);
    if (rangeOrChars) {
      parts.push(rangeOrChars);
    }
  }

  const allowed = parts.join('');
  const regex = new RegExp(`[^${ allowed }]`, 'gu');
  return input.replace(regex, '');
}

function getRangeForOption<K extends keyof FilterOptions>(
  option: K,
  value: FilterOptions[ K ]
): string | null {
  if (!value) return null;

  switch (option) {
    case 'arabicLetters':
      return '\u0600-\u06FF';
    case 'arabicNumbers':
      return '\u0660-\u0669';
    case 'englishLetters':
      return 'a-zA-Z';
    case 'englishNumbers':
      return '0-9';
    case 'underscores':
      return '_';
    case 'spaces':
      return ' ';
    case 'forwardSlashes':
      return '/';
    case 'asciiSingleQuotes':
      return "'";
    case 'asciiDoubleQuotes':
      return '"';
    case 'smartSingleQuotes':
      return '‘’';
    case 'smartDoubleQuotes':
      return '“”';
    case 'guillemets':
      return '«»';
    case 'custom':
      // Ensure value is treated as string for escapeRegExp
      return escapeRegExp(value as string);
    default:
      return null;
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
