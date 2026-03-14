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
import { AppHeader } from '../../src/components/ui/AppHeader';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { useDashboardRecommendations } from '../../src/hooks/useDashboardRecommendations';
import { useMealPlan } from '../../src/hooks/useMealPlan';
import { useNutritionSummary } from '../../src/hooks/useNutritionSummary';
import { useFoodIntroduction } from '../../src/hooks/useFoodIntroduction';
import { useVaccines } from '../../src/hooks/useVaccines';
import { useShoppingList } from '../../src/hooks/useShoppingList';
import { useGrowthData } from '../../src/hooks/useGrowthData';
import { useBLWResults } from '../../src/hooks/useBLWResults';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar } from '../../src/components/ui/Avatar';
import { ChildSwitcher } from '../../src/components/dashboard/ChildSwitcher';
import { AllergyBanner } from '../../src/components/dashboard/AllergyBanner';
import { WeeklyOverview } from '../../src/components/dashboard/WeeklyOverview';
import { TodaysMeals } from '../../src/components/dashboard/TodaysMeals';
import { NutritionSummaryCard } from '../../src/components/dashboard/NutritionSummaryCard';
import { FoodIntroductionCard } from '../../src/components/dashboard/FoodIntroductionCard';
import { DailyRecommendations } from '../../src/components/dashboard/DailyRecommendations';
import { ShoppingListWidget } from '../../src/components/dashboard/ShoppingListWidget';
import { VaccineWidget } from '../../src/components/dashboard/VaccineWidget';
import { GrowthTrackingWidget } from '../../src/components/dashboard/GrowthTrackingWidget';
import { BLWReadinessWidget } from '../../src/components/dashboard/BLWReadinessWidget';
import { formatAge } from '../../src/utils/ageFormatter';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';
import { useSWRConfig } from 'swr';

function GuestDashboard() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4">
          <View
            className="bg-white rounded-2xl items-center py-6 mb-4"
            style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }}
          >
            <Ionicons name="leaf-outline" size={40} color="#FF8A65" />
            <Text className="text-dark text-lg font-bold mt-3 mb-1">
              Hoş Geldiniz! 👋
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-4 px-4">
              Hesap oluşturarak kişiselleştirilmiş öneriler, haftalık planlar ve daha fazlasına erişin.
            </Text>
            <View className="w-full px-4">
              <TouchableOpacity
                className="bg-primary rounded-xl py-3 items-center"
                activeOpacity={0.8}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text className="text-white font-semibold">Giriş Yap</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="mt-3"
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text className="text-primary text-sm font-medium">
                Hesap Oluştur →
              </Text>
            </TouchableOpacity>
          </View>

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
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/blog')}
              style={{ elevation: 2 }}
            >
              <Ionicons name="newspaper-outline" size={24} color="#7CB342" />
              <Text className="text-dark font-semibold text-sm mt-2">Blog</Text>
              <Text className="text-gray-400 text-xs text-center mt-1">
                Keşfet & Öğren
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function DashboardScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeChild, children: childList, setActiveChild } = useActiveChild();
  const { recommendations, isLoading: loadingRecs } = useDashboardRecommendations();
  const { mealPlan, isLoading: loadingPlan } = useMealPlan();
  const { summary: nutritionSummary, isLoading: loadingNutrition } = useNutritionSummary('week');
  const { items: foodItems, isLoading: loadingFood } = useFoodIntroduction();
  const { vaccines, isLoading: loadingVaccines } = useVaccines();
  const { items: shoppingItems, isLoading: loadingShopping } = useShoppingList();
  const { growthData, isLoading: loadingGrowth } = useGrowthData();
  const { blwResult, isLoading: loadingBLW } = useBLWResults();
  const { mutate } = useSWRConfig();

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split('T')[0],
  );

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

  const ageMonths = activeChild ? getAgeInMonths(activeChild.birth_date) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <AppHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF8A65" />
        }
      >
        {/* Child Info Card */}
        <View className="px-4 pt-4">
          {activeChild ? (
            <View
              style={{ backgroundColor: '#fff', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }}
            >
              <Avatar uri={activeChild.avatar_url} name={activeChild.name} size={36} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#455A64', fontSize: 14 }}>{activeChild.name}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                  {formatAge(activeChild.birth_date)}
                </Text>
              </View>
              <Badge variant="secondary" size="sm">Aktif Profil</Badge>
            </View>
          ) : (
            <TouchableOpacity
              style={{ backgroundColor: '#fff', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF8A6520', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="add" size={20} color="#FF8A65" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#455A64', fontSize: 14 }}>Çocuk profili ekle</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Kişiselleştirilmiş öneriler için</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          )}
        </View>

        {/* Child Switcher (only when multiple children) */}
        {childList.length > 1 && (
          <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <ChildSwitcher
              children={childList}
              activeChild={activeChild}
              onSelect={setActiveChild}
            />
          </View>
        )}

        <View className="px-4">
          {/* Banners */}
          {activeChild && (
            <View style={{ marginTop: 8, marginBottom: 4 }}>
              <AllergyBanner child={activeChild} />
            </View>
          )}

          {/* Weekly Overview */}
          {activeChild && (
            <View style={{ marginTop: 16, marginBottom: 4 }}>
              <WeeklyOverview
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                mealPlanDays={mealPlan?.days}
              />
            </View>
          )}

          {/* Today's Meals */}
          {activeChild && (
            <TodaysMeals
              selectedDate={selectedDate}
              mealPlanDays={mealPlan?.days}
              isLoading={loadingPlan}
            />
          )}

          {/* Stats row */}
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
                  <Text className="text-2xl font-bold text-dark">
                    %{mealPlan
                      ? (() => {
                          const total = mealPlan.days.reduce((a, d) => a + d.meals.length, 0);
                          const done = mealPlan.days.reduce((a, d) => a + d.meals.filter((m) => m.is_completed).length, 0);
                          return total > 0 ? Math.round((done / total) * 100) : 0;
                        })()
                      : 0}
                  </Text>
                  <Text className="text-gray-400 text-xs">tamamlandı</Text>
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

          {/* Nutrition Summary Card */}
          {activeChild && (
            <NutritionSummaryCard
              summary={nutritionSummary}
              isLoading={loadingNutrition}
            />
          )}

          {/* Food Introduction */}
          {activeChild && (
            <FoodIntroductionCard
              items={foodItems}
              isLoading={loadingFood}
            />
          )}

          {/* Daily Recommendations */}
          <DailyRecommendations
            recommendations={recommendations}
            isLoading={loadingRecs}
          />

          {/* Shopping List Widget */}
          {isAuthenticated && (
            <ShoppingListWidget items={shoppingItems} isLoading={loadingShopping} />
          )}

          {/* Quick Tools */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 10 }}>
              Hızlı Araçlar 🛠️
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/food-guide')}
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  padding: 14,
                  alignItems: 'center',
                  elevation: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🥣</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
                  Ek Gıda Rehberi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/safety-check')}
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  padding: 14,
                  alignItems: 'center',
                  elevation: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🔍</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
                  Gıda Güvenliği
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Health Widgets */}
          {activeChild && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 10 }}>
                Sağlık & Gelişim 🌱
              </Text>
              <VaccineWidget vaccines={vaccines} isLoading={loadingVaccines} />
              <GrowthTrackingWidget growthData={growthData} isLoading={loadingGrowth} />
              <BLWReadinessWidget blwResult={blwResult} isLoading={loadingBLW} ageMonths={ageMonths} />
            </View>
          )}

          {/* Blog shortcut */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/blog')}
            className="mb-6 bg-white rounded-2xl p-4 flex-row items-center"
            style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }}
          >
            <View className="w-12 h-12 rounded-2xl bg-secondary/20 items-center justify-center mr-3">
              <Ionicons name="newspaper-outline" size={24} color="#7CB342" />
            </View>
            <View className="flex-1">
              <Text className="text-dark font-bold text-base">Blog & Keşfet</Text>
              <Text className="text-gray-400 text-sm">Beslenme, gelişim ve sağlık yazıları</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
