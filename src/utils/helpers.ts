export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

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


/**
 * Formats a comment date into a Turkish-readable string.
 * Returns empty string if invalid/missing.
 * Accepts both ISO strings and WP "YYYY-MM-DD HH:MM:SS" format.
 */
export function formatCommentDate(input?: string | null): string {
  if (!input) return '';
  // WP returns "2026-04-29 10:15:00" — convert space to 'T' and append 'Z' if needed
  const normalized = /^\d{4}-\d{2}-\d{2} /.test(input)
    ? input.replace(' ', 'T') + 'Z'
    : input;
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

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

/**
 * Format a date string as a relative time string in Turkish.
 * e.g. "2 dakika önce", "3 saat önce", "dün", "5 gün önce"
 *
 * Month and year thresholds use approximate values (30 days/month,
 * 365 days/year) which is sufficient for human-readable relative times.
 */
export function formatRelativeTime(input?: string | null): string {
  if (!input) return '';
  const normalized = /^\d{4}-\d{2}-\d{2} /.test(input)
    ? input.replace(' ', 'T') + 'Z'
    : input;
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'az önce';
  if (diffMin < 60) return `${diffMin} dakika önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay === 1) return 'dün';
  if (diffDay < 7) return `${diffDay} gün önce`;
  if (diffWeek < 5) return `${diffWeek} hafta önce`;
  if (diffMonth < 12) return `${diffMonth} ay önce`;
  return `${diffYear} yıl önce`;
}

/**
 * Decode common HTML entities in a string.
 * &amp; is decoded last to prevent double-unescaping.
 */
export function decodeHtmlEntities(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&'); // must be last to prevent double-unescaping
}

/**
 * Ensure a discussion object has all required default values.
 */
export function ensureDiscussionDefaults<T extends {
  comment_count?: number;
  answer_count?: number;
  vote_count?: number;
  upvote_count?: number;
  downvote_count?: number;
  user_vote?: 'up' | 'down' | null;
  is_favorite?: boolean;
  tags?: string[];
}>(discussion: T): T {
  return {
    ...discussion,
    comment_count: discussion.comment_count ?? discussion.answer_count ?? 0,
    answer_count: discussion.answer_count ?? discussion.comment_count ?? 0,
    vote_count: discussion.vote_count ?? 0,
    upvote_count: discussion.upvote_count ?? 0,
    downvote_count: discussion.downvote_count ?? 0,
    user_vote: discussion.user_vote ?? null,
    is_favorite: discussion.is_favorite ?? false,
    tags: discussion.tags ?? [],
  };
}

/**
 * Ensure a discussion comment object has all required default values.
 */
export function ensureCommentDefaults<T extends {
  parent_id?: number | null;
  vote_count?: number;
  upvote_count?: number;
  downvote_count?: number;
  user_vote?: 'up' | 'down' | null;
  replies?: unknown[];
  is_expert_comment?: boolean;
  is_expert_answer?: boolean;
}>(comment: T): T {
  return {
    ...comment,
    parent_id: comment.parent_id ?? null,
    vote_count: comment.vote_count ?? 0,
    upvote_count: comment.upvote_count ?? 0,
    downvote_count: comment.downvote_count ?? 0,
    user_vote: comment.user_vote ?? null,
    replies: comment.replies ?? [],
    is_expert_comment: comment.is_expert_comment ?? comment.is_expert_answer ?? false,
  };
}
