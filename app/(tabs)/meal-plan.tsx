import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useMealPlan } from '../../src/hooks/useMealPlan';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { AppHeader } from '../../src/components/ui/AppHeader';

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
  const { isAuthenticated } = useAuth();
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

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <AppHeader />
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            icon="calendar-outline"
            title="Haftalık planı görmek için giriş yapın"
            description="Kişisel haftalık yemek planınızı oluşturun ve takip edin"
          />
          <Button onPress={() => router.push('/(auth)/login')} className="mt-4 w-full">
            Giriş Yap
          </Button>
        </View>
      </View>
    );
  }

  const totalMeals =
    mealPlan?.days.reduce((acc, d) => acc + d.meals.length, 0) ?? 0;
  const completedMeals =
    mealPlan?.days.reduce(
      (acc, d) => acc + d.meals.filter((m) => m.is_completed).length,
      0,
    ) ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <AppHeader />
      <View style={styles.weekNav}>
        <TouchableOpacity
          onPress={() => setWeekOffset((o) => o - 1)}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={18} color="#455A64" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#455A64', fontWeight: '600' }}>
            {getWeekOffsetLabel(weekOffset)}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
            {year} - {currentWeek}. Hafta
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setWeekOffset((o) => o + 1)}
          style={styles.navButton}
        >
          <Ionicons name="chevron-forward" size={18} color="#455A64" />
        </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

