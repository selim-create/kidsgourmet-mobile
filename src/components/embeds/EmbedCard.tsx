import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type {
  EmbedItem,
  RecipeEmbedItem,
  IngredientEmbedItem,
  ToolEmbedItem,
  PostEmbedItem,
} from '../../lib/types';

// ─── Age Group Colors (ported from web) ───────────────────────────────────────

const AGE_GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  '6+ Ay': { bg: '#FEF3C7', text: '#B45309' },
  '8+ Ay': { bg: '#FEF3C7', text: '#B45309' },
  '10+ Ay': { bg: '#DBEAFE', text: '#1D4ED8' },
  '12+ Ay': { bg: '#DCFCE7', text: '#15803D' },
  '18+ Ay': { bg: '#F3E8FF', text: '#7E22CE' },
  '2+ Yaş': { bg: '#FFE4E6', text: '#BE123C' },
  '3+ Yaş': { bg: '#FFEDD5', text: '#C2410C' },
  'Tüm Yaşlar': { bg: '#F0FDF4', text: '#166534' },
};

function getAgeGroupColors(ageGroup: string | null): { bg: string; text: string } {
  if (!ageGroup) return { bg: '#F3F4F6', text: '#6B7280' };
  return AGE_GROUP_COLORS[ageGroup] ?? { bg: '#F3F4F6', text: '#6B7280' };
}

// ─── Tool URL Mapping (ported from web) ───────────────────────────────────────

const TOOL_URL_MAPPING: Record<string, string> = {
  blw_test: '/blw-test',
  'blw-test': '/blw-test',
  safety_check: '/safety-check',
  'safety-check': '/safety-check',
  food_guide: '/food-guide',
  'food-guide': '/food-guide',
  growth: '/growth',
  growth_tracker: '/growth',
  vaccines: '/vaccines',
  vaccine_tracker: '/vaccines',
  shopping_list: '/shopping-list',
  'shopping-list': '/shopping-list',
};

function handleToolPress(item: ToolEmbedItem) {
  const internalRoute = TOOL_URL_MAPPING[item.tool_type] ?? TOOL_URL_MAPPING[item.slug];
  if (internalRoute) {
    router.push(internalRoute as Parameters<typeof router.push>[0]);
  } else {
    Linking.openURL(item.url).catch(() => {});
  }
}

// ─── Card Components ──────────────────────────────────────────────────────────

function RecipeCard({ item }: { item: RecipeEmbedItem }) {
  const colors = getAgeGroupColors(item.age_group);
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/(tabs)/recipes/[slug]', params: { slug: item.slug } })}
      android_ripple={{ color: '#E5E7EB' }}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="restaurant-outline" size={28} color="#AED581" />
        </View>
      )}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.badgeRow}>
          {item.age_group ? (
            <View style={[styles.badge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>{item.age_group}</Text>
            </View>
          ) : null}
          {item.prep_time ? (
            <Text style={styles.subInfo}>⏱ {item.prep_time}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function IngredientCard({ item }: { item: IngredientEmbedItem }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/ingredients/[slug]', params: { slug: item.slug } })}
      android_ripple={{ color: '#E5E7EB' }}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="leaf-outline" size={28} color="#AED581" />
        </View>
      )}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.start_age ? (
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.badgeText, { color: '#15803D' }]}>{item.start_age}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function ToolCard({ item }: { item: ToolEmbedItem }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => handleToolPress(item)}
      android_ripple={{ color: '#E5E7EB' }}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      <View style={[styles.image, styles.toolPlaceholder]}>
        <Ionicons name="sparkles" size={28} color="#fff" />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.excerpt ? (
          <Text style={styles.subInfo} numberOfLines={2}>{item.excerpt}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function PostCard({ item }: { item: PostEmbedItem }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/blog/[slug]', params: { slug: item.slug } })}
      android_ripple={{ color: '#E5E7EB' }}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="newspaper-outline" size={28} color="#AED581" />
        </View>
      )}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.badgeRow}>
          {item.category ? (
            <View style={[styles.badge, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.badgeText, { color: '#2563EB' }]}>{item.category.name}</Text>
            </View>
          ) : null}
          {item.read_time ? (
            <Text style={styles.subInfo}>{item.read_time} dk okuma</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// ─── EmbedCard ────────────────────────────────────────────────────────────────

export function EmbedCard({ item }: { item: EmbedItem }) {
  switch (item.embed_type) {
    case 'recipe':
      return <RecipeCard item={item} />;
    case 'ingredient':
      return <IngredientCard item={item} />;
    case 'tool':
      return <ToolCard item={item} />;
    case 'post':
      return <PostCard item={item} />;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.75,
  },
  image: {
    width: 96,
    height: 96,
    flexShrink: 0,
  },
  imagePlaceholder: {
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPlaceholder: {
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
});
