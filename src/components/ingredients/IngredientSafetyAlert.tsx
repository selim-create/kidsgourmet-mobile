import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IngredientGuideItem } from '../../lib/types';

interface IngredientSafetyAlertProps {
  ingredient: Pick<
    IngredientGuideItem,
    'allergy_risk' | 'allergens' | 'allergen_info'
  >;
}

function getAllergyColors(risk?: string) {
  if (risk === 'Yüksek') {
    return { bg: '#FEF2F2', border: '#FCA5A5', icon: '#DC2626', text: '#7F1D1D', badgeBg: '#FEE2E2', badgeText: '#B91C1C' };
  }
  if (risk === 'Orta') {
    return { bg: '#FFFBEB', border: '#FCD34D', icon: '#D97706', text: '#78350F', badgeBg: '#FEF3C7', badgeText: '#92400E' };
  }
  return { bg: '#F0FDF4', border: '#86EFAC', icon: '#16A34A', text: '#14532D', badgeBg: '#DCFCE7', badgeText: '#15803D' };
}

export function IngredientSafetyAlert({ ingredient }: IngredientSafetyAlertProps) {
  const { allergy_risk, allergens, allergen_info } = ingredient;

  // Only render for Yüksek or Orta risk; low risk not shown as an alert
  const shouldHighlight = allergy_risk === 'Yüksek' || allergy_risk === 'Orta';
  const colors = getAllergyColors(allergy_risk);

  const hasAllergens = Array.isArray(allergens) && allergens.length > 0;
  const hasAllergenInfo = allergen_info && typeof allergen_info === 'object';

  if (!allergy_risk && !hasAllergens && !hasAllergenInfo) return null;

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Ionicons
          name={shouldHighlight ? 'warning' : 'shield-checkmark-outline'}
          size={22}
          color={colors.icon}
          style={{ marginRight: 8 }}
        />
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 }}>
          Alerjen Bilgisi
        </Text>
        {allergy_risk ? (
          <View
            style={{
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 3,
              backgroundColor: colors.badgeBg,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.badgeText }}>
              {allergy_risk} Risk
            </Text>
          </View>
        ) : null}
      </View>

      {/* Allergen chips */}
      {hasAllergens ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: hasAllergenInfo ? 12 : 0 }}>
          {allergens!.map((a, idx) => (
            <View
              key={idx}
              style={{
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
                backgroundColor: colors.badgeBg,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.badgeText }}>
                {a}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Allergen info detail */}
      {hasAllergenInfo ? (
        <View style={{ gap: 6 }}>
          {allergen_info.notes ? (
            <Text style={{ fontSize: 13, color: colors.text, lineHeight: 20 }}>
              {allergen_info.notes}
            </Text>
          ) : null}
          {allergen_info.symptoms ? (
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
                Belirtiler:
              </Text>
              <Text style={{ fontSize: 12, color: colors.text, lineHeight: 18 }}>
                {typeof allergen_info.symptoms === 'string'
                  ? allergen_info.symptoms
                  : Array.isArray(allergen_info.symptoms)
                    ? allergen_info.symptoms.join(', ')
                    : null}
              </Text>
            </View>
          ) : null}
          {allergen_info.cross_contamination ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 }}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.icon} style={{ marginRight: 4, marginTop: 1 }} />
              <Text style={{ fontSize: 12, color: colors.text, flex: 1, lineHeight: 18 }}>
                <Text style={{ fontWeight: '700' }}>Çapraz bulaşma: </Text>
                {allergen_info.cross_contamination}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
