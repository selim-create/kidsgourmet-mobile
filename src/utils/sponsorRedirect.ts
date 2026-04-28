import { Linking } from 'react-native';
import { router } from 'expo-router';
import type { FeaturedItem } from '../services/featured-service';

/**
 * Handles a tap on a sponsor/featured card.
 *
 * - `direct_redirect === true`  → opens the sponsor's external URL in the browser.
 * - `direct_redirect === false` (or unset, no sponsor_url) → navigates to the
 *   post detail page using the item's slug.
 */
export function handleSponsorPress(item: FeaturedItem): void {
  if (item.meta.direct_redirect && item.meta.sponsor_url) {
    Linking.openURL(item.meta.sponsor_url).catch(() => {/* ignore */});
  } else {
    router.push(`/blog/${item.slug}`);
  }
}
