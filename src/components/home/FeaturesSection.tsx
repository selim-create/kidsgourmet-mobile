import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';

const FEATURES = [
  {
    id: 'expert',
    title: 'Uzman Görüşü',
    description:
      'Uzman yazılarını takip edin, çocuğunuzun sağlığı konusunda içiniz rahat olsun.',
    icon: 'glasses-outline' as const,
    color1: '#22C55E',
    color2: '#16A34A',
  },
  {
    id: 'safe',
    title: 'Güvenli İçerik',
    description:
      'Alerjen filtreleri ve yaşa uygun içerik denetimi ile aradığınızı kolayca bulun.',
    icon: 'search-outline' as const,
    color1: '#3B82F6',
    color2: '#2563EB',
  },
  {
    id: 'community',
    title: 'K&G Topluluğu',
    description:
      'Diğer ebeveynlerin deneyimlerini okuyun, sorularınızı uzmanlara sorun.',
    icon: 'heart-outline' as const,
    color1: '#FF8A65',
    color2: '#E64A19',
  },
];

export function FeaturesSection() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Neden KidsGourmet?</Text>
        <Text style={styles.subtitle}>
          Bebeğiniz için en güvenilir, en kapsamlı beslenme rehberi.
        </Text>
      </View>

      {/* Feature cards */}
      {FEATURES.map((feature) => (
        <View
          key={feature.id}
          style={[styles.card, { borderLeftColor: feature.color1 }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: feature.color1 + '18' }]}>
            <Ionicons name={feature.icon} size={24} color={feature.color1} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDesc}>{feature.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 3,
    lineHeight: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.gray[500],
    lineHeight: 18,
  },
});
