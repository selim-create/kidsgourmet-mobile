import { calculateAgeInMonths } from './ageCalculator';

/**
 * Format age in a human-readable Turkish string.
 * E.g. "2 yaş 3 ay", "8 ay", "3 yaş"
 */
export function formatAge(birthDate: string): string {
  const months = calculateAgeInMonths(birthDate);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} ay`;
  }
  if (remainingMonths === 0) {
    return `${years} yaş`;
  }
  return `${years} yaş ${remainingMonths} ay`;
}

/**
 * Format age group label from min/max age in months.
 */
export function formatAgeGroup(minMonths?: number, maxMonths?: number): string {
  if (minMonths === undefined && maxMonths === undefined) return 'Her Yaş';

  const formatMonths = (m: number) => {
    if (m < 12) return `${m} ay`;
    const years = Math.floor(m / 12);
    return `${years} yaş`;
  };

  if (minMonths !== undefined && maxMonths !== undefined) {
    return `${formatMonths(minMonths)} - ${formatMonths(maxMonths)}`;
  }
  if (minMonths !== undefined) {
    return `${formatMonths(minMonths)}+`;
  }
  return `${formatMonths(maxMonths!)} altı`;
}
