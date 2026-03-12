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
