import { API_URL } from '../lib/constants';
import type { SponsorImage } from '../lib/types';

/**
 * Converts WordPress relative paths (e.g. /wp-content/uploads/...)
 * to absolute URLs using the API host. Absolute URLs are returned as-is.
 */
export function toAbsoluteUrl(path?: string | null): string | undefined {
  if (!path || typeof path !== 'string') return undefined;
  // Filter out literal string "null" / "undefined" / empty
  if (path === 'null' || path === 'undefined' || path.trim() === '') return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('//')) return `https:${path}`;
  if (path.startsWith('/')) {
    // API_URL is typically `https://api.kidsgourmet.com.tr/wp-json` — strip /wp-json to get the host
    const host = API_URL.replace(/\/wp-json\/?$/, '').replace(/\/$/, '');
    return `${host}${path}`;
  }
  return path;
}

/**
 * Extracts a URL string from WP ACF image fields.
 * - If a string, returns it as-is
 * - If a { url } object, returns .url
 * - Otherwise returns undefined
 * The resulting URL is prefixed with `toAbsoluteUrl`.
 */
export function extractImageUrl(value: SponsorImage | undefined | null): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return toAbsoluteUrl(value);
  if (typeof value === 'object' && typeof value.url === 'string') {
    return toAbsoluteUrl(value.url);
  }
  return undefined;
}
