import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { MealPlanDay } from '../../lib/types';

interface TodaysMealsProps {
  selectedDate: string;
  mealPlanDays?: MealPlanDay[];
  isLoading?: boolean;
}

export function TodaysMeals({ selectedDate, mealPlanDays, isLoading }: TodaysMealsProps) {
  const todayIso = new Date().toISOString().split('T')[0];
  const date = selectedDate || todayIso;
  const isToday = date === todayIso;

  const dayData = mealPlanDays?.find((d) => d.date === date);
  const meals = dayData?.meals ?? [];

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
          {isToday ? "Bugünün Menüsü 🍽️" : "Seçilen Günün Menüsü"}
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/meal-plan')}>
          <Text style={{ fontSize: 13, color: '#FF8A65', fontWeight: '500' }}>
            Planı Düzenle
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16 }}>
          <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>Yükleniyor...</Text>
        </View>
      ) : meals.length > 0 ? (
        <View style={{ gap: 8 }}>
          {meals.map((meal, idx) => (
            <TouchableOpacity
              key={meal.id ?? idx}
              activeOpacity={0.8}
              onPress={() =>
                meal.recipe ? router.push(`/(tabs)/recipes/${meal.recipe.slug}`) : undefined
              }
              style={{
                backgroundColor: '#fff',
                borderRadius: 14,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
              }}
            >
              {meal.recipe?.featured_image ? (
                <Image
                  source={{ uri: meal.recipe.featured_image }}
                  style={{ width: 52, height: 52, borderRadius: 10 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    backgroundColor: '#FFF3EE',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="restaurant-outline" size={22} color="#FF8A65" />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500' }}>
                  {meal.meal_type?.name ?? 'Öğün'}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1F2937', marginTop: 1 }} numberOfLines={1}>
                  {meal.recipe?.title ?? meal.custom_meal ?? 'Öğün eklenmedi'}
                </Text>
              </View>
              {meal.is_completed ? (
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              ) : (
                <Ionicons name="ellipse-outline" size={20} color="#D1D5DB" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/meal-plan')}
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderStyle: 'dashed',
          }}
        >
          <Ionicons name="add-circle-outline" size={28} color="#9CA3AF" />
          <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>
            {isToday ? 'Bugün için öğün ekle' : 'Bu gün için öğün ekle'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
