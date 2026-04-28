/**
 * Strip HTML tags from a string (replacement for DOMPurify in React Native).
 * Handles null, undefined, and non-string values safely.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return '';
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
 * Age group color map — pastel colors matching the web RecipeCard design.
 * Keys are substrings found in the full age group name or slug.
 */
export const AGE_GROUP_COLORS: { [key: string]: string } = {
  '0-6':   '#E1BEE7',  // Lila       – 0-6 Ay / Hazırlık
  '6-8':   '#FFCCBC',  // Şeftali    – 6-8 Ay / Tadım
  '9-11':  '#C8E6C9',  // Nane Yeşili – 9-11 Ay / Keşif
  '12-24': '#B3E5FC',  // Gökyüzü Mavisi – 12-24 Ay / Aile
  '2+':    '#FFF9C4',  // Limon Sarısı – 2+ Yaş / Gurme
};

/**
 * Return the background color for a given age group name or slug.
 * Checks the full string for known substrings (web-compatible).
 * Falls back to the API-provided color, then a default green.
 */
export function getAgeGroupColor(ageGroup?: string, apiColor?: string | null, fallback?: string): string {
  if (apiColor) return apiColor;
  if (!ageGroup) return fallback ?? '#22C55E';
  if (ageGroup.includes('0-6')) return AGE_GROUP_COLORS['0-6'];
  if (ageGroup.includes('6-8')) return AGE_GROUP_COLORS['6-8'];
  if (ageGroup.includes('9-11')) return AGE_GROUP_COLORS['9-11'];
  if (ageGroup.includes('12-24')) return AGE_GROUP_COLORS['12-24'];
  if (ageGroup.includes('2+') || /\(24\+?\s*(Ay|yaş)/i.test(ageGroup)) return AGE_GROUP_COLORS['2+'];
  return fallback ?? '#22C55E';
}

/**
 * Return the text color for a given age group name (light or dark depending on background).
 */
export function getAgeGroupTextColor(ageGroup?: string): string {
  if (!ageGroup) return '#FFFFFF';
  if (
    ageGroup.includes('2+') ||
    /\(24\+?\s*(Ay|yaş)/i.test(ageGroup) ||
    ageGroup.toLowerCase().includes('gurme')
  ) {
    return '#92400E'; // Amber-800 (on yellow background)
  }
  if (ageGroup.includes('9-11') || ageGroup.toLowerCase().includes('keşif')) {
    return '#166534'; // Green-800 (on mint background)
  }
  return '#FFFFFF';
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

/**
 * Extract the text content from an instruction step, checking multiple
 * field names that different API versions may return.
 */
export function getInstructionContent(step: {
  content?: string;
  text?: string;
  description?: string;
  instruction?: string;
}): string {
  return step.content ?? step.text ?? step.description ?? step.instruction ?? '';
}
