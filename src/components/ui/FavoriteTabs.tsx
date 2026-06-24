import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants';

// Tab anahtar tipleri — içerik tipine göre
export type FavoriteTabKey = 'all' | 'recipe' | 'ingredient' | 'post' | 'discussion';

interface Tab {
  key: FavoriteTabKey;
  label: string;
  count: number;
}

interface FavoriteTabsProps {
  tabs: Tab[];
  activeKey: FavoriteTabKey;
  onChange: (key: FavoriteTabKey) => void;
}

/** Favoriler sayfası üst tab chip bileşeni — yatay kaydırılabilir */
export function FavoriteTabs({ tabs, activeKey, onChange }: FavoriteTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {tabs.map((tab) => {
        const active = activeKey === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {tab.label}
              {tab.count > 0 ? ` (${tab.count})` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#fff',
  },
});
