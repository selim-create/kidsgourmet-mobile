import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import useSWR from 'swr';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRecipe } from '../../../src/services/recipe-service';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { SafetyBanner } from '../../../src/components/safety/SafetyBanner';
import { useFavorites } from '../../../src/contexts/FavoritesContext';
import { useRecipeSafetyCheck } from '../../../src/hooks/useSafetyCheck';
import { formatDuration } from '../../../src/utils/helpers';
import { API_ENDPOINTS } from '../../../src/lib/constants';
import type { SafetyCheck } from '../../../src/lib/types';

export default function RecipeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isFavorite, toggle } = useFavorites();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');

  const { data: recipe, isLoading } = useSWR(
    slug ? API_ENDPOINTS.RECIPE(slug) : null,
    () => getRecipe(slug!),
  );

  const { safetyChecks, ageGroupSafe, isLoading: safetyLoading, hasActiveChild } =
    useRecipeSafetyCheck(recipe);

  const favorite = recipe ? isFavorite(recipe.id) : false;

  const handleShare = async () => {
    if (!recipe) return;
    await Share.share({
      title: recipe.title,
      message: `KidsGourmet'ta harika bir tarif: ${recipe.title}`,
    });
  };

  // Combine API safety checks with age-group check into a single banner datum
  const bannerData: SafetyCheck[] | null = (() => {
    if (!hasActiveChild) return null;
    const combined: SafetyCheck[] = [...safetyChecks];
    if (ageGroupSafe === false) {
      combined.push({
        ingredient: 'Yaş uygunluğu',
        age_months: 0,
        is_safe: false,
        safety_level: 'caution',
        notes: 'Bu tarif çocuğunuzun yaş grubuna uygun olmayabilir.',
      });
    }
    return combined.length > 0 ? combined : null;
  })();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Tarif yükleniyor..." />;
  }

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-light">
        <Text className="text-gray-500">Tarif bulunamadı</Text>
      </View>
    );
  }

  const totalTime =
    recipe.total_time ?? (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-light">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
            style={{ width: '100%', height: 280 }}
            contentFit="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Floating Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#455A64" />
          </TouchableOpacity>

          {/* Action Buttons Overlay */}
          <View className="absolute top-4 right-4 gap-2">
            <TouchableOpacity
              onPress={() => toggle(recipe.id)}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow"
              activeOpacity={0.8}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? '#EF4444' : '#6B7280'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow"
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 pt-4">
          {/* Age Group Badges */}
          {recipe.age_groups && recipe.age_groups.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 mb-3">
              {recipe.age_groups.map((ag) => (
                <Badge key={ag.id} variant="secondary">{ag.name}</Badge>
              ))}
            </View>
          ) : null}

          {/* Title */}
          <Text className="text-dark text-2xl font-bold mb-2">
            {recipe.title}
          </Text>

          {/* Expert Approved */}
          {recipe.is_expert_approved ? (
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={16} color="#22C55E" />
              <Text className="text-success text-sm ml-1.5 font-medium">
                Uzman Onaylı Tarif
              </Text>
            </View>
          ) : null}

          {/* Safety Banner */}
          <SafetyBanner
            safetyData={bannerData}
            isLoading={safetyLoading && hasActiveChild}
          />

          {/* Stats Row */}
          <Card className="mb-4">
            <View className="flex-row items-center justify-around">
              {recipe.prep_time ? (
                <View className="items-center">
                  <Ionicons name="cut-outline" size={20} color="#FF8A65" />
                  <Text className="text-xs text-gray-400 mt-1">Hazırlık</Text>
                  <Text className="text-dark font-semibold text-sm">
                    {formatDuration(recipe.prep_time)}
                  </Text>
                </View>
              ) : null}
              {recipe.cook_time ? (
                <View className="items-center">
                  <Ionicons name="flame-outline" size={20} color="#FF8A65" />
                  <Text className="text-xs text-gray-400 mt-1">Pişirme</Text>
                  <Text className="text-dark font-semibold text-sm">
                    {formatDuration(recipe.cook_time)}
                  </Text>
                </View>
              ) : null}
              {totalTime > 0 ? (
                <View className="items-center">
                  <Ionicons name="time-outline" size={20} color="#FF8A65" />
                  <Text className="text-xs text-gray-400 mt-1">Toplam</Text>
                  <Text className="text-dark font-semibold text-sm">
                    {formatDuration(totalTime)}
                  </Text>
                </View>
              ) : null}
              {recipe.servings ? (
                <View className="items-center">
                  <Ionicons name="people-outline" size={20} color="#FF8A65" />
                  <Text className="text-xs text-gray-400 mt-1">Porsiyon</Text>
                  <Text className="text-dark font-semibold text-sm">
                    {recipe.servings} kişilik
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>

          {/* Tabs */}
          <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
            {(['ingredients', 'steps'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg ${
                  activeTab === tab ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    activeTab === tab ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {tab === 'ingredients' ? 'Malzemeler' : 'Yapılışı'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ingredients */}
          {activeTab === 'ingredients' && (
            <View className="mb-6">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ing, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center py-3 border-b border-gray-100"
                  >
                    <View className="w-2 h-2 rounded-full bg-primary mr-3" />
                    <Text className="text-dark flex-1">
                      {ing.amount ? `${ing.amount} ${ing.unit ?? ''} ` : ''}
                      {ing.name}
                    </Text>
                    {ing.is_optional ? (
                      <Badge variant="gray" size="sm">İsteğe bağlı</Badge>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 text-center py-4">
                  Malzeme bilgisi bulunamadı
                </Text>
              )}
            </View>
          )}

          {/* Steps */}
          {activeTab === 'steps' && (
            <View className="mb-6">
              {recipe.instructions && recipe.instructions.length > 0 ? (
                recipe.instructions.map((step) => (
                  <View key={step.step} className="flex-row mb-4">
                    <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3 mt-0.5 shrink-0">
                      <Text className="text-white font-bold text-sm">
                        {step.step}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-dark leading-6">{step.content}</Text>
                      {step.image ? (
                        <Image
                          source={{ uri: step.image }}
                          style={{ width: '100%', height: 160, borderRadius: 12, marginTop: 8 }}
                          contentFit="cover"
                        />
                      ) : null}
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 text-center py-4">
                  Yapılış bilgisi bulunamadı
                </Text>
              )}
            </View>
          )}

          {/* Nutrition */}
          {recipe.nutrition ? (
            <Card className="mb-6">
              <Text className="text-dark font-bold text-base mb-3">
                Besin Değerleri
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {[
                  { label: 'Kalori', value: recipe.nutrition.calories, unit: 'kcal' },
                  { label: 'Protein', value: recipe.nutrition.protein, unit: 'g' },
                  { label: 'Karbonhidrat', value: recipe.nutrition.carbs, unit: 'g' },
                  { label: 'Yağ', value: recipe.nutrition.fat, unit: 'g' },
                  { label: 'Lif', value: recipe.nutrition.fiber, unit: 'g' },
                ]
                  .filter((n) => n.value !== undefined)
                  .map((n) => (
                    <View
                      key={n.label}
                      className="bg-light rounded-xl px-3 py-2 items-center min-w-16"
                    >
                      <Text className="text-dark font-bold text-lg">
                        {n.value}
                      </Text>
                      <Text className="text-gray-400 text-xs">{n.unit}</Text>
                      <Text className="text-gray-500 text-xs">{n.label}</Text>
                    </View>
                  ))}
              </View>
            </Card>
          ) : null}

          {/* Add to Meal Plan */}
          <Button
            variant="outline"
            className="mb-8"
            onPress={() => {
              // TODO: Open meal plan picker modal
            }}
          >
            Haftalık Plana Ekle
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
