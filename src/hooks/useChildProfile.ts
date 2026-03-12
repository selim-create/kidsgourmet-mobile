import { useMemo } from 'react';
import type { Child } from '../lib/types';

/**
 * Calculates the age in months from a birth date string.
 */
export function getAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  return Math.max(0, months);
}

/**
 * Returns a human-readable age group label based on months.
 */
export function getAgeGroupLabel(ageMonths: number): string {
  if (ageMonths < 6) return '0-6 ay';
  if (ageMonths < 9) return '6-9 ay';
  if (ageMonths < 12) return '9-12 ay';
  if (ageMonths < 18) return '12-18 ay';
  if (ageMonths < 24) return '18-24 ay';
  if (ageMonths < 36) return '2-3 yaş';
  if (ageMonths < 60) return '3-5 yaş';
  return '5+ yaş';
}

/**
 * Returns the age group slug used by the API based on age in months.
 */
export function getAgeGroupSlug(ageMonths: number): string {
  if (ageMonths < 6) return '0-6-ay';
  if (ageMonths < 9) return '6-9-ay';
  if (ageMonths < 12) return '9-12-ay';
  if (ageMonths < 18) return '12-18-ay';
  if (ageMonths < 24) return '18-24-ay';
  if (ageMonths < 36) return '2-3-yas';
  if (ageMonths < 60) return '3-5-yas';
  return '5-yas-ustu';
}

/**
 * Hook that provides computed profile information for a child.
 */
export function useChildProfile(child: Child | null) {
  const profile = useMemo(() => {
    if (!child) return null;
    const ageMonths = getAgeInMonths(child.birth_date);
    const ageGroupLabel = getAgeGroupLabel(ageMonths);
    const ageGroupSlug = getAgeGroupSlug(ageMonths);
    const hasAllergies =
      Array.isArray(child.allergies) && child.allergies.length > 0;

    return {
      child,
      ageMonths,
      ageGroupLabel,
      ageGroupSlug,
      hasAllergies,
      allergies: child.allergies ?? [],
    };
  }, [child]);

  return profile;
}
