export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
    .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces (except newlines) with single space
    .trim();
}