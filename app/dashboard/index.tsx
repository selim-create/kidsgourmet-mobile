import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import useSWR, { useSWRConfig } from 'swr';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { useCollapsibleHeader } from '../../src/hooks/use-collapsible-header';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { Avatar } from '../../src/components/ui/Avatar';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Button } from '../../src/components/ui/Button';
import { Footer } from '../../src/components/layout/Footer';
import { COLORS } from '../../src/lib/constants';

// Dashboard widgets
import { AllergyBanner } from '../../src/components/dashboard/AllergyBanner';
import { OverdueVaccineBanner } from '../../src/components/dashboard/OverdueVaccineBanner';
import { MissingNutrientsAlert } from '../../src/components/dashboard/MissingNutrientsAlert';
import { WeeklyOverview } from '../../src/components/dashboard/WeeklyOverview';
import { TodaysMeals } from '../../src/components/dashboard/TodaysMeals';
import { NutritionSummaryCard } from '../../src/components/dashboard/NutritionSummaryCard';
import { BLWReadinessWidget } from '../../src/components/dashboard/BLWReadinessWidget';
import { GrowthTrackingWidget } from '../../src/components/dashboard/GrowthTrackingWidget';
import { VaccineWidget } from '../../src/components/dashboard/VaccineWidget';
import { ShoppingListWidget } from '../../src/components/dashboard/ShoppingListWidget';
import { FoodIntroductionCard } from '../../src/components/dashboard/FoodIntroductionCard';
import { DailyRecommendations } from '../../src/components/dashboard/DailyRecommendations';

// Services
import { getCurrentMealPlan } from '../../src/services/meal-plan-service';
import { getNutritionSummary, getMissingNutrients } from '../../src/services/nutrition-service';
import { getGrowthData } from '../../src/services/growth-service';
import { getBLWTestResults } from '../../src/services/blw-service';
import { getVaccinesByChild } from '../../src/services/vaccine-service';
import { getShoppingList } from '../../src/services/shopping-list-service';
import { getFoodIntroductionItems } from '../../src/services/food-introduction-service';
import { getDashboardRecommendations } from '../../src/services/recommendation-service';

import { formatAge } from '../../src/utils/ageFormatter';
import { calculateAgeInMonths } from '../../src/utils/ageCalculator';
import type { MealPlan } from '../../src/lib/types';

export default function DashboardScreen() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeChild } = useActiveChild();
  const { mutate } = useSWRConfig();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0],
  );
  const { scrollY, scrollHandler } = useCollapsibleHeader();

  const childId = activeChild?.id;
  const childIdStr = childId != null ? String(childId) : null;

  // ── Meal plan (current week)
  const { data: mealPlan, isLoading: loadingMealPlan } = useSWR<MealPlan>(
    childId != null ? ['dashboard-mealplan', childId] : null,
    () => getCurrentMealPlan(),
  );

  // ── Nutrition summary
  const { data: nutritionSummary, isLoading: loadingNutrition } = useSWR(
    childId != null ? ['dashboard-nutrition', childId] : null,
    () => getNutritionSummary(childId as number, 'week'),
  );

  // ── Missing nutrients
  const { data: missingNutrientsData } = useSWR(
    childId != null ? ['dashboard-missing-nutrients', childId] : null,
    () => getMissingNutrients(childId as number),
  );

  // ── Growth data
  const { data: growthData, isLoading: loadingGrowth } = useSWR(
    childId != null ? ['dashboard-growth', childId] : null,
    () => getGrowthData(childId as number),
  );

  // ── BLW test result
  const { data: blwResult, isLoading: loadingBLW } = useSWR(
    childId != null ? ['dashboard-blw', childId] : null,
    () => getBLWTestResults(childId as number),
  );

  // ── Vaccines
  const { data: vaccines, isLoading: loadingVaccines } = useSWR(
    childIdStr != null ? ['dashboard-vaccines', childIdStr] : null,
    () => getVaccinesByChild(childIdStr as string),
  );

  // ── Shopping list
  const { data: shoppingItems, isLoading: loadingShoppingList } = useSWR(
    isAuthenticated ? 'dashboard-shopping-list' : null,
    () => getShoppingList(),
  );

  // ── Food introduction
  const { data: foodIntroItems, isLoading: loadingFoodIntro } = useSWR(
    childId != null ? ['dashboard-food-intro', childId] : null,
    () => getFoodIntroductionItems(childId as number),
  );

  // ── Daily recommendations
  const { data: recommendations, isLoading: loadingRecommendations } = useSWR(
    childId != null ? ['dashboard-recommendations', childId] : null,
    () => getDashboardRecommendations(childId as number),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await mutate(() => true, undefined, { revalidate: true });
    setRefreshing(false);
  }, [mutate]);

  if (authLoading) {
    return <LoadingSpinner fullScreen label="Yükleniyor..." />;
  }

  // Derive vaccine lists
  const allVaccines = Array.isArray(vaccines) ? vaccines : [];
  const overdueVaccines = allVaccines.filter((v) => v.is_overdue === true);
  const missingNutrients: string[] = missingNutrientsData?.missing_nutrients ?? [];

  const ageMonths = activeChild?.birth_date
    ? calculateAgeInMonths(activeChild.birth_date)
    : undefined;

  return (
    <View style={styles.root}>
      <AppHeader showGreeting scrollY={scrollY} />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {!isAuthenticated ? (
          /* ── Auth CTA ──────────────────────────────────────────────────────── */
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Kişisel paneliniz sizi bekliyor</Text>
            <Text style={styles.authSubtitle}>
              Çocuğunuzun beslenme takibi, haftalık öğün planları, aşı takvimi ve
              daha fazlası için giriş yapın.
            </Text>
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.authLoginBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.authLoginText}>Giriş Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.authRegisterBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.authRegisterText}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* ── Hero card ─────────────────────────────────────────────────── */}
            {activeChild ? (
              <View style={styles.heroCard}>
                <Avatar uri={activeChild.avatar_url} name={activeChild.name} size={56} />
                <View style={styles.heroInfo}>
                  <Text style={styles.heroName}>{activeChild.name}</Text>
                  <Text style={styles.heroAge}>{formatAge(activeChild.birth_date)}</Text>
                  <Text style={styles.heroPrompt}>Bugün ne pişirelim? 🍽️</Text>
                </View>
              </View>
            ) : (
              <View style={styles.heroCard}>
                <Avatar name={user?.name} size={56} />
                <View style={styles.heroInfo}>
                  <Text style={styles.heroName}>
                    Hoş geldin{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
                  </Text>
                  <Text style={styles.heroPrompt}>Paneline hoş geldin</Text>
                </View>
              </View>
            )}

            {/* ── Banner row ────────────────────────────────────────────────── */}
            {activeChild && (
              <View style={styles.section}>
                <OverdueVaccineBanner overdueVaccines={overdueVaccines} />
                <AllergyBanner child={activeChild} />
                <MissingNutrientsAlert missingNutrients={missingNutrients} />
              </View>
            )}

            {/* ── Section: Haftalık Bakış ───────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Haftalık Bakış 📅</Text>
              <WeeklyOverview
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                mealPlanDays={mealPlan?.days}
              />
            </View>

            {/* ── Section: Bugünün Öğünleri ─────────────────────────────────── */}
            {activeChild && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bugünün Öğünleri 🍽️</Text>
                <TodaysMeals
                  selectedDate={selectedDate}
                  mealPlanDays={mealPlan?.days}
                  isLoading={loadingMealPlan}
                />
              </View>
            )}

            {/* ── Section: Beslenme Durumu ──────────────────────────────────── */}
            {activeChild && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Beslenme Durumu 📊</Text>
                <NutritionSummaryCard
                  summary={nutritionSummary}
                  isLoading={loadingNutrition}
                />
              </View>
            )}

            {/* ── Section: BLW Hazırlık ─────────────────────────────────────── */}
            {activeChild && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>BLW Hazırlık 🥄</Text>
                <BLWReadinessWidget
                  blwResult={blwResult}
                  isLoading={loadingBLW}
                  ageMonths={ageMonths}
                />
              </View>
            )}

            {/* ── Section: Büyüme Takibi ────────────────────────────────────── */}
            {activeChild && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Büyüme Takibi 📈</Text>
                <GrowthTrackingWidget
                  growthData={growthData}
                  isLoading={loadingGrowth}
                />
              </View>
            )}

            {/* ── Section: Sağlık & Aşı ────────────────────────────────────── */}
            {activeChild && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sağlık & Aşı 💉</Text>
                <VaccineWidget
                  vaccines={allVaccines}
                  isLoading={loadingVaccines}
                />
              </View>
            )}

            {/* ── Section: Alışveriş Listesi ────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alışveriş Listesi 🛒</Text>
              <ShoppingListWidget
                items={shoppingItems ?? []}
                isLoading={loadingShoppingList}
              />
            </View>

            {/* ── Section: Yaş Rehberi ──────────────────────────────────────── */}
            {activeChild && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yaş Rehberi 🍎</Text>
                <FoodIntroductionCard
                  items={foodIntroItems ?? []}
                  isLoading={loadingFoodIntro}
                />
              </View>
            )}

            {/* ── Section: Sana Özel Öneriler ───────────────────────────────── */}
            {activeChild && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sana Özel Öneriler ✨</Text>
                <DailyRecommendations
                  recommendations={recommendations ?? []}
                  isLoading={loadingRecommendations}
                />
              </View>
            )}

            {/* ── No active child empty state ───────────────────────────────── */}
            {!activeChild && (
              <View style={styles.emptyChildCard}>
                <Text style={styles.emptyChildEmoji}>👶</Text>
                <Text style={styles.emptyChildTitle}>Çocuk profili eklenmedi</Text>
                <Text style={styles.emptyChildSubtitle}>
                  Kişiselleştirilmiş içerik görmek için profil sayfasından bir çocuk ekleyin.
                </Text>
                <Button
                  onPress={() => router.push('/(tabs)/profile')}
                  style={styles.emptyChildBtn}
                >
                  Profil Sayfasına Git
                </Button>
              </View>
            )}
          </>
        )}

        <Footer />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  // Auth CTA
  authCard: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  authTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
    lineHeight: 20,
    marginBottom: 18,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  authLoginBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authLoginText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  authRegisterBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  authRegisterText: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
  },
  // Hero card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  heroInfo: {
    marginLeft: 14,
    flex: 1,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },
  heroAge: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  heroPrompt: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 10,
  },
  // Empty child state
  emptyChildCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  emptyChildEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyChildTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyChildSubtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyChildBtn: {
    width: '100%',
  },
});
