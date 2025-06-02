export function safeDecodeURIComponent(str: string): string {
  try {
    // Check if the string is already decoded by trying to decode it
    // If decoding fails or doesn't change the string, return as-is
    const decoded = decodeURIComponent(str);
    // If decoding the decoded string gives the same result, it was already decoded
    if (decoded === decodeURIComponent(decoded)) {
      return decoded;
    }
    return str;
  } catch {
    // If decoding fails, return the original string
    return str;
  }
}