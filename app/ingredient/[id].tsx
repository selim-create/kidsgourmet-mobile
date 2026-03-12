import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import useSWR from 'swr';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFoodIntroductionItems } from '../../src/services/food-introduction-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { COLORS, API_ENDPOINTS } from '../../src/lib/constants';
import { formatStartAge } from '../../src/utils/ageFormatter';
import type { FoodIntroductionItem } from '../../src/lib/types';

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Düşük Alerji Riski', color: '#16A34A', bg: '#DCFCE7' },
  medium: { label: 'Orta Alerji Riski', color: '#CA8A04', bg: '#FEF9C3' },
  high: { label: 'Yüksek Alerji Riski', color: '#DC2626', bg: '#FEE2E2' },
};

export default function IngredientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch all items and find the one with matching id
  const { data: items, isLoading } = useSWR<FoodIntroductionItem[]>(
    API_ENDPOINTS.FOOD_INTRODUCTION,
    () => getFoodIntroductionItems(),
  );

  const item = items?.find((i) => String(i.id) === String(id));

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Yükleniyor..." />;
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-light">
        <Text className="text-gray-500">Malzeme bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-medium">← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const riskKey = item.allergen_risk ?? 'low';
  const risk = RISK_CONFIG[riskKey] ?? RISK_CONFIG.low;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-light">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="relative">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={{ width: '100%', height: 240 }}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
          ) : (
            <View
              className="w-full items-center justify-center bg-secondary/20"
              style={{ height: 200 }}
            >
              <Text style={{ fontSize: 64 }}>🥦</Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
          </TouchableOpacity>
        </View>

        <View className="px-4 pt-5 pb-10">
          {/* Category badge */}
          {item.category && (
            <Badge variant="secondary" size="sm" className="mb-2 self-start">
              {item.category}
            </Badge>
          )}

          {/* Name */}
          <Text className="text-dark text-2xl font-bold mb-4">{item.food_name}</Text>

          {/* Info cards */}
          <View className="flex-row gap-3 mb-4">
            {/* Start age card */}
            <Card className="flex-1" padding="sm">
              <View className="items-center">
                <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
                <Text className="text-dark font-bold text-sm mt-1 text-center">
                  Başlangıç Yaşı
                </Text>
                <Text className="text-primary font-semibold text-xs mt-0.5 text-center">
                  {item.recommended_age_months
                    ? formatStartAge(item.recommended_age_months)
                    : 'Belirtilmemiş'}
                </Text>
              </View>
            </Card>

            {/* Allergen risk card */}
            <Card className="flex-1" padding="sm">
              <View className="items-center">
                <Ionicons name="shield-outline" size={24} color={risk.color} />
                <Text className="text-dark font-bold text-sm mt-1 text-center">
                  Alerji Riski
                </Text>
                <Text
                  className="font-semibold text-xs mt-0.5 text-center"
                  style={{ color: risk.color }}
                >
                  {risk.label}
                </Text>
              </View>
            </Card>
          </View>

          {/* Allergen risk detail */}
          <View
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: risk.bg }}
          >
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={18} color={risk.color} />
              <Text className="font-semibold text-sm ml-2" style={{ color: risk.color }}>
                {risk.label}
              </Text>
            </View>
            <Text className="text-xs mt-1" style={{ color: risk.color }}>
              {riskKey === 'low'
                ? 'Bu besin genellikle bebeklerde düşük alerji riski taşır.'
                : riskKey === 'medium'
                ? 'Bu besin orta düzeyde alerji riski taşıyabilir. İlk verilişte dikkatli olun.'
                : 'Bu besin yüksek alerji riski taşır. Doktorunuza danışarak verin.'}
            </Text>
          </View>

          {/* Introduction method */}
          {item.introduction_method && (
            <Card className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="restaurant-outline" size={18} color={COLORS.primary} />
                <Text className="text-dark font-bold text-base ml-2">Nasıl Verilir?</Text>
              </View>
              <Text className="text-gray-500 text-sm leading-6">
                {item.introduction_method}
              </Text>
            </Card>
          )}

          {/* Notes */}
          {item.notes && (
            <Card>
              <View className="flex-row items-center mb-2">
                <Ionicons name="bulb-outline" size={18} color="#CA8A04" />
                <Text className="text-dark font-bold text-base ml-2">İpuçları</Text>
              </View>
              <Text className="text-gray-500 text-sm leading-6">{item.notes}</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
