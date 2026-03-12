/**
 * Calculate age in months from a birth date string.
 */
export function calculateAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  return Math.max(0, months);
}

/**
 * Calculate age in years from a birth date string.
 */
export function calculateAgeInYears(birthDate: string): number {
  return Math.floor(calculateAgeInMonths(birthDate) / 12);
}

/**
 * Check if a child is within a specific age range (in months).
 */
export function isInAgeRange(
  birthDate: string,
  minMonths: number,
  maxMonths: number,
): boolean {
  const ageMonths = calculateAgeInMonths(birthDate);
  return ageMonths >= minMonths && ageMonths <= maxMonths;
}
