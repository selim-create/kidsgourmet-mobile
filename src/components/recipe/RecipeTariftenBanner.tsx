import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { RecipeCrossSell } from '../../lib/types';

interface RecipeTariftenBannerProps {
  crossSell: RecipeCrossSell;
  /** Optional style override for the card container (e.g. margins). */
  style?: ViewStyle;
}

export function RecipeTariftenBanner({ crossSell, style }: RecipeTariftenBannerProps) {
  const handlePress = () => {
    Linking.openURL(crossSell.url).catch((err) => {
      console.warn('[RecipeTariftenBanner] Could not open URL:', err);
    });
  };

  return (
    <View style={[styles.card, style]}>
      {/* Decorative circle */}
      <View style={styles.circle} />

      <View style={styles.content}>
        {/* Badge */}
        <View style={styles.badge}>
          <Ionicons name="restaurant-outline" size={10} color="#1E3A5F" />
          <Text style={styles.badgeText}>EBEVEYNLERE ÖZEL</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Bizimkiler Ne Yiyecek?</Text>

        {/* Recipe image + description row */}
        <View style={styles.row}>
          {crossSell.image ? (
            <Image
              source={{ uri: crossSell.image }}
              style={styles.recipeImage}
              contentFit="cover"
            />
          ) : null}

          <View style={styles.textBlock}>
            {/* Description */}
            <Text style={styles.description}>
              {crossSell.ingredient && crossSell.title ? (
                <>
                  {'Artan '}
                  <Text style={styles.bold}>{crossSell.ingredient}</Text>
                  {' ile kendinize harika bir '}
                  <Text style={styles.bold}>{crossSell.title} Tarifi</Text>
                  {' yapabilirsiniz.'}
                </>
              ) : crossSell.title ? (
                <>
                  {'Kendinize harika bir '}
                  <Text style={styles.bold}>{crossSell.title} Tarifi</Text>
                  {' yapabilirsiniz.'}
                </>
              ) : (
                "Tariften.com'da daha fazla tarif keşfedin"
              )}
            </Text>

            {/* Meta row */}
            {(crossSell.prep_time || crossSell.difficulty) ? (
              <View style={styles.meta}>
                {crossSell.prep_time ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.metaText}>{crossSell.prep_time}</Text>
                  </View>
                ) : null}
                {crossSell.difficulty ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="bar-chart-outline" size={13} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.metaText}>{crossSell.difficulty}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.ctaBtn}>
          <Text style={styles.ctaText}>Tarifi Gör (Tariften.com)</Text>
          <Ionicons name="open-outline" size={15} color="#1E3A5F" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#1E3A5F',
  },
  circle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -50,
    right: -40,
    backgroundColor: '#162D4A',
    opacity: 0.6,
  },
  content: {
    padding: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
    gap: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#1E3A5F',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 14,
    lineHeight: 25,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  recipeImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    flexShrink: 0,
    backgroundColor: '#162D4A',
  },
  textBlock: {
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 19,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
    color: '#C4B5FD',
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9333EA',
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 8,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
