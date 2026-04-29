import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { BlogCategory } from '../../lib/types';

interface CategoryChipsProps {
  categories: BlogCategory[];
  activeId: number | 'all';
  onSelect: (id: number | 'all') => void;
}

export function CategoryChips({ categories, activeId, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* "Tümü" chip */}
      <TouchableOpacity
        onPress={() => onSelect('all')}
        activeOpacity={0.8}
        style={[styles.chip, activeId === 'all' ? styles.chipActive : styles.chipInactive]}
      >
        <Text style={[styles.chipText, activeId === 'all' ? styles.chipTextActive : styles.chipTextInactive]}>
          Tümü
        </Text>
      </TouchableOpacity>

      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          onPress={() => onSelect(cat.id)}
          activeOpacity={0.8}
          style={[styles.chip, activeId === cat.id ? styles.chipActive : styles.chipInactive]}
        >
          <Text style={[styles.chipText, activeId === cat.id ? styles.chipTextActive : styles.chipTextInactive]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
    transform: [{ scale: 1.05 }],
  },
  chipInactive: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  chipTextInactive: {
    color: '#6B7280',
  },
});
