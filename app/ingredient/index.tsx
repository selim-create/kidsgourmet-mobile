import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useIngredients } from '../../src/hooks/useIngredients';
import { IngredientCard } from '../../src/components/ingredients/IngredientCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { COLORS } from '../../src/lib/constants';
import type { IngredientGuideItem } from '../../src/lib/types';

// ─── Category icon map ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  Sebzeler: 'leaf-outline',
  Meyveler: 'nutrition-outline',
  'Et ve Balık': 'fish-outline',
  'Tahıllar ve Baklagiller': 'grid-outline',
  'Süt Ürünleri': 'water-outline',
  'Yağlar ve Kuruyemişler': 'ellipse-outline',
  Tümü: 'apps-outline',
};

function getCategoryIcon(
  cat: string,
): React.ComponentProps<typeof Ionicons>['name'] {
  return CATEGORY_ICONS[cat] ?? 'pricetag-outline';
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

const SEASONS = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];

const SEASON_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  İlkbahar: 'flower-outline',
  Yaz: 'sunny-outline',
  Sonbahar: 'leaf-outline',
  Kış: 'snow-outline',
};

// ─── Quick Guides ─────────────────────────────────────────────────────────────

const QUICK_GUIDES = [
  { title: 'Ek Gıda Rehberi', icon: 'leaf-outline' as const, color: '#7CB342', bg: '#F0FDF4', route: '/food-guide' },
  { title: 'Büyüme Takibi', icon: 'trending-up-outline' as const, color: '#0EA5E9', bg: '#E0F2FE', route: '/growth' },
  { title: 'Aşı Takvimi', icon: 'medical-outline' as const, color: '#EF4444', bg: '#FEF2F2', route: '/vaccines' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function IngredientListScreen() {
  const {
    ingredients,
    categories,
    isLoading,
    isLoadingMore,
    hasMore,
    totalItems,
    error,
    activeCategory,
    setActiveCategory,
    activeSeasons,
    toggleSeason,
    clearSeasons,
    searchQuery,
    setSearchQuery,
    loadMore,
    refresh,
  } = useIngredients();

  const scrollRef = useRef<FlatList>(null);

  // ─── Header / Sticky content rendered via FlatList ListHeaderComponent ────

  const ListHeader = (
    <View>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        {/* Badge */}
        <View style={styles.heroBadge}>
          <Ionicons name="leaf" size={12} color="#16A34A" />
          <Text style={styles.heroBadgeText}>GIDALAR</Text>
        </View>

        {/* Title */}
        <Text style={styles.heroTitle}>Beslenme Rehberi</Text>

        {/* Description */}
        <Text style={styles.heroDesc}>
          Bebeğinizin sağlıklı beslenmesi için 200+ gıda hakkında kapsamlı bilgi, besin değerleri ve tarif önerileri.
        </Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Gıda ara..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.8}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Diğer Rehberler ─────────────────────────────────────────── */}
      <View style={styles.quickGuidesContainer}>
        <Text style={styles.quickGuidesTitle}>Diğer Rehberler</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickGuidesScroll}
        >
          {QUICK_GUIDES.map((guide) => (
            <TouchableOpacity
              key={guide.title}
              style={[styles.quickGuideCard, { backgroundColor: guide.bg }]}
              activeOpacity={0.8}
              onPress={() => router.push(guide.route as never)}
            >
              <View style={[styles.quickGuideIconWrap, { backgroundColor: guide.color + '22' }]}>
                <Ionicons name={guide.icon} size={20} color={guide.color} />
              </View>
              <Text style={styles.quickGuideText} numberOfLines={2}>
                {guide.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Filtre Çubuğu ───────────────────────────────────────────── */}
      <View style={styles.filterBar}>
        {/* Kategori filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
                style={[
                  styles.chip,
                  active ? styles.chipActive : styles.chipPassive,
                ]}
              >
                <Ionicons
                  name={getCategoryIcon(cat)}
                  size={14}
                  color={active ? '#fff' : '#6B7280'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Mevsim filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterScroll, { marginTop: 8 }]}
        >
          {activeSeasons.length > 0 && (
            <TouchableOpacity
              onPress={clearSeasons}
              activeOpacity={0.8}
              style={[styles.chip, styles.chipPassive, { marginRight: 6 }]}
            >
              <Ionicons name="close" size={14} color="#6B7280" style={{ marginRight: 2 }} />
              <Text style={styles.chipText}>Temizle</Text>
            </TouchableOpacity>
          )}
          {SEASONS.map((s) => {
            const active = activeSeasons.includes(s);
            return (
              <TouchableOpacity
                key={s}
                onPress={() => toggleSeason(s)}
                activeOpacity={0.8}
                style={[
                  styles.chip,
                  active ? styles.chipSeasonActive : styles.chipPassive,
                ]}
              >
                <Ionicons
                  name={SEASON_ICONS[s]}
                  size={14}
                  color={active ? '#fff' : '#6B7280'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Sayım ────────────────────────────────────────────────────── */}
      {!isLoading && !error && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>{totalItems} gıda</Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        {isLoadingMore ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <TouchableOpacity
            onPress={loadMore}
            activeOpacity={0.8}
            style={styles.loadMoreBtn}
          >
            <Text style={styles.loadMoreText}>Daha Fazla Göster</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: IngredientGuideItem }) => (
    <IngredientCard item={item} />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    if (error) {
      return (
        <EmptyState
          icon="wifi-outline"
          title="Gıdalar yüklenemedi"
          description="Daha sonra tekrar deneyin."
        />
      );
    }
    return (
      <EmptyState
        icon="nutrition-outline"
        title="Gıda bulunamadı"
        description={
          searchQuery
            ? `"${searchQuery}" için sonuç yok.`
            : 'Farklı bir filtre deneyin.'
        }
      />
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {isLoading && ingredients.length === 0 ? (
        <View style={{ flex: 1 }}>
          {ListHeader}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 12 }}>
              Yükleniyor...
            </Text>
          </View>
        </View>
      ) : (
        <Animated.FlatList
          ref={scrollRef}
          data={ingredients}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onRefresh={refresh}
          refreshing={isLoading}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Hero
  hero: {
    backgroundColor: '#F0FFF4',
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#BBF7D0',
    opacity: 0.5,
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#86EFAC',
    opacity: 0.3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  // Quick Guides
  quickGuidesContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickGuidesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quickGuidesScroll: {
    gap: 10,
    paddingRight: 8,
  },
  quickGuideCard: {
    width: 130,
    height: 76,
    borderRadius: 16,
    padding: 10,
    justifyContent: 'space-between',
  },
  quickGuideIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGuideText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 16,
  },
  // Filter bar
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  chipPassive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  chipSeasonActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  // List
  listContent: {
    paddingBottom: 32,
  },
  countRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  countText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // Load more
  loadMoreBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

