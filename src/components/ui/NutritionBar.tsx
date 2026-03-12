import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../lib/constants';

interface NutritionBarProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
  emoji?: string;
}

export function NutritionBar({
  label,
  value,
  max,
  unit = 'g',
  color = COLORS.primary,
  emoji,
}: NutritionBarProps) {
  const pct = max && max > 0 ? Math.min(100, Math.round((value / max) * 100)) : null;

  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 12, color: '#6B7280' }}>
          {emoji ? `${emoji} ` : ''}{label}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
          {value}{unit}{max ? ` / ${max}${unit}` : ''}
        </Text>
      </View>
      {pct !== null ? (
        <View style={{ height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
          <View
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: 3,
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
