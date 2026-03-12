import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { useDashboardRecommendations } from '../../src/hooks/useDashboardRecommendations';
import { useMealPlan } from '../../src/hooks/useMealPlan';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { formatAge } from '../../src/utils/ageFormatter';
import { formatDuration } from '../../src/utils/helpers';
import { useSWRConfig } from 'swr';
import type { Recipe } from '../../src/lib/types';

function GuestDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-light">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-primary px-5 pt-4 pb-10 items-center">
          <Text className="text-white text-4xl font-bold mb-2">🥗</Text>
          <Text className="text-white text-2xl font-bold">KidsGourmet</Text>
          <Text className="text-white/80 text-sm mt-1 text-center">
            Çocuğunuz için en sağlıklı tarifler
          </Text>
        </View>

        <View className="px-4 -mt-4">
          <Card className="mb-4 items-center py-6">
            <Ionicons name="leaf-outline" size={40} color="#FF8A65" />
            <Text className="text-dark text-lg font-bold mt-3 mb-1">
              Hoş Geldiniz! 👋
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              Hesap oluşturarak kişiselleştirilmiş öneriler, haftalık planlar ve daha fazlasına erişin.
            </Text>
            <Button onPress={() => router.push('/(auth)/login')} className="w-full">
              Giriş Yap
            </Button>
            <TouchableOpacity
              className="mt-3"
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text className="text-primary text-sm font-medium">
                Hesap Oluştur →
              </Text>
            </TouchableOpacity>
          </Card>

          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/recipes')}
              style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }}
            >
              <Ionicons name="restaurant-outline" size={24} color="#FF8A65" />
              <Text className="text-dark font-semibold text-sm mt-2">Tarifler</Text>
              <Text className="text-gray-400 text-xs text-center mt-1">
                Yüzlerce sağlıklı tarif
              </Text>
            </TouchableOpacity>
            <View
              className="flex-1 bg-white rounded-2xl p-4 items-center opacity-50"
              style={{ elevation: 2 }}
            >
              <Ionicons name="calendar-outline" size={24} color="#7CB342" />
              <Text className="text-dark font-semibold text-sm mt-2">Haftalık Plan</Text>
              <Text className="text-gray-400 text-xs text-center mt-1">
                Giriş gerektirir
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MINI_CARD_WIDTH = 160;

function RecipeMiniCard({ recipe }: { recipe: Recipe }) {
  const totalTime = recipe.total_time ?? (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);
  const primaryAgeGroup = recipe.age_groups?.[0];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(tabs)/recipes/${recipe.slug}`)}
      className="bg-white rounded-2xl overflow-hidden mr-3"
      style={{
        width: MINI_CARD_WIDTH,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      }}
    >
      <View className="relative">
        <Image
          source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
          style={{ width: MINI_CARD_WIDTH, height: 110 }}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        {primaryAgeGroup ? (
          <View
            className="absolute top-2 left-2 rounded-full px-2 py-0.5"
            style={{ backgroundColor: primaryAgeGroup.color ?? '#FF8A65' }}
          >
            <Text className="text-white font-medium" style={{ fontSize: 10 }}>
              {primaryAgeGroup.name}
            </Text>
          </View>
        ) : null}
        {totalTime > 0 ? (
          <View
            className="absolute bottom-2 right-2 flex-row items-center rounded-full px-2 py-0.5"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Ionicons name="time-outline" size={10} color="#fff" />
            <Text className="text-white font-medium ml-0.5" style={{ fontSize: 10 }}>
              {formatDuration(totalTime)}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="p-2.5">
        <Text className="text-dark font-bold text-sm" numberOfLines={2}>
          {recipe.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeChild } = useActiveChild();
  const { recommendations, isLoading: loadingRecs } = useDashboardRecommendations();
  const { mealPlan, isLoading: loadingPlan } = useMealPlan();
  const { mutate } = useSWRConfig();

  const [refreshing, setRefreshing] = React.useState(false);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Yükleniyor..." />;
  }

  if (!isAuthenticated) {
    return <GuestDashboard />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await mutate(() => true, undefined, { revalidate: true });
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 17) return 'İyi öğleden sonralar';
    return 'İyi akşamlar';
  };

  const totalMeals =
    mealPlan?.days.reduce((acc, d) => acc + d.meals.length, 0) ?? 0;
  const completedMeals =
    mealPlan?.days.reduce(
      (acc, d) => acc + d.meals.filter((m) => m.is_completed).length,
      0,
    ) ?? 0;
  const completionRate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-light">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF8A65" />
        }
      >
        <View className="bg-primary px-5 pt-4 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white/80 text-sm">
                {greeting()},
              </Text>
              <Text className="text-white text-xl font-bold">
                {user?.name ?? 'Kullanıcı'}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')}>
              <Avatar uri={user?.avatar_url} name={user?.name} size={44} />
            </TouchableOpacity>
          </View>

          {activeChild ? (
            <View className="bg-white/20 rounded-2xl p-3 flex-row items-center">
              <Avatar uri={activeChild.avatar_url} name={activeChild.name} size={36} />
              <View className="ml-3 flex-1">
                <Text className="text-white font-semibold">{activeChild.name}</Text>
                <Text className="text-white/70 text-xs">
                  {formatAge(activeChild.birth_date)}
                </Text>
              </View>
              <Badge variant="secondary" size="sm">Aktif Profil</Badge>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-white/20 rounded-2xl p-3 flex-row items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View className="w-9 h-9 rounded-full bg-white/30 items-center justify-center">
                <Ionicons name="add" size={20} color="#fff" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-white font-semibold">Çocuk profili ekle</Text>
                <Text className="text-white/70 text-xs">Kişiselleştirilmiş öneriler için</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View className="px-4 -mt-4">
          <View className="flex-row gap-3 mb-6">
            <Card className="flex-1" padding="sm">
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={16} color="#FF8A65" />
                <Text className="text-dark font-semibold text-sm ml-1.5">Haftalık Plan</Text>
              </View>
              {loadingPlan ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Text className="text-2xl font-bold text-dark">%{completionRate}</Text>
                  <Text className="text-gray-400 text-xs">
                    {completedMeals}/{totalMeals} öğün tamamlandı
                  </Text>
                </>
              )}
            </Card>

            <TouchableOpacity
              className="flex-1 bg-secondary/20 rounded-2xl p-3"
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/favorites')}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="heart-outline" size={16} color="#7CB342" />
                <Text className="text-dark font-semibold text-sm ml-1.5">Favoriler</Text>
              </View>
              <Text className="text-2xl font-bold text-dark">❤️</Text>
              <Text className="text-gray-400 text-xs">Kaydettiğin tarifler</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-dark text-lg font-bold">Önerilen Tarifler</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/recipes')}>
                <Text className="text-primary text-sm font-medium">Tümünü Gör</Text>
              </TouchableOpacity>
            </View>

            {loadingRecs ? (
              <LoadingSpinner label="Tarifler yükleniyor..." />
            ) : recommendations.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 4 }}
              >
                {recommendations.slice(0, 8).map((recipe) => (
                  <RecipeMiniCard key={recipe.id} recipe={recipe} />
                ))}
              </ScrollView>
            ) : (
              <Card>
                <View className="items-center py-4">
                  <Ionicons name="restaurant-outline" size={32} color="#D1D5DB" />
                  <Text className="text-gray-400 text-center mt-2">
                    Öneri için çocuk profili ekleyin
                  </Text>
                  <TouchableOpacity
                    className="mt-2"
                    activeOpacity={0.8}
                    onPress={() => router.push('/(tabs)/profile')}
                  >
                    <Text className="text-primary font-medium">Profil Ekle →</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
