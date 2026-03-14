import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useSWR from 'swr';
import { getFeaturedRecipes } from '../../services/featured-service';
import { getBlogPosts } from '../../services/blog-service';
import type { Recipe, BlogPost } from '../../lib/types';
import { COLORS } from '../../lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

type FilterTab = 'Tümü' | 'Tarif' | 'Rehber';
const FILTER_TABS: FilterTab[] = ['Tümü', 'Tarif', 'Rehber'];

type FeaturedItem =
  | { type: 'recipe'; data: Recipe }
  | { type: 'blog'; data: BlogPost };

const CARD_GAP = 12;

function RecipeFeaturedCard({ recipe }: { recipe: Recipe }) {
  const ageGroup = recipe.age_groups?.[0];
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/(tabs)/recipes/${recipe.slug}`)}
      style={{
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      }}
    >
      {/* Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
          style={{ width: '100%', height: 180 }}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        {/* Type badge */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: COLORS.primary,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Ionicons name="restaurant-outline" size={12} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Tarif</Text>
        </View>
        {/* Age badge */}
        {ageGroup && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: ageGroup.color ?? '#FF8A65',
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
              {ageGroup.name}
            </Text>
          </View>
        )}
      </View>
      {/* Content */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 }} numberOfLines={2}>
          {recipe.title}
        </Text>
        {recipe.excerpt ? (
          <Text style={{ fontSize: 13, color: COLORS.gray[500], lineHeight: 18 }} numberOfLines={2}>
            {recipe.excerpt}
          </Text>
        ) : null}
        {recipe.author && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Ionicons name="person-circle-outline" size={14} color={COLORS.gray[400]} />
            <Text style={{ fontSize: 12, color: COLORS.gray[400], marginLeft: 4 }}>
              {recipe.author.name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function BlogFeaturedCard({ post }: { post: BlogPost }) {
  const category = post.categories?.[0];
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/blog/${post.slug}`)}
      style={{
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      }}
    >
      {/* Image */}
      <View style={{ position: 'relative' }}>
        {post.featured_image || post.thumbnail ? (
          <Image
            source={{ uri: post.featured_image ?? post.thumbnail }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 180,
              backgroundColor: '#EBF5FB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="newspaper-outline" size={48} color="#2196F3" />
          </View>
        )}
        {/* Type badge */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: '#2196F3',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Ionicons name="newspaper-outline" size={12} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Rehber</Text>
        </View>
        {/* Category badge */}
        {category && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(0,0,0,0.55)',
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11 }}>{category.name}</Text>
          </View>
        )}
      </View>
      {/* Content */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 }} numberOfLines={2}>
          {post.title}
        </Text>
        {post.excerpt ? (
          <Text style={{ fontSize: 13, color: COLORS.gray[500], lineHeight: 18 }} numberOfLines={2}>
            {post.excerpt}
          </Text>
        ) : null}
        {post.author && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Ionicons name="person-circle-outline" size={14} color={COLORS.gray[400]} />
            <Text style={{ fontSize: 12, color: COLORS.gray[400], marginLeft: 4 }}>
              {post.author.name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function FeaturedSlider() {
  const [activeTab, setActiveTab] = useState<FilterTab>('Tümü');
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const { data: featuredRecipes } = useSWR<Recipe[]>('featured-recipes', getFeaturedRecipes);
  const { data: blogData } = useSWR('featured-blog', () => getBlogPosts(1, 5));

  const allItems: FeaturedItem[] = [
    ...(featuredRecipes ?? []).map((r): FeaturedItem => ({ type: 'recipe', data: r })),
    ...(blogData?.items ?? []).map((p): FeaturedItem => ({ type: 'blog', data: p })),
  ];

  const filtered: FeaturedItem[] =
    activeTab === 'Tümü'
      ? allItems
      : activeTab === 'Tarif'
      ? allItems.filter((i) => i.type === 'recipe')
      : allItems.filter((i) => i.type === 'blog');

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (CARD_WIDTH + 12));
    setActiveDot(index);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.dark }}>
          Günün Öne Çıkanları
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.gray[500], marginTop: 3 }}>
          Tarifler, Rehberler, Soru-Cevaplar ve Araçlar, hepsi burada!
        </Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 2 }}
        style={{ marginBottom: 14 }}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              setActiveDot(0);
              scrollRef.current?.scrollTo({ x: 0, animated: false });
            }}
            activeOpacity={0.8}
            style={{
              paddingVertical: 7,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: activeTab === tab ? COLORS.primary : '#F3F4F6',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: activeTab === tab ? '#fff' : COLORS.gray[600],
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cards */}
      {filtered.length > 0 ? (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            contentContainerStyle={{ paddingHorizontal: 20, gap: CARD_GAP }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {filtered.map((item, idx) =>
              item.type === 'recipe' ? (
                <RecipeFeaturedCard key={`r-${item.data.id}-${idx}`} recipe={item.data} />
              ) : (
                <BlogFeaturedCard key={`b-${item.data.id}-${idx}`} post={item.data} />
              ),
            )}
          </ScrollView>

          {/* Pagination dots */}
          {filtered.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 12,
                gap: 6,
              }}
            >
              {filtered.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: activeDot === i ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: activeDot === i ? COLORS.primary : '#D1D5DB',
                  }}
                />
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={{ paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center' }}>
          <Ionicons name="star-outline" size={40} color={COLORS.gray[300]} />
          <Text style={{ color: COLORS.gray[400], marginTop: 8, fontSize: 14 }}>
            İçerik yükleniyor...
          </Text>
        </View>
      )}
    </View>
  );
}
