export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function wordCount(str: string): number {
  return str
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export function sentenceCount(str: string): number {
  const sentences = str.match(/[^.!?]+[.!?]+/g);
  return sentences ? sentences.length : 0;
}

export function extractSentences(str: string): string[] {
  const matches = str.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.map((s) => s.trim()) : [];
}

export function cleanTranscript(str: string): string {
  return str
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractWords(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

export function findKeywordMatches(text: string, keywords: string[]): string[] {
  const lowerText = text.toLowerCase();
  return keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase()));
}
