import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { BLWTestResult } from '../../lib/types';

interface BLWReadinessWidgetProps {
  blwResult?: BLWTestResult | null;
  isLoading?: boolean;
  ageMonths?: number;
}

const READINESS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ready: { label: 'Hazır ✅', color: '#065F46', bg: '#ECFDF5' },
  almost_ready: { label: 'Neredeyse Hazır 🔶', color: '#92400E', bg: '#FFFBEB' },
  not_ready: { label: 'Henüz Değil ⏳', color: '#991B1B', bg: '#FEF2F2' },
};

export function BLWReadinessWidget({ blwResult, isLoading, ageMonths }: BLWReadinessWidgetProps) {
  // Only show for 4-12 month olds
  if (ageMonths !== undefined && (ageMonths < 4 || ageMonths > 12)) return null;

  const readiness = blwResult?.readiness_level
    ? READINESS_LABELS[blwResult.readiness_level]
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/blw-test')}
      style={{
        backgroundColor: readiness?.bg ?? '#FFF7ED',
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
          backgroundColor: '#FED7AA',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name="nutrition-outline" size={22} color="#EA580C" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#7C2D12' }}>
          BLW Hazırlık Testi
        </Text>
        {isLoading ? (
          <Text style={{ fontSize: 12, color: '#FDBA74' }}>Yükleniyor...</Text>
        ) : readiness ? (
          <Text style={{ fontSize: 12, color: readiness.color, marginTop: 2 }}>
            {readiness.label}
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: '#C2410C', marginTop: 2 }}>
            Testi başlatmak için tıkla
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#EA580C" />
    </TouchableOpacity>
  );
}
