import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { search } from '../src/services/search-service';
import { RecipeCard } from '../src/components/recipes/RecipeCard';
import { BlogCard } from '../src/components/blog/BlogCard';
import { COLORS } from '../src/lib/constants';
import type { Recipe, BlogPost } from '../src/lib/types';

type TabKey = 'all' | 'recipes' | 'blog';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'recipes', label: 'Tarifler' },
  { key: 'blog', label: 'Blog' },
];

const SUGGESTED = [
  'Bebek püresi',
  'Portakal',
  'Avokado',
  'Mercimek',
  'Yoğurt',
  'Elma',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setRecipes([]);
      setBlogPosts([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const result = await search({ query: q, per_page: 20 });
      setRecipes(result.recipes ?? []);
      setBlogPosts(result.blog_posts ?? []);
    } catch {
      setRecipes([]);
      setBlogPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text), 500);
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    doSearch(s);
  };

  const handleClear = () => {
    setQuery('');
    setRecipes([]);
    setBlogPosts([]);
    setHasSearched(false);
  };

  const visibleRecipes = activeTab === 'blog' ? [] : recipes;
  const visibleBlog = activeTab === 'recipes' ? [] : blogPosts;
  const total = visibleRecipes.length + visibleBlog.length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-light">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text className="text-dark text-xl font-bold">Arama</Text>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 mt-3 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            value={query}
            onChangeText={handleChangeText}
            placeholder="Tarif, malzeme veya blog ara..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 py-3 text-dark"
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.8}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        {hasSearched && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
                className={`mr-2 px-4 py-1.5 rounded-full border ${
                  activeTab === tab.key
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.key ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
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
        {/* Loading state */}
        {isLoading && (
          <View className="items-center py-10">
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text className="text-gray-400 text-sm mt-3">Aranıyor...</Text>
          </View>
        )}

        {/* Suggestions (before search) */}
        {!hasSearched && !isLoading && (
          <View>
            <Text className="text-dark font-bold text-base mb-3">Önerilen Aramalar</Text>
            <View className="flex-row flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => handleSuggestion(s)}
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

        {/* No results */}
        {hasSearched && !isLoading && total === 0 && (
          <View className="items-center py-12">
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text className="text-dark font-bold text-lg mt-4">Sonuç bulunamadı</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              "{query}" için arama sonucu yok.{'\n'}Farklı bir kelime deneyin.
            </Text>
          </View>
        )}

        {/* Results */}
        {hasSearched && !isLoading && total > 0 && (
          <View>
            {/* Recipes section */}
            {visibleRecipes.length > 0 && (
              <View className="mb-4">
                {activeTab === 'all' && (
                  <Text className="text-dark font-bold text-base mb-3">
                    Tarifler ({visibleRecipes.length})
                  </Text>
                )}
                {visibleRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </View>
            )}

            {/* Blog section */}
            {visibleBlog.length > 0 && (
              <View>
                {activeTab === 'all' && (
                  <Text className="text-dark font-bold text-base mb-3">
                    Blog ({visibleBlog.length})
                  </Text>
                )}
                {visibleBlog.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
