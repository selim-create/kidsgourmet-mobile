import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { useMealPlan } from '../../src/hooks/useMealPlan';
import { generateMealPlan } from '../../src/services/meal-plan-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { MealCard } from '../../src/components/ui/MealCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { COLORS } from '../../src/lib/constants';
import Toast from 'react-native-toast-message';

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

function getMondayOfISOWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const monday = new Date(mondayWeek1);
  monday.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);
  return monday;
}

export default function MealPlanScreen() {
  const { isAuthenticated } = useAuth();
  const { activeChild } = useActiveChild();
  const now = new Date();
  const { year, week } = getISOWeek(now);
  const [weekOffset, setWeekOffset] = useState(0);
  const [generating, setGenerating] = useState(false);

  const currentWeek = week + weekOffset;
  const childId = activeChild?.id ? String(activeChild.id) : undefined;
  const { mealPlan, isLoading, mutate } = useMealPlan(childId, year, currentWeek);
  const [refreshing, setRefreshing] = useState(false);

  const weekStart = getMondayOfISOWeek(year, currentWeek).toISOString().split('T')[0];

  const handleGenerate = async () => {
    if (!childId) {
      Toast.show({ type: 'error', text1: 'Önce çocuk profili seçin.' });
      return;
    }
    Alert.alert(
      'Plan Oluştur',
      'Bu hafta için yeni bir yemek planı oluşturulsun mu?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Oluştur',
          onPress: async () => {
            setGenerating(true);
            try {
              await generateMealPlan({ child_id: childId, week_start: weekStart });
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

  const days = mealPlan?.days ?? [];

  const totalMeals = days.reduce((acc, d) => acc + (d.meals?.length ?? 0), 0);
  const completedMeals = days.reduce(
    (acc, d) => acc + (d.meals?.filter((m) => m.is_completed).length ?? 0),
    0,
  );

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

      {/* Plan Oluştur butonu */}
      <View style={styles.generateRow}>
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={generating || !childId}
          style={[styles.generateButton, (!childId || generating) && { opacity: 0.6 }]}
          activeOpacity={0.8}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="refresh-outline" size={16} color="#fff" />
          )}
          <Text style={styles.generateButtonText}>
            {generating ? 'Oluşturuluyor...' : 'Plan Oluştur'}
          </Text>
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
          {days.length > 0 ? (
            days.map((day) => {
              const dayMeals = day.meals ?? [];
              return (
              <Card key={day.date} className="mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-dark font-bold">{day.day_name}</Text>
                  <Text className="text-gray-400 text-xs">{day.date}</Text>
                </View>

                {dayMeals.length > 0 ? (
                   dayMeals.map((meal, idx) => (
                     <MealCard
                       key={idx}
                       meal={meal}
                       onPress={meal.recipe?.slug ? () => router.push(`/(tabs)/recipes/${meal.recipe!.slug}` as never) : undefined}
                     />
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
              );
            })
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="Bu hafta için plan yok"
              description="'Plan Oluştur' butonuna tıklayarak haftalık planınızı otomatik oluşturun"
              actionLabel="Plan Oluştur"
              onAction={handleGenerate}
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
  generateRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
