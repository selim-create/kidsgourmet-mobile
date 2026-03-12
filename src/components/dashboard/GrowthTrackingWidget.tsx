import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { GrowthData } from '../../lib/types';

interface GrowthTrackingWidgetProps {
  growthData?: GrowthData | null;
  isLoading?: boolean;
}

export function GrowthTrackingWidget({ growthData, isLoading }: GrowthTrackingWidgetProps) {
  const latest = growthData?.latest;
  const percentile = growthData?.percentile;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/growth')}
      style={{
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#DBEAFE',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name="trending-up-outline" size={22} color="#2563EB" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E3A8A' }}>
          Büyüme Takibi
        </Text>
        {isLoading ? (
          <Text style={{ fontSize: 12, color: '#93C5FD' }}>Yükleniyor...</Text>
        ) : latest ? (
          <Text style={{ fontSize: 12, color: '#1D4ED8', marginTop: 2 }}>
            {latest.weight_kg ? `${latest.weight_kg} kg` : ''}
            {latest.weight_kg && latest.height_cm ? ' · ' : ''}
            {latest.height_cm ? `${latest.height_cm} cm` : ''}
            {percentile?.weight_percentile
              ? ` · %${percentile.weight_percentile} persentil`
              : ''}
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: '#60A5FA', marginTop: 2 }}>
            Ölçüm eklemek için tıkla
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#3B82F6" />
    </TouchableOpacity>
  );
}
