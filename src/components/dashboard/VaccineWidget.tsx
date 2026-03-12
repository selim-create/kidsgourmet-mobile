import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';
import type { Vaccine } from '../../lib/types';

interface VaccineWidgetProps {
  vaccines: Vaccine[];
  isLoading?: boolean;
}

export function VaccineWidget({ vaccines, isLoading }: VaccineWidgetProps) {
  const safeVaccines = Array.isArray(vaccines) ? vaccines : [];
  const upcomingCount = safeVaccines.filter(
    (v) => !v.recommended_age_months || v.recommended_age_months >= 0,
  ).length;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/vaccines')}
      style={{
        backgroundColor: '#ECFDF5',
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
          backgroundColor: '#D1FAE5',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name="medical-outline" size={22} color="#059669" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#065F46' }}>
          Aşı Takvimi
        </Text>
        {isLoading ? (
          <Text style={{ fontSize: 12, color: '#6EE7B7' }}>Yükleniyor...</Text>
        ) : (
          <Text style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
            {upcomingCount > 0
              ? `${upcomingCount} aşı takibinde`
              : 'Tüm aşılar takipte'}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.success} />
    </TouchableOpacity>
  );
}
