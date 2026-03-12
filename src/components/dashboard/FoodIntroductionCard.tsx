import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { FoodIntroductionItem } from '../../lib/types';

interface FoodIntroductionCardProps {
  items: FoodIntroductionItem[];
  isLoading?: boolean;
}

export function FoodIntroductionCard({ items, isLoading }: FoodIntroductionCardProps) {
  if (isLoading) {
    return (
      <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 16, marginBottom: 12 }}>
        <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (items.length === 0) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
          Bu Hafta Dene 🍼
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/ingredient')}>
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
        {items.slice(0, 6).map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => router.push(`/ingredient/${item.id}`)}
            style={{
              width: 108,
              backgroundColor: '#fff',
              borderRadius: 14,
              padding: 10,
              alignItems: 'center',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.07,
              shadowRadius: 4,
            }}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={{ width: 52, height: 52, borderRadius: 26 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#D1FAE5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>🥦</Text>
              </View>
            )}
            <Text
              style={{ fontSize: 11, fontWeight: '600', color: '#374151', marginTop: 6, textAlign: 'center' }}
              numberOfLines={2}
            >
              {item.food_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
