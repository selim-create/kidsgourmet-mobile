import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Recipe } from '../../lib/types';

interface DailyRecommendationsProps {
  recommendations: Recipe[];
  isLoading?: boolean;
}

export function DailyRecommendations({ recommendations, isLoading }: DailyRecommendationsProps) {
  if (isLoading) {
    return (
      <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 16, marginBottom: 12 }}>
        <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>Öneriler yükleniyor...</Text>
      </View>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
          Günlük Öneriler ⭐
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/recipes')}>
          <Text style={{ fontSize: 13, color: '#FF8A65', fontWeight: '500' }}>
            Tümünü Gör
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 4, gap: 10 }}
      >
        {recommendations.slice(0, 6).map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            activeOpacity={0.8}
            onPress={() => router.push(`/(tabs)/recipes/${recipe.slug}`)}
            style={{
              width: 152,
              backgroundColor: '#fff',
              borderRadius: 14,
              overflow: 'hidden',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
            }}
          >
            <Image
              source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
              style={{ width: 152, height: 100 }}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
            <View style={{ padding: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2937' }} numberOfLines={2}>
                {recipe.title}
              </Text>
              {recipe.total_time ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="time-outline" size={10} color="#9CA3AF" />
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 3 }}>
                    {recipe.total_time} dk
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
