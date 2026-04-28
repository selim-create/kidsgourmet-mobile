import { Linking } from 'react-native';
import { router } from 'expo-router';
import type { FeaturedItem } from '../services/featured-service';

/**
 * Handles a tap on a sponsor/featured card.
 *
 * - `direct_redirect === true / 'yes' / 'evet'` → opens the sponsor's external URL in the browser.
 * - Any other value (false, 'no', 'hayır', unset) or missing sponsor_url → navigates to the
 *   post detail page using the item's slug.
 */
export function handleSponsorPress(item: FeaturedItem): void {
  const dr = item.meta.direct_redirect;
  const isDirectRedirect =
    dr === true ||
    dr === 'yes' ||
    dr === 'evet';

  if (isDirectRedirect && item.meta.sponsor_url) {
    Linking.openURL(item.meta.sponsor_url).catch(() => {/* ignore */});
  } else {
    router.push(`/blog/${item.slug}`);
  }
}
