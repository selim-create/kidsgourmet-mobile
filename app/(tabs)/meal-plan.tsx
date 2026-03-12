import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMealPlan } from '../../src/hooks/useMealPlan';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { router } from 'expo-router';

function getWeekOffsetLabel(offset: number): string {
  if (offset === 0) return 'Bu Hafta';
  if (offset < 0) return `${Math.abs(offset)} hafta önce`;
  return `${offset} hafta sonra`;
}

// ISO 8601 week number calculation
function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const week = Math.round(
    ((d.getTime() - week1.getTime()) / 86400000 + ((week1.getDay() + 6) % 7) - 3) / 7,
  ) + 1;
  return { year: d.getFullYear(), week };
}

export default function MealPlanScreen() {
  const now = new Date();
  const { year, week } = getISOWeek(now);
  const [weekOffset, setWeekOffset] = useState(0);

  const currentWeek = week + weekOffset;
  const { mealPlan, isLoading, mutate } = useMealPlan(year, currentWeek);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  const totalMeals =
    mealPlan?.days.reduce((acc, d) => acc + d.meals.length, 0) ?? 0;
  const completedMeals =
    mealPlan?.days.reduce(
      (acc, d) => acc + d.meals.filter((m) => m.is_completed).length,
      0,
    ) ?? 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-light">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100">
        <Text className="text-dark text-2xl font-bold">Haftalık Plan</Text>

        {/* Week Navigation */}
        <View className="flex-row items-center justify-between mt-3">
          <TouchableOpacity
            onPress={() => setWeekOffset((o) => o - 1)}
            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={18} color="#455A64" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-dark font-semibold">
              {getWeekOffsetLabel(weekOffset)}
            </Text>
            <Text className="text-gray-400 text-xs">
              {year} - {currentWeek}. Hafta
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setWeekOffset((o) => o + 1)}
            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="chevron-forward" size={18} color="#455A64" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen label="Plan yükleniyor..." />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF8A65"
            />
          }
          contentContainerStyle={{ padding: 16 }}
        >
          {/* Summary */}
          {totalMeals > 0 ? (
            <Card className="mb-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-dark font-bold text-base">
                    Hafta Özeti
                  </Text>
                  <Text className="text-gray-400 text-sm mt-0.5">
                    {completedMeals}/{totalMeals} öğün tamamlandı
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-primary text-2xl font-bold">
                    %{totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0}
                  </Text>
                  <Text className="text-gray-400 text-xs">Tamamlanma</Text>
                </View>
              </View>
            </Card>
          ) : null}

          {/* Days */}
          {mealPlan && mealPlan.days.length > 0 ? (
            mealPlan.days.map((day) => (
              <Card key={day.date} className="mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-dark font-bold">{day.day_name}</Text>
                  <Text className="text-gray-400 text-xs">{day.date}</Text>
                </View>

                {day.meals.length > 0 ? (
                  day.meals.map((meal, idx) => (
                    <View
                      key={idx}
                      className="flex-row items-center py-2 border-b border-gray-50 last:border-0"
                    >
                      <View
                        className={`w-2 h-2 rounded-full mr-3 ${
                          meal.is_completed ? 'bg-success' : 'bg-gray-300'
                        }`}
                      />
                      <View className="flex-1">
                        <Text className="text-dark text-sm font-medium">
                          {meal.recipe?.title ?? meal.custom_meal ?? 'Öğün'}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {meal.meal_type?.name}
                        </Text>
                      </View>
                      {meal.is_completed ? (
                        <Badge variant="success" size="sm">✓</Badge>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <View className="py-2">
                    <Text className="text-gray-300 text-sm text-center">
                      Bu gün için plan yok
                    </Text>
                    <TouchableOpacity
                      className="mt-1.5 items-center"
                      onPress={() => router.push('/(tabs)/recipes')}
                    >
                      <Text className="text-primary text-xs font-medium">
                        + Tarif Ekle
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="Bu hafta için plan yok"
              description="Tarifler bölümünden yemek ekleyerek haftalık planınızı oluşturun"
              actionLabel="Tariflere Git"
              onAction={() => router.push('/(tabs)/recipes')}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
