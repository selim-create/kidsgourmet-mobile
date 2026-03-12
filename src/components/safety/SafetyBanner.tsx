import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SafetyCheck } from '../../lib/types';

interface SafetyBannerProps {
  safetyData: SafetyCheck | SafetyCheck[] | null | undefined;
  isLoading?: boolean;
}

const LEVEL_CONFIG = {
  safe: {
    icon: 'checkmark-circle' as const,
    iconColor: '#16A34A',
    bg: '#DCFCE7',
    border: '#86EFAC',
    title: 'Bu tarif güvenli',
    textColor: '#15803D',
  },
  caution: {
    icon: 'warning' as const,
    iconColor: '#CA8A04',
    bg: '#FEF9C3',
    border: '#FDE047',
    title: 'Dikkat gerekiyor',
    textColor: '#A16207',
  },
  avoid: {
    icon: 'close-circle' as const,
    iconColor: '#DC2626',
    bg: '#FEE2E2',
    border: '#FCA5A5',
    title: 'Uygun değil',
    textColor: '#B91C1C',
  },
};

/** Derive an overall safety level from one or more SafetyCheck results */
function getOverallLevel(
  data: SafetyCheck | SafetyCheck[],
): 'safe' | 'caution' | 'avoid' {
  const items = Array.isArray(data) ? data : [data];
  if (items.some((i) => i.safety_level === 'avoid')) return 'avoid';
  if (items.some((i) => i.safety_level === 'caution')) return 'caution';
  return 'safe';
}

export function SafetyBanner({ safetyData, isLoading }: SafetyBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <View className="bg-gray-50 rounded-2xl p-4 mb-4 flex-row items-center">
        <Ionicons name="shield-outline" size={20} color="#9CA3AF" />
        <Text className="text-gray-400 text-sm ml-2">Güvenlik kontrolü yapılıyor...</Text>
      </View>
    );
  }

  if (!safetyData) return null;

  const level = getOverallLevel(safetyData);
  const config = LEVEL_CONFIG[level];
  const items = Array.isArray(safetyData) ? safetyData : [safetyData];
  const hasDetails =
    items.some((i) => i.notes) || items.some((i) => i.alternatives?.length);
  const emoji = level === 'safe' ? '✅' : level === 'caution' ? '⚠️' : '🚫';

  return (
    <View
      className="rounded-2xl p-4 mb-4"
      style={{ backgroundColor: config.bg, borderWidth: 1, borderColor: config.border }}
    >
      {/* Header row */}
      <TouchableOpacity
        className="flex-row items-center justify-between"
        activeOpacity={hasDetails ? 0.7 : 1}
        onPress={() => hasDetails && setExpanded((v) => !v)}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name={config.icon} size={22} color={config.iconColor} />
          <Text className="font-bold text-sm ml-2" style={{ color: config.textColor }}>
            {emoji} {config.title}
          </Text>
        </View>
        {hasDetails && (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={config.iconColor}
          />
        )}
      </TouchableOpacity>

      {/* Expanded details */}
      {expanded && hasDetails && (
        <View className="mt-3 border-t pt-3" style={{ borderColor: config.border }}>
          {items
            .filter((i) => i.notes || (i.alternatives?.length ?? 0) > 0)
            .map((item, idx) => (
              <View key={idx} className="mb-2">
                <Text className="font-semibold text-xs mb-0.5" style={{ color: config.textColor }}>
                  {item.ingredient}
                </Text>
                {item.notes ? (
                  <Text className="text-xs" style={{ color: config.textColor }}>
                    {item.notes}
                  </Text>
                ) : null}
                {item.alternatives && item.alternatives.length > 0 && (
                  <Text className="text-xs mt-0.5" style={{ color: config.textColor }}>
                    Alternatif: {item.alternatives.join(', ')}
                  </Text>
                )}
              </View>
            ))}
        </View>
      )}
    </View>
  );
}
