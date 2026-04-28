/**
 * Strip HTML tags from a string (replacement for DOMPurify in React Native).
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncate text to a maximum length with an ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a number with commas.
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('tr-TR');
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert minutes to human-readable duration (e.g. "1 sa 30 dk").
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} sa`;
  return `${hours} sa ${mins} dk`;
}

/**
 * Age group color map (consistent with web design).
 * Keys are matched as substrings of the age-group slug (longest key first wins).
 */
export const AGE_GROUP_COLORS: Record<string, string> = {
  // 0–6 months
  '0-6-ay': '#F8BBD0',
  // 6–8 months
  '6-8-ay': '#AED581',
  // 8–12 months
  '8-12-ay': '#81D4FA',
  // 6–12 months (alternative slug)
  '6-12-ay': '#81D4FA',
  // 12 months / 1 year
  '12-ay': '#FF8A65',
  // 1–3 years
  '1-3-yas': '#FFB74D',
  // 3–6 years (before the bare '3-yas' key so longer key matches first)
  '3-6-yas': '#B39DDB',
  // 3 years
  '3-yas': '#CE93D8',
  // 4 years
  '4-yas': '#F48FB1',
  // 5 years
  '5-yas': '#80DEEA',
  // 6+ years
  '6-yas': '#FFD54F',
};

/**
 * Return the color for a given age group slug.
 * Tries the longest matching key first to avoid short-key false positives.
 * Falls back to the API-provided color, then the given fallback.
 */
export function getAgeGroupColor(slug: string, apiColor?: string | null, fallback?: string): string {
  // Sort keys by length (descending) so longer/more-specific keys match first
  const key = Object.keys(AGE_GROUP_COLORS)
    .sort((a, b) => b.length - a.length)
    .find((k) => slug.includes(k));
  return key ? AGE_GROUP_COLORS[key] : apiColor ?? fallback ?? '#FF8A65';
}

/**
 * Translate a difficulty slug to a human-readable label.
 */
export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};


export function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
