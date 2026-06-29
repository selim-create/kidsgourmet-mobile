import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useSWR from 'swr';
import { Image } from 'expo-image';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useActiveChild } from '../../../src/contexts/ActiveChildContext';
import {
  getMealPlan,
  generateMealPlan,
  removeFromMealPlan,
} from '../../../src/services/meal-plan-service';
import { generateShoppingList } from '../../../src/services/shopping-list-service';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { COLORS } from '../../../src/lib/constants';
import type { MealPlan, MealPlanDay } from '../../../src/lib/types';
import Toast from 'react-native-toast-message';

import { AppIcon } from '../../../src/components/ui/AppIcon';
// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_TR_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const DAYS_TR_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getMondayOfWeek(year: number, week: number): Date {
  const d = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDateDisplay(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][d.getMonth()]}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HaftalikPlanScreen() {
  const { isAuthenticated } = useAuth();
  const { activeChild } = useActiveChild();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [week, setWeek] = useState(getISOWeek(today));
  const [generating, setGenerating] = useState(false);
  const [generatingList, setGeneratingList] = useState(false);

  const monday = getMondayOfWeek(year, week);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const childId = activeChild?.id ? String(activeChild.id) : null;
  const weekStart = monday.toISOString().split('T')[0];

  const { data: mealPlan, isLoading, mutate } = useSWR<MealPlan | null>(
    isAuthenticated && childId ? ['haftalik-plan', childId, year, week] : null,
    () => (childId ? getMealPlan(childId, year, week) : null),
  );

  const goToPrevWeek = () => {
    if (week === 1) {
      setYear((y) => y - 1);
      setWeek(52);
    } else {
      setWeek((w) => w - 1);
    }
  };

  const goToNextWeek = () => {
    if (week === 52) {
      setYear((y) => y + 1);
      setWeek(1);
    } else {
      setWeek((w) => w + 1);
    }
  };

  const handleGenerate = async () => {
    if (!childId) {
      Toast.show({ type: 'error', text1: 'Önce çocuk profili seçin.' });
      return;
    }

    Alert.alert(
      'Plan Oluştur',
      'Bu hafta için yeni bir yemek planı oluşturulsun mu? Mevcut plan silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Oluştur',
          onPress: async () => {
            setGenerating(true);
            try {
            await generateMealPlan({
              child_id: childId,
              week_start: weekStart,
              });
              await mutate();
              Toast.show({ type: 'success', text1: 'Plan oluşturuldu!' });
            } catch {
              Toast.show({ type: 'error', text1: 'Plan oluşturulamadı.' });
            } finally {
              setGenerating(false);
            }
          },
        },
      ],
    );
  };

  const handleGenerateShoppingList = async () => {
    setGeneratingList(true);
    try {
      await generateShoppingList({ week: `${year}-W${String(week).padStart(2, '0')}` });
      Toast.show({ type: 'success', text1: 'Alışveriş listesi oluşturuldu!' });
      router.push('/shopping-list');
    } catch {
      Toast.show({ type: 'error', text1: 'Liste oluşturulamadı.' });
    } finally {
      setGeneratingList(false);
    }
  };

  const handleRemoveMeal = async (entryId?: number) => {
    if (!entryId) return;
    try {
      await removeFromMealPlan(entryId);
      await mutate();
    } catch {
      Toast.show({ type: 'error', text1: 'Öğün silinemedi.' });
    }
  };

  const onRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.primary }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <AppIcon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Haftalık Plan</Text>
        </View>
        <EmptyState
          icon="lock-closed-outline"
          title="Giriş gerekli"
          description="Haftalık planınıza erişmek için giriş yapın."
          actionLabel="Giriş Yap"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  const days = mealPlan?.days ?? [];

  // __DEV__-only response dump so Metro logs show the actual backend shape.
  // Intentional per project convention — gated by __DEV__ so it is stripped in production builds.
  if (__DEV__) {
    console.log('[KG-DEBUG] meal plan response', mealPlan);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <AppIcon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', flex: 1 }}>Haftalık Plan</Text>
        </View>

        {/* Week Navigator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <TouchableOpacity
            onPress={goToPrevWeek}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
          >
            <AppIcon name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              {formatDateDisplay(monday.toISOString().split('T')[0])} – {formatDateDisplay(sunday.toISOString().split('T')[0])}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 }}>
              {year}, {week}. hafta
            </Text>
          </View>

          <TouchableOpacity
            onPress={goToNextWeek}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
          >
            <AppIcon name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={generating}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: COLORS.primary,
            borderRadius: 10,
            paddingVertical: 10,
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <AppIcon name="refresh-outline" size={16} color="#fff" />
          )}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Planı Yenile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGenerateShoppingList}
          disabled={generatingList}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: '#16A34A',
            borderRadius: 10,
            paddingVertical: 10,
            opacity: generatingList ? 0.7 : 1,
          }}
        >
          {generatingList ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <AppIcon name="cart-outline" size={16} color="#fff" />
          )}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Alışveriş Listesi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        {isLoading ? (
          <LoadingSpinner label="Plan yükleniyor..." />
        ) : days.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Bu hafta için plan yok"
            description="Otomatik plan oluşturmak için 'Planı Yenile' düğmesine tıklayın."
          />
        ) : (
          <View style={{ gap: 16 }}>
            {days.map((day, dayIdx) => {
              const dayDate = new Date(day.date);
              const dow = dayDate.getDay();
              const dayName = DAYS_TR_FULL[dow === 0 ? 6 : dow - 1];
              const shortDay = DAYS_TR_SHORT[dow === 0 ? 6 : dow - 1];
              const isToday = day.date === new Date().toISOString().split('T')[0];
              const meals = day.meals ?? [];

              return (
                <View
                  key={day.date}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.07,
                    shadowRadius: 4,
                    borderWidth: isToday ? 2 : 0,
                    borderColor: isToday ? COLORS.primary : 'transparent',
                  }}
                >
                  {/* Day Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: isToday ? '#FFF3EE' : '#F9FAFB' }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: isToday ? COLORS.primary : '#E5E7EB',
                      alignItems: 'center', justifyContent: 'center', marginRight: 10,
                    }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isToday ? '#fff' : '#374151' }}>
                        {dayDate.getDate()}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: isToday ? COLORS.primary : '#1F2937' }}>
                        {dayName} {isToday && '• Bugün'}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#9CA3AF' }}>{formatDateDisplay(day.date)}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, color: '#9CA3AF' }}>{meals.length} öğün</Text>
                    </View>
                  </View>

                  {/* Meals */}
                  {meals.length === 0 ? (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Öğün eklenmemiş</Text>
                    </View>
                  ) : (
                    <View>
                      {meals.map((meal, mealIdx) => (
                        <View
                          key={meal.id ?? mealIdx}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderTopWidth: 1,
                            borderTopColor: '#F3F4F6',
                          }}
                        >
                          {meal.recipe?.featured_image ? (
                            <Image
                              source={{ uri: meal.recipe.featured_image }}
                              style={{ width: 44, height: 44, borderRadius: 8 }}
                              contentFit="cover"
                            />
                          ) : (
                            <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#FFF3EE', alignItems: 'center', justifyContent: 'center' }}>
                              <AppIcon name="restaurant-outline" size={20} color={COLORS.primary} />
                            </View>
                          )}
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500' }}>
                              {meal.meal_type?.name ?? 'Öğün'}
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', marginTop: 1 }} numberOfLines={1}>
                              {meal.recipe?.title ?? meal.custom_meal ?? 'Özel öğün'}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {meal.recipe?.slug && (
                              <TouchableOpacity
                                onPress={() => router.push(`/(tabs)/recipes/${meal.recipe!.slug}`)}
                                style={{ padding: 4 }}
                              >
                                <AppIcon name="eye-outline" size={18} color="#6B7280" />
                              </TouchableOpacity>
                            )}
                            {meal.id && (
                              <TouchableOpacity
                                onPress={() => handleRemoveMeal(meal.id)}
                                style={{ padding: 4 }}
                              >
                                <AppIcon name="trash-outline" size={18} color="#EF4444" />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
