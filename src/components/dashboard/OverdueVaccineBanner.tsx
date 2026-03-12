import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Vaccine } from '../../lib/types';

interface OverdueVaccineBannerProps {
  overdueVaccines: Vaccine[];
}

export function OverdueVaccineBanner({ overdueVaccines }: OverdueVaccineBannerProps) {
  if (overdueVaccines.length === 0) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/vaccines')}
      style={{
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
      }}
    >
      <Ionicons name="medical-outline" size={18} color="#DC2626" />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#991B1B' }}>
          Gecikmiş Aşı
        </Text>
        <Text style={{ fontSize: 12, color: '#991B1B', marginTop: 1 }} numberOfLines={2}>
          {overdueVaccines.length === 1
            ? `${overdueVaccines[0].name} aşısı gecikmiş`
            : `${overdueVaccines.length} aşı gecikmiş`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#DC2626" />
    </TouchableOpacity>
  );
}
