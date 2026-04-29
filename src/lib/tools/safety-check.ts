/**
 * src/lib/tools/safety-check.ts
 *
 * Pure TypeScript business logic for the "Bu Gıda Verilir mi?" tool.
 * No React / RN imports — fully testable in isolation.
 */

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { SafetyCheckResult } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SafetyLevel = 'safe' | 'caution' | 'avoid';

export interface SafetyLevelConfig {
  level: SafetyLevel;
  /** Card background colour */
  bg: string;
  /** Border / accent colour */
  border: string;
  /** Primary text colour */
  text: string;
  /** Ionicons icon name */
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Human-readable label with emoji */
  label: string;
  /** Short badge text (no emoji) */
  badge: string;
}

// ─── Configuration ────────────────────────────────────────────────────────────

/** Display configuration for each safety level (mirrors web colour scheme). */
export const SAFETY_CONFIGS: Record<SafetyLevel, SafetyLevelConfig> = {
  safe: {
    level: 'safe',
    bg: '#ECFDF5',
    border: '#059669',
    text: '#065F46',
    icon: 'checkmark-circle',
    label: 'Verilir ✅',
    badge: 'Güvenli',
  },
  caution: {
    level: 'caution',
    bg: '#FFFBEB',
    border: '#D97706',
    text: '#92400E',
    icon: 'warning',
    label: 'Dikkatli Ol ⚠️',
    badge: 'Dikkatli',
  },
  avoid: {
    level: 'avoid',
    bg: '#FEF2F2',
    border: '#DC2626',
    text: '#991B1B',
    icon: 'close-circle',
    label: 'Verilmez ❌',
    badge: 'Kaçın',
  },
};

// ─── Core Logic ───────────────────────────────────────────────────────────────

/**
 * Determines the safety level from an API `SafetyCheckResult`.
 *
 * Decision rules (mirrors web page logic):
 *  - **avoid**:   `is_safe` is false AND at least one alert is `high` or `critical`
 *  - **safe**:    `is_safe` is true AND no `high`/`critical` alerts present
 *  - **caution**: all other cases
 *    (e.g. `is_safe` false with only low/medium alerts, or `is_safe` true
 *     but backend added informational high-severity flags)
 */
export function getSafetyLevel(result: SafetyCheckResult): SafetyLevel {
  const hasHighSeverity =
    result.alerts?.some((a) => a.severity === 'high' || a.severity === 'critical') ?? false;

  if (!result.is_safe && hasHighSeverity) return 'avoid';
  if (result.is_safe && !hasHighSeverity) return 'safe';
  return 'caution';
}

/**
 * Returns the display config for a given API result.
 * Returns `null` when no result has been fetched yet.
 */
export function getSafetyConfig(result: SafetyCheckResult | null): SafetyLevelConfig | null {
  if (!result) return null;
  return SAFETY_CONFIGS[getSafetyLevel(result)];
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates the user's food query input.
 * Returns an error message string if invalid, or `null` if valid.
 */
export function validateFoodQuery(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return 'Lütfen bir gıda adı girin.';
  if (trimmed.length < 2) return 'Gıda adı en az 2 karakter olmalıdır.';
  if (trimmed.length > 100) return 'Gıda adı çok uzun (en fazla 100 karakter).';
  return null;
}

// ─── Message Catalogue ────────────────────────────────────────────────────────

/** Generic fallback error message shown when the API call fails. */
export const MSG_API_ERROR =
  'Kontrol sırasında bir hata oluştu. Lütfen tekrar deneyin.';

/** Warning shown when no active child profile is selected. */
export const MSG_NO_CHILD =
  'Daha doğru sonuçlar için Profil sekmesinden çocuk ekleyin.';

/** Disclaimer / information text shown below the results. */
export const DISCLAIMER_TITLE = '⚠️ Önemli Uyarı';

export const DISCLAIMER_LINES = [
  'Bu araç yalnızca genel bilgi amaçlıdır ve tıbbi tavsiye yerine geçmez.',
  'Her çocuğun gelişimi ve alerjik durumu farklıdır; pediatristinize veya diyetisyeninize danışmadan kesin karar vermeyin.',
  'Yeni bir gıdayı ilk kez tanıtırken küçük miktarlarla başlayın ve 3-5 gün bekleyerek olası reaksiyonları gözlemleyin.',
];

/** Source / reference note text. */
export const REFERENCE_NOTE =
  'Veriler Dünya Sağlık Örgütü (WHO), Amerikan Pediatri Akademisi (AAP) ve Türk Pediatri Derneği kılavuzlarına dayanmaktadır.';
