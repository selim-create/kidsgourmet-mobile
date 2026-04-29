import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import useSWR from 'swr';
import { getIngredientBySlug } from '../../src/services/ingredient-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { DetailHeader } from '../../src/components/ui/DetailHeader';
import { COLORS } from '../../src/lib/constants';

export default function IngredientBySlugScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: ingredient, isLoading, error } = useSWR(
    slug ? `ingredient-slug-${slug}` : null,
    () => getIngredientBySlug(slug!),
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Malzeme yükleniyor..." />;
  }

  if (error || !ingredient) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Ionicons name="nutrition-outline" size={48} color="#9CA3AF" />
        <Text style={{ color: '#374151', fontWeight: '700', fontSize: 18, marginTop: 16 }}>
          Malzeme bulunamadı
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Safely access ingredient fields (API may return extra fields)
  const ing = ingredient as typeof ingredient & {
    description?: string;
    image?: string;
    category?: string;
    allergens?: string[];
    age_suitability?: string;
    min_age_months?: number;
    alternatives?: string[];
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
    };
    recipes?: { id: number; slug: string; title: string; featured_image?: string }[];
  };

  const nutritionRows = ing.nutrition
    ? [
        { label: 'Kalori', value: ing.nutrition.calories, unit: 'kcal' },
        { label: 'Protein', value: ing.nutrition.protein, unit: 'g' },
        { label: 'Karbonhidrat', value: ing.nutrition.carbs, unit: 'g' },
        { label: 'Yağ', value: ing.nutrition.fat, unit: 'g' },
        { label: 'Lif', value: ing.nutrition.fiber, unit: 'g' },
      ].filter((n) => n.value !== undefined && n.value !== null && n.value !== 0)
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero image */}
        {ing.image ? (
          <Image
            source={{ uri: ing.image }}
            style={{ width: '100%', height: 240 }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View style={{ width: '100%', height: 200, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 64 }}>🥦</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          {/* Category badge */}
          {ing.category ? (
            <View style={{ backgroundColor: '#FFF3EE', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 }}>
              <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>{ing.category}</Text>
            </View>
          ) : null}

          {/* Name */}
          <Text style={{ fontSize: 24, fontWeight: '800', color: COLORS.dark, marginBottom: 12 }}>
            {ing.name}
          </Text>

          {/* Description */}
          {ing.description ? (
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 16 }}>
              {ing.description}
            </Text>
          ) : null}

          {/* Age suitability */}
          {(ing.age_suitability ?? ing.min_age_months) ? (
            <Card style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.dark }}>Yaş Uygunluğu</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                {ing.age_suitability ?? `${ing.min_age_months}. aydan itibaren`}
              </Text>
            </Card>
          ) : null}

          {/* Allergens */}
          {ing.allergens && ing.allergens.length > 0 ? (
            <Card style={{ marginBottom: 16, backgroundColor: '#FFFBE6', borderWidth: 1, borderColor: '#FDE68A' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="warning-outline" size={18} color="#D97706" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#D97706' }}>Alerjen Bilgisi</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {ing.allergens.map((a, idx) => (
                  <View key={idx} style={{ backgroundColor: '#FDE68A', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '600' }}>{a}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          {/* Alternatives */}
          {ing.alternatives && ing.alternatives.length > 0 ? (
            <Card style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="swap-horizontal-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.dark }}>Alternatifler</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22 }}>
                {ing.alternatives.join(', ')}
              </Text>
            </Card>
          ) : null}

          {/* Nutrition */}
          {nutritionRows.length > 0 ? (
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 12 }}>
                Besin Değerleri (100g)
              </Text>
              {nutritionRows.map((n, idx) => (
                <View
                  key={n.label}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 8,
                    borderBottomWidth: idx < nutritionRows.length - 1 ? 1 : 0,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>{n.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.dark }}>
                    {n.value} {n.unit}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}

          {/* Recipes using this ingredient */}
          {ing.recipes && ing.recipes.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 12 }}>
                Bu Malzemeyi İçeren Tarifler
              </Text>
              {ing.recipes.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/(tabs)/recipes/${r.slug}` as never)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {r.featured_image ? (
                    <Image
                      source={{ uri: r.featured_image }}
                      style={{ width: 60, height: 60, borderRadius: 10 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="restaurant-outline" size={24} color="#D1D5DB" />
                    </View>
                  )}
                  <Text style={{ flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600', color: COLORS.dark }} numberOfLines={2}>
                    {r.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <DetailHeader transparent />
    </View>
  );
}
