import { calculateAgeInMonths } from './ageCalculator';

export function formatChildAgeFromMonths(months: number): string {
  if (months < 12) {
    return `${months} Ay`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} Yaş`;
  }

  return `${years} Yaş, ${remainingMonths} Ay`;
}

export function formatChildAge(birthDate: string): string {
  return formatChildAgeFromMonths(calculateAgeInMonths(birthDate));
}
