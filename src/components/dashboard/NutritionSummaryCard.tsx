import React from 'react';
import { View, Text } from 'react-native';
import { Badge } from '../ui/Badge';
import { COLORS } from '../../lib/constants';
import type { NutritionSummary } from '../../lib/types';

interface NutritionBarProps {
  value: number;
  max: number;
  color?: string;
}

function NutritionBar({ value, max, color = COLORS.primary }: NutritionBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <View style={{ height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

interface NutritionSummaryCardProps {
  summary?: NutritionSummary | null;
  isLoading?: boolean;
}

export function NutritionSummaryCard({ summary, isLoading }: NutritionSummaryCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>Haftalık Beslenme</Text>
        <Badge variant="info" size="sm">Bu Hafta</Badge>
      </View>

      {isLoading ? (
        <Text style={{ color: '#9CA3AF', textAlign: 'center', paddingVertical: 8 }}>
          Yükleniyor...
        </Text>
      ) : summary ? (
        <View style={{ gap: 12 }}>
          {summary.calories_total !== undefined && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>🔥 Kalori</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
                  {summary.calories_total}
                  {summary.calories_target ? ` / ${summary.calories_target} kcal` : ' kcal'}
                </Text>
              </View>
              {summary.calories_target ? (
                <NutritionBar value={summary.calories_total} max={summary.calories_target} color={COLORS.primary} />
              ) : null}
            </View>
          )}
          {summary.protein_total !== undefined && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>🍗 Protein</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
                  {summary.protein_total}g
                </Text>
              </View>
            </View>
          )}
          {summary.carbs_total !== undefined && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>🌾 Karbonhidrat</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
                  {summary.carbs_total}g
                </Text>
              </View>
            </View>
          )}
          {summary.meals_count !== undefined && (
            <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
              Toplam {summary.meals_count} öğün kaydedildi
            </Text>
          )}
        </View>
      ) : (
        <Text style={{ color: '#9CA3AF', textAlign: 'center', paddingVertical: 8 }}>
          Haftalık öğün ekleyerek beslenme takibi yapın.
        </Text>
      )}
    </View>
  );
}
