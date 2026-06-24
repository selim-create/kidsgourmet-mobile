import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { searchService } from '../src/services/search-service';
import { useAgeGroups } from '../src/hooks/useAgeGroups';
import { COLORS } from '../src/lib/constants';
import type {
  SearchResponse,
  RecipeSearchResult,
  IngredientSearchResult,
  PostSearchResult,
  DiscussionSearchResult,
} from '../src/lib/types';

type TabKey = 'all' | 'recipes' | 'ingredients' | 'posts' | 'discussions';

const POPULAR_SEARCHES = [
  'Avokado',
  'BLW tarifleri',
  'Kahvaltı',
  'Çorba',
  '+6 ay',
  'Parmak yiyecekler',
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; age?: string }>();

  const [searchTerm, setSearchTerm] = useState(params.q ?? '');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(
    params.age ? params.age.split(',').filter(Boolean) : [],
  );
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ageGroups } = useAgeGroups();

  const doSearch = useCallback(
    async (q: string, ageGroupSlugs: string[] = []) => {
      if (!q.trim()) {
        setSearchData(null);
        return;
      }
      setLoading(true);
      try {
        const result = await searchService.search({
          q: q.trim(),
          type: 'all',
          age_group: ageGroupSlugs.length > 0 ? ageGroupSlugs.join(',') : undefined,
          per_page: 50,
        });
        setSearchData(result);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Run search when URL param changes (e.g. navigating from modal)
  useEffect(() => {
    if (params.q) {
      setSearchTerm(params.q);
      doSearch(params.q, selectedAgeGroups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.setParams({ q: text.trim() || undefined });
      doSearch(text, selectedAgeGroups);
    }, 500);
  };

  const handlePopularPress = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchData(null);
    router.setParams({ q: undefined });
  };

  const toggleAgeGroup = (slug: string) => {
    const next = selectedAgeGroups.includes(slug)
      ? selectedAgeGroups.filter((s) => s !== slug)
      : [...selectedAgeGroups, slug];
    setSelectedAgeGroups(next);
    router.setParams({ age: next.join(',') || undefined });
    doSearch(searchTerm, next);
  };

  const counts = searchData?.counts ?? {
    total: 0,
    recipes: 0,
    ingredients: 0,
    posts: 0,
    discussions: 0,
  };

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'Tümü', count: counts.total },
    { key: 'recipes', label: 'Tarifler', count: counts.recipes },
    { key: 'ingredients', label: 'Malzemeler', count: counts.ingredients },
    { key: 'posts', label: 'Blog & Rehber', count: counts.posts },
    { key: 'discussions', label: 'Topluluk', count: counts.discussions },
  ];

  const hasQuery = searchTerm.trim().length > 0;
  const hasResults = (searchData?.counts.total ?? 0) > 0;

  const showIngredients =
    activeTab === 'all' || activeTab === 'ingredients';
  const showRecipes = activeTab === 'all' || activeTab === 'recipes';
  const showPosts = activeTab === 'all' || activeTab === 'posts';
  const showDiscussions = activeTab === 'all' || activeTab === 'discussions';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* Sticky Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text className="text-dark text-xl font-bold flex-1">Arama</Text>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            value={searchTerm}
            onChangeText={handleChangeText}
            placeholder="Tarif, malzeme veya blog yazısı arayın..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 py-3 text-dark"
            returnKeyType="search"
            onSubmitEditing={() => doSearch(searchTerm, selectedAgeGroups)}
            autoFocus={!hasQuery}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.8}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs (only when there are results) */}
        {hasResults && !loading && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ paddingRight: 8, gap: 8 }}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
                className={`px-4 py-1.5 rounded-full border ${
                  activeTab === tab.key
                    ? 'bg-slate-800 border-slate-800'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.key ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Empty state — no query */}
        {!hasQuery && !loading && (
          <View className="pt-4">
            <Text className="text-dark font-bold text-xl mb-1">Ne aramak istersiniz?</Text>
            <Text className="text-gray-400 text-sm mb-5">
              Tarif, malzeme veya blog yazısı arayabilirsiniz
            </Text>
            <Text className="text-dark font-bold text-base mb-3">Popüler Aramalar</Text>
            <View className="flex-row flex-wrap gap-2">
              {POPULAR_SEARCHES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => handlePopularPress(s)}
                  activeOpacity={0.8}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2"
                  style={{ elevation: 1 }}
                >
                  <Text className="text-dark text-sm">{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Loading state */}
        {loading && (
          <View className="items-center py-10">
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text className="text-gray-400 text-sm mt-3">Aranıyor...</Text>
          </View>
        )}

        {/* No results state */}
        {hasQuery && !loading && searchData && !hasResults && (
          <View className="items-center py-12">
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text className="text-dark font-bold text-lg mt-4">Sonuç bulunamadı</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              "{searchTerm}" için sonuç bulunamadı.{'\n'}Başka bir terim deneyin.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/recipes')}
              activeOpacity={0.8}
              className="mt-5 bg-primary rounded-2xl px-6 py-3"
            >
              <Text className="text-white font-semibold">Tüm Tariflere Göz At</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results state */}
        {hasQuery && !loading && hasResults && searchData && (
          <View>
            {/* Meta */}
            <View className="mb-3">
              <Text className="text-dark text-base">
                <Text className="text-primary font-bold">"{searchData.query}"</Text>
                {' için sonuçlar'}
              </Text>
              <Text className="text-gray-400 text-sm mt-0.5">
                Toplam {counts.total} sonuç bulundu
              </Text>
            </View>

            {/* Age Group Filter Chips */}
            {ageGroups.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
                contentContainerStyle={{ gap: 8, paddingRight: 4 }}
              >
                {ageGroups.map((ag) => (
                  <TouchableOpacity
                    key={ag.id}
                    onPress={() => toggleAgeGroup(ag.slug)}
                    activeOpacity={0.8}
                    className={`px-4 py-1.5 rounded-full border ${
                      selectedAgeGroups.includes(ag.slug)
                        ? 'bg-primary border-primary'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedAgeGroups.includes(ag.slug) ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {ag.name ?? ag.slug}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Ingredients section */}
            {showIngredients && searchData.categorized.ingredients.length > 0 && (
              <View className="mb-5">
                <Text className="text-dark font-bold text-base mb-3">
                  Malzeme Rehberi ({searchData.categorized.ingredients.length})
                </Text>
                {searchData.categorized.ingredients.map((item: IngredientSearchResult) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/ingredients/${item.slug}` as any)}
                    activeOpacity={0.8}
                    className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex-row items-center"
                    style={{ elevation: 1 }}
                  >
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: 56, height: 56, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="bg-gray-100 rounded-xl items-center justify-center"
                        style={{ width: 56, height: 56 }}
                      >
                        <Ionicons name="leaf-outline" size={24} color="#9CA3AF" />
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <Text className="text-dark font-semibold text-sm" numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.excerpt ? (
                        <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={2}>
                          {item.excerpt}
                        </Text>
                      ) : null}
                      {item.age_group ? (
                        <Text className="text-primary text-xs mt-1">{item.age_group}</Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recipes section */}
            {showRecipes && searchData.categorized.recipes.length > 0 && (
              <View className="mb-5">
                <Text className="text-dark font-bold text-base mb-3">
                  Tarifler ({searchData.categorized.recipes.length})
                </Text>
                {searchData.categorized.recipes.map((item: RecipeSearchResult) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/(tabs)/recipes/${item.slug}` as any)}
                    activeOpacity={0.8}
                    className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex-row items-center"
                    style={{ elevation: 1 }}
                  >
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: 56, height: 56, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="bg-gray-100 rounded-xl items-center justify-center"
                        style={{ width: 56, height: 56 }}
                      >
                        <Ionicons name="restaurant-outline" size={24} color="#9CA3AF" />
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <Text className="text-dark font-semibold text-sm" numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.age_group ? (
                        <Text className="text-primary text-xs mt-0.5">{item.age_group}</Text>
                      ) : null}
                      {item.prep_time ? (
                        <Text className="text-gray-400 text-xs mt-0.5">
                          <Ionicons name="time-outline" size={10} color="#9CA3AF" /> {item.prep_time}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Posts section */}
            {showPosts && searchData.categorized.posts.length > 0 && (
              <View className="mb-5">
                <Text className="text-dark font-bold text-base mb-3">
                  Blog & Rehber ({searchData.categorized.posts.length})
                </Text>
                {searchData.categorized.posts.map((item: PostSearchResult) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/blog/${item.slug}` as any)}
                    activeOpacity={0.8}
                    className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex-row items-center"
                    style={{ elevation: 1 }}
                  >
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: 56, height: 56, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="bg-gray-100 rounded-xl items-center justify-center"
                        style={{ width: 56, height: 56 }}
                      >
                        <Ionicons name="document-text-outline" size={24} color="#9CA3AF" />
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <Text className="text-dark font-semibold text-sm" numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.excerpt ? (
                        <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={2}>
                          {item.excerpt}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Discussions section */}
            {showDiscussions && searchData.categorized.discussions.length > 0 && (
              <View className="mb-5">
                <Text className="text-dark font-bold text-base mb-3">
                  Topluluk ({searchData.categorized.discussions.length})
                </Text>
                {searchData.categorized.discussions.map((item: DiscussionSearchResult) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/topluluk/${item.slug}` as any)}
                    activeOpacity={0.8}
                    className="bg-white rounded-2xl border border-gray-100 p-4 mb-3"
                    style={{ elevation: 1 }}
                  >
                    <Text className="text-dark font-semibold text-sm" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View className="flex-row items-center mt-1 gap-3">
                      <Text className="text-gray-400 text-xs">{item.author}</Text>
                      <Text className="text-gray-300 text-xs">•</Text>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="chatbubble-outline" size={10} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs">{item.comment_count}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
