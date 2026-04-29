import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EmbedData } from '../../lib/types';
import { EmbedCard } from './EmbedCard';

// ─── Embed Info (ported from web) ─────────────────────────────────────────────

interface EmbedInfo {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function getEmbedInfo(type: EmbedData['type']): EmbedInfo {
  switch (type) {
    case 'recipe':
      return { title: 'İlgili Tarifler', icon: 'restaurant-outline', color: '#F97316' };
    case 'ingredient':
      return { title: 'İlgili Malzemeler', icon: 'leaf-outline', color: '#22C55E' };
    case 'tool':
      return { title: 'Faydalı Araçlar', icon: 'sparkles-outline', color: '#7C3AED' };
    case 'post':
      return { title: 'İlgili Yazılar', icon: 'book-outline', color: '#3B82F6' };
  }
}

// ─── EmbedContainer ───────────────────────────────────────────────────────────

interface EmbedContainerProps {
  embed: EmbedData;
}

export function EmbedContainer({ embed }: EmbedContainerProps) {
  const info = getEmbedInfo(embed.type);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: info.color + '1A' }]}>
          <Ionicons name={info.icon} size={18} color={info.color} />
        </View>
        <Text style={styles.headerTitle}>{info.title}</Text>
      </View>

      {/* Cards */}
      <View style={styles.cardList}>
        {embed.items.map((item) => (
          <EmbedCard key={`${item.embed_type}-${item.id}`} item={item} />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardList: {
    gap: 12,
  },
});
