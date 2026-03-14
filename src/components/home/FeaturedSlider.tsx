import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useSWR from 'swr';
import { getAllFeatured } from '../../services/featured-service';
import type { FeaturedItem } from '../../services/featured-service';
import { COLORS } from '../../lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

type FeaturedContentType = 'recipe' | 'blog' | 'question' | 'sponsored' | 'ingredient' | 'tool';
type FilterTab = 'all' | FeaturedContentType;

interface MappedFeaturedItem {
  id: number;
  type: FeaturedContentType;
  date: string;
  data: FeaturedItem;
}

const CARD_GAP = 12;

// Static tool card added alongside API data (like web version)
// The `data` field is unused for tool cards; slug is set to navigate to /(tabs)/assistant
const STATIC_TOOL_ITEM: MappedFeaturedItem = {
  id: -1,
  type: 'tool',
  date: '',
  data: {
    id: -1,
    type: 'sponsor', // satisfies FeaturedItem type constraint; unused for tool card rendering
    title: 'Akıllı Asistan',
    slug: 'assistant',
    date: '',
    meta: {},
  },
};

function mapApiTypeToContentType(apiType: FeaturedItem['type']): FeaturedContentType {
  switch (apiType) {
    case 'recipe': return 'recipe';
    case 'post': return 'blog';
    case 'sponsor': return 'sponsored';
    case 'question': return 'question';
    case 'ingredient': return 'ingredient';
    default: return 'blog';
  }
}

// ─── Card Components ──────────────────────────────────────────────────────────

function RecipeFeaturedCard({ item }: { item: MappedFeaturedItem }) {
  const { data } = item;
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/(tabs)/recipes/${data.slug}`)}
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
      <View style={{ position: 'relative' }}>
        {data.image ? (
          <Image
            source={{ uri: data.image }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View style={{ width: '100%', height: 180, backgroundColor: '#FFF3EE', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.primary} />
          </View>
        )}
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="restaurant-outline" size={12} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Tarif</Text>
        </View>
        {data.meta.age_group ? (
          <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: data.meta.age_group_color ?? '#FF8A65', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{data.meta.age_group}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 }} numberOfLines={2}>{data.title}</Text>
        {data.excerpt ? (
          <Text style={{ fontSize: 13, color: COLORS.gray[500], lineHeight: 18 }} numberOfLines={2}>{data.excerpt}</Text>
        ) : null}
        {data.meta.author_name ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Ionicons name="person-circle-outline" size={14} color={COLORS.gray[400]} />
            <Text style={{ fontSize: 12, color: COLORS.gray[400], marginLeft: 4 }}>{data.meta.author_name}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function GuideFeaturedCard({ item }: { item: MappedFeaturedItem }) {
  const { data } = item;
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/blog/${data.slug}`)}
      style={{ width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 10 }}
    >
      <View style={{ position: 'relative' }}>
        {data.image ? (
          <Image source={{ uri: data.image }} style={{ width: '100%', height: 180 }} contentFit="cover" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
        ) : (
          <View style={{ width: '100%', height: 180, backgroundColor: '#EBF5FB', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="newspaper-outline" size={48} color="#2196F3" />
          </View>
        )}
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#2196F3', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="newspaper-outline" size={12} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Rehber</Text>
        </View>
        {data.meta.category ? (
          <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: '#fff', fontSize: 11 }}>{data.meta.category}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 }} numberOfLines={2}>{data.title}</Text>
        {data.excerpt ? (
          <Text style={{ fontSize: 13, color: COLORS.gray[500], lineHeight: 18 }} numberOfLines={2}>{data.excerpt}</Text>
        ) : null}
        {data.meta.author_name ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Ionicons name="person-circle-outline" size={14} color={COLORS.gray[400]} />
            <Text style={{ fontSize: 12, color: COLORS.gray[400], marginLeft: 4 }}>{data.meta.author_name}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function QuestionFeaturedCard({ item }: { item: MappedFeaturedItem }) {
  const { data } = item;
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push('/(tabs)/discover')}
      style={{ width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 10 }}
    >
      <View style={{ width: '100%', height: 180, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Ionicons name="chatbubbles-outline" size={48} color="#9C27B0" />
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#9C27B0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="chatbubbles-outline" size={12} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Soru</Text>
        </View>
        {data.meta.answer_count !== undefined ? (
          <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: '#fff', fontSize: 11 }}>{data.meta.answer_count} yanıt</Text>
          </View>
        ) : null}
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 }} numberOfLines={2}>{data.title}</Text>
        {data.excerpt ? (
          <Text style={{ fontSize: 13, color: COLORS.gray[500], lineHeight: 18 }} numberOfLines={2}>{data.excerpt}</Text>
        ) : null}
        {data.meta.author_name ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Ionicons name="person-circle-outline" size={14} color={COLORS.gray[400]} />
            <Text style={{ fontSize: 12, color: COLORS.gray[400], marginLeft: 4 }}>{data.meta.author_name}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function SponsorFeaturedCard({ item }: { item: MappedFeaturedItem }) {
  const { data } = item;
  const sponsorName = data.meta.sponsor_name ?? data.title;
  const sponsorLogo = data.meta.sponsor_logo;

  const handlePress = () => {
    if (data.meta.sponsor_url) {
      Linking.openURL(data.meta.sponsor_url).catch(() => {/* ignore */});
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={{ width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 10, borderWidth: 2, borderColor: '#334155' }}
    >
      <View style={{ position: 'relative' }}>
        {data.image ? (
          <Image source={{ uri: data.image }} style={{ width: '100%', height: 180 }} contentFit="cover" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
        ) : (
          <View style={{ width: '100%', height: 180, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
            {sponsorLogo ? (
              <Image source={{ uri: sponsorLogo }} style={{ width: 80, height: 80 }} contentFit="contain" />
            ) : (
              <Ionicons name="business-outline" size={48} color="#334155" />
            )}
          </View>
        )}
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#334155', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {sponsorLogo ? (
            <Image source={{ uri: sponsorLogo }} style={{ width: 16, height: 16, borderRadius: 8 }} contentFit="contain" />
          ) : null}
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{sponsorName}</Text>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 }} numberOfLines={2}>{data.title}</Text>
        {data.excerpt ? (
          <Text style={{ fontSize: 13, color: COLORS.gray[500], lineHeight: 18 }} numberOfLines={2}>{data.excerpt}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function IngredientFeaturedCard({ item }: { item: MappedFeaturedItem }) {
  const { data } = item;
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/ingredient/${data.slug}`)}
      style={{ width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 10 }}
    >
      <View style={{ position: 'relative' }}>
        {data.image ? (
          <Image source={{ uri: data.image }} style={{ width: '100%', height: 180 }} contentFit="cover" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
        ) : (
          <View style={{ width: '100%', height: 180, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="leaf-outline" size={48} color="#4CAF50" />
          </View>
        )}
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="leaf-outline" size={12} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Malzeme</Text>
        </View>
        {data.meta.start_age ? (
          <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: '#fff', fontSize: 11 }}>{data.meta.start_age}+</Text>
          </View>
        ) : null}
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 }} numberOfLines={2}>{data.title}</Text>
        {data.excerpt ? (
          <Text style={{ fontSize: 13, color: COLORS.gray[500], lineHeight: 18 }} numberOfLines={2}>{data.excerpt}</Text>
        ) : null}
        {data.meta.allergy_risk ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Ionicons name="warning-outline" size={14} color={COLORS.gray[400]} />
            <Text style={{ fontSize: 12, color: COLORS.gray[400], marginLeft: 4 }}>Alerji riski: {data.meta.allergy_risk}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function ToolFeaturedCard() {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push('/(tabs)/assistant')}
      style={{ width: CARD_WIDTH, backgroundColor: '#EEF2FF', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 10 }}
    >
      <View style={{ width: '100%', height: 180, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Ionicons name="sparkles-outline" size={64} color="#4F46E5" />
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#4F46E5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="sparkles-outline" size={12} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Araçlar</Text>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 }}>Akıllı Asistan</Text>
        <Text style={{ fontSize: 13, color: COLORS.gray[500], lineHeight: 18 }} numberOfLines={2}>
          BLW testi, katı gıda hazırlığı, persentil hesaplama ve daha fazlası
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Ionicons name="arrow-forward-circle-outline" size={14} color="#4F46E5" />
          <Text style={{ fontSize: 12, color: '#4F46E5', marginLeft: 4, fontWeight: '600' }}>Araçlara Git</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Filter Tab Config ────────────────────────────────────────────────────────

interface TabConfig {
  type: FilterTab;
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  activeColor: string;
  activeBg: string;
  inactiveBg: string;
  inactiveColor: string;
}

const TAB_CONFIGS: TabConfig[] = [
  { type: 'all', label: 'Tümü', activeColor: '#fff', activeBg: COLORS.primary, inactiveBg: '#F3F4F6', inactiveColor: COLORS.gray[600] },
  { type: 'recipe', label: 'Tarif', icon: 'restaurant-outline', activeColor: '#fff', activeBg: COLORS.primary, inactiveBg: '#FFF3EE', inactiveColor: COLORS.primary },
  { type: 'blog', label: 'Rehber', icon: 'newspaper-outline', activeColor: '#fff', activeBg: '#2196F3', inactiveBg: '#EBF5FB', inactiveColor: '#2196F3' },
  { type: 'question', label: 'Soru', icon: 'chatbubbles-outline', activeColor: '#fff', activeBg: '#9C27B0', inactiveBg: '#F3E8FF', inactiveColor: '#9C27B0' },
  { type: 'sponsored', label: 'Sponsor', icon: 'business-outline', activeColor: '#fff', activeBg: '#334155', inactiveBg: '#F1F5F9', inactiveColor: '#334155' },
  { type: 'ingredient', label: 'Malzeme', icon: 'leaf-outline', activeColor: '#fff', activeBg: '#4CAF50', inactiveBg: '#E8F5E9', inactiveColor: '#4CAF50' },
  { type: 'tool', label: 'Araçlar', icon: 'sparkles-outline', activeColor: '#fff', activeBg: '#4F46E5', inactiveBg: '#EEF2FF', inactiveColor: '#4F46E5' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function FeaturedSlider() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const { data: apiItems = [] } = useSWR<FeaturedItem[]>('all-featured', () => getAllFeatured(5));

  const allItems: MappedFeaturedItem[] = useMemo(() => [
    ...apiItems.map((item): MappedFeaturedItem => ({
      id: item.id,
      type: mapApiTypeToContentType(item.type),
      date: item.date,
      data: item,
    })),
    STATIC_TOOL_ITEM,
  ], [apiItems]);

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<FeaturedContentType, number>> = {};
    for (const item of allItems) {
      counts[item.type] = (counts[item.type] ?? 0) + 1;
    }
    return counts;
  }, [allItems]);

  const filtered: MappedFeaturedItem[] = useMemo(() =>
    activeTab === 'all' ? allItems : allItems.filter((i) => i.type === activeTab),
    [allItems, activeTab]
  );

  const visibleTabs = TAB_CONFIGS.filter(
    (t) => t.type === 'all' || (typeCounts[t.type as FeaturedContentType] ?? 0) > 0
  );

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (CARD_WIDTH + CARD_GAP));
    setActiveDot(index);
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setActiveDot(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
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
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.type;
          return (
            <TouchableOpacity
              key={tab.type}
              onPress={() => handleTabChange(tab.type)}
              activeOpacity={0.8}
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: 20,
                backgroundColor: isActive ? tab.activeBg : tab.inactiveBg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {tab.icon ? (
                <Ionicons name={tab.icon} size={13} color={isActive ? tab.activeColor : tab.inactiveColor} />
              ) : null}
              <Text style={{ fontSize: 13, fontWeight: '600', color: isActive ? tab.activeColor : tab.inactiveColor }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
            {filtered.map((item, idx) => {
              if (item.type === 'recipe') {
                return <RecipeFeaturedCard key={`${item.type}-${item.id}-${idx}`} item={item} />;
              } else if (item.type === 'blog') {
                return <GuideFeaturedCard key={`${item.type}-${item.id}-${idx}`} item={item} />;
              } else if (item.type === 'question') {
                return <QuestionFeaturedCard key={`${item.type}-${item.id}-${idx}`} item={item} />;
              } else if (item.type === 'sponsored') {
                return <SponsorFeaturedCard key={`${item.type}-${item.id}-${idx}`} item={item} />;
              } else if (item.type === 'ingredient') {
                return <IngredientFeaturedCard key={`${item.type}-${item.id}-${idx}`} item={item} />;
              } else {
                return <ToolFeaturedCard key={`tool-${idx}`} />;
              }
            })}
          </ScrollView>

          {/* Pagination info + dots */}
          {filtered.length > 1 && (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: COLORS.gray[400], marginBottom: 6 }}>
                {activeDot + 1} / {filtered.length} • Kaydırarak Keşfet
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
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
