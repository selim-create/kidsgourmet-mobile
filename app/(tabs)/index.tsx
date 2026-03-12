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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { useDashboardRecommendations } from '../../src/hooks/useDashboardRecommendations';
import { useMealPlan } from '../../src/hooks/useMealPlan';
import { RecipeCard } from '../../src/components/recipes/RecipeCard';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { formatAge } from '../../src/utils/ageFormatter';
import { useSWRConfig } from 'swr';

function GuestDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-light">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
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
              Hoş Geldiniz!
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              Kişiselleştirilmiş tarifler, haftalık planlar ve daha fazlası için giriş yapın.
            </Text>
            <Button onPress={() => router.push('/(auth)/login')} className="w-full">
              Giriş Yap
            </Button>
            <TouchableOpacity
              className="mt-3"
              onPress={() => router.push('/(auth)/register')}
            >
              <Text className="text-primary text-sm font-medium">
                Hesap Oluştur →
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Feature Highlights */}
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 items-center"
              onPress={() => router.push('/(tabs)/recipes')}
            >
              <Ionicons name="restaurant-outline" size={24} color="#FF8A65" />
              <Text className="text-dark font-semibold text-sm mt-2">Tarifler</Text>
              <Text className="text-gray-400 text-xs text-center mt-1">
                Yüzlerce sağlıklı tarif
              </Text>
            </TouchableOpacity>
            <View className="flex-1 bg-white rounded-2xl p-4 items-center opacity-50">
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

  // Calculate this week's completion
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
        {/* Header */}
        <View className="bg-primary px-5 pt-4 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white/80 text-sm">
                {greeting()},
              </Text>
              <Text className="text-white text-xl font-bold">
                {user?.name ?? 'Kullanıcı'} 👋
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Avatar
                uri={user?.avatar_url}
                name={user?.name}
                size={44}
              />
            </TouchableOpacity>
          </View>

          {/* Active Child */}
          {activeChild ? (
            <View className="bg-white/20 rounded-2xl p-3 flex-row items-center">
              <Avatar
                uri={activeChild.avatar_url}
                name={activeChild.name}
                size={36}
              />
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
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View className="w-9 h-9 rounded-full bg-white/30 items-center justify-center">
                <Ionicons name="add" size={20} color="#fff" />
              </View>
              <Text className="text-white ml-3">Çocuk profili ekle</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" className="ml-auto" />
            </TouchableOpacity>
          )}
        </View>

        <View className="px-4 -mt-4">
          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-6">
            {/* Weekly Plan Progress */}
            <Card className="flex-1" padding="sm">
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={16} color="#FF8A65" />
                <Text className="text-dark font-semibold text-sm ml-1.5">Haftalık Plan</Text>
              </View>
              {loadingPlan ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Text className="text-2xl font-bold text-dark">
                    %{completionRate}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {completedMeals}/{totalMeals} öğün tamamlandı
                  </Text>
                </>
              )}
            </Card>

            {/* Favorites Shortcut */}
            <TouchableOpacity
              className="flex-1 bg-secondary/20 rounded-2xl p-3"
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

          {/* Recommendations */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-dark text-lg font-bold">
                Önerilen Tarifler
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/recipes')}>
                <Text className="text-primary text-sm font-medium">
                  Tümünü Gör
                </Text>
              </TouchableOpacity>
            </View>

            {loadingRecs ? (
              <LoadingSpinner label="Tarifler yükleniyor..." />
            ) : recommendations.length > 0 ? (
              recommendations.slice(0, 4).map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <Card>
                <View className="items-center py-4">
                  <Text className="text-gray-400 text-center">
                    Öneri için çocuk profili ekleyin
                  </Text>
                  <TouchableOpacity
                    className="mt-2"
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
