import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CrossSellBannerProps {
  variant: 'tariften' | 'rejimde';
  /** Optional style override for the card container (e.g. margins). */
  style?: ViewStyle;
}

const TARIFTEN_CONFIG = {
  badge: 'EBEVEYNLERE ÖZEL',
  title: 'Bizimkiler Ne Yiyecek?',
  body:
    'Bebeğine sağlıklı tarifler hazırlarken kendini de unutma! Lezzetli tarifler denemek ister misin?',
  cta: "Tariften.com'da Keşfet",
  url: 'https://tariften.com',
  gradient1: '#7E57C2',
  gradient2: '#5E35B1',
  icon: 'restaurant-outline' as const,
};

const REJIMDE_CONFIG = {
  badge: 'EBEVEYNLERE ÖZEL',
  title: 'Sağlıklı Yaşamın Eğlenceli Hali',
  body:
    'Kanıtlanmış bilimsel verilerle, sürdürülebilir sağlıklı yaşam için size uygun egzersiz ve diyet programını hemen keşfedin!',
  cta: "Rejimde.com'da Keşfet",
  url: 'https://rejimde.com',
  gradient1: '#2E7D32',
  gradient2: '#1B5E20',
  icon: 'leaf-outline' as const,
};

export function CrossSellBanner({ variant, style }: CrossSellBannerProps) {
  const config = variant === 'tariften' ? TARIFTEN_CONFIG : REJIMDE_CONFIG;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: config.gradient1 },
        style,
      ]}
    >
      {/* Decorative circle */}
      <View
        style={[
          styles.circle,
          { backgroundColor: config.gradient2 },
        ]}
      />

      <View style={styles.content}>
        {/* Badge */}
        <View style={styles.badge}>
          <Ionicons name="star" size={10} color={config.gradient1} />
          <Text style={[styles.badgeText, { color: config.gradient1 }]}>{config.badge}</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name={config.icon} size={32} color="#fff" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{config.title}</Text>

        {/* Body */}
        <Text style={styles.body}>{config.body}</Text>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => Linking.openURL(config.url)}
          activeOpacity={0.85}
          style={styles.ctaBtn}
        >
          <Text style={[styles.ctaText, { color: config.gradient1 }]}>{config.cta}</Text>
          <Ionicons name="arrow-forward" size={16} color={config.gradient1} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 220,
    justifyContent: 'flex-end',
  },
  circle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -40,
    right: -30,
    opacity: 0.5,
  },
  content: {
    padding: 22,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
    gap: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconWrap: {
    marginBottom: 10,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 26,
  },
  body: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 19,
    marginBottom: 18,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 8,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
