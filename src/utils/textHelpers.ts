import { stripHtml, truncate } from './helpers';

/**
 * Clean and truncate HTML content for display.
 */
export function cleanExcerpt(html: string, maxLength = 150): string {
  return truncate(stripHtml(html), maxLength);
}

/**
 * Normalize whitespace in a string.
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Convert a slug to a human-readable title.
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert a title to a slug.
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
