import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { AppIcon } from '../ui/AppIcon';
// Backend string[] veya {name, percent, deficiency}[] döndürebilir
type NutrientItem = string | { name: string; percent?: number; deficiency?: string };

interface MissingNutrientsAlertProps {
  missingNutrients?: NutrientItem[];
}

export function MissingNutrientsAlert({ missingNutrients }: MissingNutrientsAlertProps) {
  if (!missingNutrients || missingNutrients.length === 0) return null;

  // Object gelen besinleri string'e normalize et
  const nutrientNames = missingNutrients
    .map((n) => (typeof n === 'string' ? n : (n.name ?? '')))
    .filter(Boolean);

  // Normalleştirme sonrası liste boşsa gösterme
  if (nutrientNames.length === 0) return null;

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
      <AppIcon name="nutrition-outline" size={18} color="#7C3AED" />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#4C1D95' }}>
          Eksik Besinler
        </Text>
        <Text style={{ fontSize: 12, color: '#4C1D95', marginTop: 1 }} numberOfLines={2}>
          Bu hafta: {nutrientNames.join(', ')}
        </Text>
      </View>
      <AppIcon name="chevron-forward" size={16} color="#7C3AED" />
    </TouchableOpacity>
  );
}
