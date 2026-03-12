import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Child } from '../../lib/types';

interface AllergyBannerProps {
  child: Child;
}

export function AllergyBanner({ child }: AllergyBannerProps) {
  const allergies = child.allergies ?? [];
  if (allergies.length === 0) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/(tabs)/profile')}
      style={{
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
      }}
    >
      <Ionicons name="warning-outline" size={18} color="#D97706" />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400E' }}>
          Alerjen Uyarısı
        </Text>
        <Text style={{ fontSize: 12, color: '#92400E', marginTop: 1 }} numberOfLines={2}>
          {child.name} için: {allergies.join(', ')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D97706" />
    </TouchableOpacity>
  );
}
