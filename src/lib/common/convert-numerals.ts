type ConvertNumeralsParams = {
  value: string | number;
  direction: 'en-to-ar' | 'ar-to-en';
};

export function convertNumerals(params: ConvertNumeralsParams): string {
  const { value, direction } = params;

  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new TypeError('Value must be a number or a numeric string.');
  }

  const str = String(value);
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const englishDigits = '0123456789';

  let from: string;
  let to: string;

  switch (direction) {
    case 'en-to-ar':
      from = englishDigits;
      to = arabicDigits;
      break;
    case 'ar-to-en':
      from = arabicDigits;
      to = englishDigits;
      break;
    default:
      throw new Error("Direction must be 'en-to-ar' or 'ar-to-en'.");
  }

  const converted = str.replace(/[0-9\u0660-\u0669]/g, (d) => {
    const idx = from.indexOf(d);
    return idx >= 0 ? to[idx] : d;
  });

  return converted;
}
