import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { MealPlanEntry } from '../../lib/types';

interface MealCardProps {
  meal: MealPlanEntry;
  onPress?: () => void;
}

export function MealCard({ meal, onPress }: MealCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
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
        marginBottom: 8,
      }}
    >
      {meal.recipe?.featured_image ? (
        <Image
          source={{ uri: meal.recipe.featured_image }}
          style={{ width: 48, height: 48, borderRadius: 10 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            backgroundColor: '#FFF3EE',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="restaurant-outline" size={20} color="#FF8A65" />
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 1 }}>
          {meal.meal_type?.name ?? 'Öğün'}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#1F2937' }} numberOfLines={1}>
          {meal.recipe?.title ?? meal.custom_meal ?? 'Öğün eklenmedi'}
        </Text>
        {meal.recipe?.total_time ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="time-outline" size={10} color="#9CA3AF" />
            <Text style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 2 }}>
              {meal.recipe.total_time} dk
            </Text>
          </View>
        ) : null}
      </View>
      {meal.is_completed ? (
        <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
      ) : (
        <Ionicons name="ellipse-outline" size={20} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}
