import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface AllergenChipsProps {
  value: string[];
  onChange: (v: string[]) => void;
  allergens: string[];
}

export function AllergenChips({ value, onChange, allergens }: AllergenChipsProps) {
  const toggle = (allergen: string) => {
    if (value.includes(allergen)) {
      onChange(value.filter((a) => a !== allergen));
    } else {
      onChange([...value, allergen]);
    }
  };

  if (!allergens || allergens.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {allergens.map((allergen) => {
        const isSelected = value.includes(allergen);
        return (
          <TouchableOpacity
            key={allergen}
            onPress={() => toggle(allergen)}
            className={`px-3 py-1.5 rounded-full border ${
              isSelected
                ? 'bg-warning border-warning'
                : 'bg-white border-gray-200'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-medium ${
                isSelected ? 'text-white' : 'text-dark'
              }`}
            >
              {allergen}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
