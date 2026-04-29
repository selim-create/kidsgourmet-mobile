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
        <View style={[styles.iconWrapper, { backgroundColor: info.color + '20' }]}>
          <Ionicons name={info.icon} size={20} color={info.color} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>{info.title}</Text>
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
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  cardList: {
    gap: 10,
  },
});
