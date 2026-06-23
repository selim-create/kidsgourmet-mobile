import { Ionicons } from '@expo/vector-icons';

/**
 * Map recipe difficulty to icon names (Ionicons).
 */
export function getDifficultyIcon(
  difficulty?: string,
): 'flash' | 'flame' | 'skull' {
  switch (difficulty) {
    case 'easy':
      return 'flash';
    case 'medium':
      return 'flame';
    case 'hard':
      return 'skull';
    default:
      return 'flash';
  }
}

/**
 * Map meal type slug to icon name.
 */
export function getMealTypeIcon(slug?: string): string {
  const map: Record<string, string> = {
    breakfast: 'sunny-outline',
    lunch: 'partly-sunny-outline',
    dinner: 'moon-outline',
    snack: 'cafe-outline',
    dessert: 'ice-cream-outline',
  };
  return map[slug ?? ''] ?? 'restaurant-outline';
}

/**
 * Map safety level to icon name.
 */
export function getSafetyIcon(
  level?: string,
): 'checkmark-circle' | 'warning' | 'close-circle' {
  switch (level) {
    case 'safe':
      return 'checkmark-circle';
    case 'caution':
      return 'warning';
    case 'avoid':
      return 'close-circle';
    default:
      return 'warning';
  }
}

/**
 * Known FontAwesome class → Ionicons glyph mappings used by circle icons.
 * The API returns FA class strings (e.g. 'fa-heart') for circle icons;
 * we map these to the Ionicons equivalents supported in React Native.
 */
const FA_TO_IONICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'fa-question': 'help-circle-outline',
  'fa-heart': 'heart-outline',
  'fa-utensils': 'restaurant-outline',
  'fa-baby': 'happy-outline',
  'fa-comments': 'chatbubbles-outline',
};

/**
 * Map a FontAwesome class string to an Ionicons glyph name.
 * Falls back to 'pricetag-outline' for unknown icons.
 */
export function faToIonicon(faClass: string): keyof typeof Ionicons.glyphMap {
  return FA_TO_IONICON_MAP[faClass] ?? 'pricetag-outline';
}
