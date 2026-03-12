import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { formatStartAge } from '../../utils/ageFormatter';
import type { FoodIntroductionItem } from '../../lib/types';

interface IngredientCardProps {
  item: FoodIntroductionItem;
  onPress?: () => void;
}

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Düşük Alerji', color: '#16A34A', bg: '#DCFCE7' },
  medium: { label: 'Orta Alerji', color: '#CA8A04', bg: '#FEF9C3' },
  high: { label: 'Yüksek Alerji', color: '#DC2626', bg: '#FEE2E2' },
};

export function IngredientCard({ item, onPress }: IngredientCardProps) {
  const riskKey = item.allergen_risk ?? 'low';
  const risk = RISK_CONFIG[riskKey] ?? RISK_CONFIG.low;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/ingredient/${item.id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl overflow-hidden mb-3"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row items-center p-3">
        {/* Image / placeholder */}
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: 60, height: 60, borderRadius: 12 }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View
            className="w-15 h-15 rounded-xl bg-secondary/20 items-center justify-center"
            style={{ width: 60, height: 60 }}
          >
            <Text style={{ fontSize: 28 }}>🥦</Text>
          </View>
        )}

        {/* Info */}
        <View className="ml-3 flex-1">
          <Text className="text-dark font-bold text-base" numberOfLines={1}>
            {item.food_name}
          </Text>

          {item.category ? (
            <Text className="text-gray-400 text-xs mt-0.5">{item.category}</Text>
          ) : null}

          <View className="flex-row items-center gap-2 mt-2">
            {/* Start age badge */}
            {item.recommended_age_months ? (
              <View className="bg-primary/10 rounded-full px-2 py-0.5">
                <Text className="text-primary text-xs font-semibold">
                  {formatStartAge(item.recommended_age_months)}
                </Text>
              </View>
            ) : null}

            {/* Allergy risk badge */}
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: risk.bg }}
            >
              <Text className="text-xs font-semibold" style={{ color: risk.color }}>
                {risk.label}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
}
