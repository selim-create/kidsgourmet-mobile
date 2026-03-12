import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface MissingNutrientsAlertProps {
  missingNutrients?: string[];
}

export function MissingNutrientsAlert({ missingNutrients }: MissingNutrientsAlertProps) {
  if (!missingNutrients || missingNutrients.length === 0) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/(tabs)/meal-plan')}
      style={{
        backgroundColor: '#EDE9FE',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
      }}
    >
      <Ionicons name="nutrition-outline" size={18} color="#7C3AED" />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#4C1D95' }}>
          Eksik Besinler
        </Text>
        <Text style={{ fontSize: 12, color: '#4C1D95', marginTop: 1 }} numberOfLines={2}>
          Bu hafta: {missingNutrients.join(', ')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
    </TouchableOpacity>
  );
}
