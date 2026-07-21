import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants';

// Desteklenen tab tipleri
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

/** Yatay kaydırmalı içerik tipi tab chip'leri */
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
              {/* Sayı yalnızca 0'dan büyükse gösterilir — placeholder tab'larda "(0)" gürültüsü önlenir */}
              {tab.label}{tab.count > 0 ? ` (${tab.count})` : ''}
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
    flexGrow: 0,
    minHeight: 52,
  },
  content: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280', includeFontPadding: false },
  chipTextActive: { color: '#fff', includeFontPadding: false },
});
