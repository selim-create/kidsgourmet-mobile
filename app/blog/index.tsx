import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBlog } from '../../src/hooks/use-blog';
import { BlogCard } from '../../src/components/blog/BlogCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { COLORS } from '../../src/lib/constants';
import { useSWRConfig } from 'swr';

const CATEGORIES = [
  { key: undefined, label: 'Tümü' },
  { key: 'beslenme', label: 'Beslenme' },
  { key: 'gelisim', label: 'Gelişim' },
  { key: 'saglik', label: 'Sağlık' },
  { key: 'tarifler', label: 'Tarifler' },
  { key: 'rehber', label: 'Rehber' },
];

export default function BlogListScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const { mutate } = useSWRConfig();

  const { posts, totalPages, isLoading } = useBlog(page, 10, selectedCategory);

  const handleCategoryChange = (cat?: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate(() => true, undefined, { revalidate: true });
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-light">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
            </TouchableOpacity>
            <Text className="text-dark text-xl font-bold">Blog & Keşfet</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/search')} activeOpacity={0.8}>
            <Ionicons name="search-outline" size={22} color={COLORS.dark} />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              onPress={() => handleCategoryChange(cat.key)}
              activeOpacity={0.8}
              className={`mr-2 px-4 py-1.5 rounded-full border ${
                selectedCategory === cat.key
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat.key ? 'text-white' : 'text-gray-500'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {isLoading && page === 1 ? (
          <View className="items-center py-12">
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text className="text-gray-400 text-sm mt-3">Yazılar yükleniyor...</Text>
          </View>
        ) : posts.length === 0 ? (
          <EmptyState
            icon="newspaper-outline"
            title="Yazı bulunamadı"
            description="Bu kategoride henüz yazı yok."
          />
        ) : (
          <>
            {/* Hero card for first post */}
            <BlogCard post={posts[0]} hero />

            {/* Rest of posts */}
            {posts.slice(1).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <View className="flex-row items-center justify-center gap-3 mt-2 mb-4">
                <TouchableOpacity
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  activeOpacity={0.8}
                  className={`w-10 h-10 rounded-full items-center justify-center border ${
                    page === 1 ? 'border-gray-200 opacity-40' : 'border-primary'
                  }`}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={page === 1 ? '#D1D5DB' : COLORS.primary}
                  />
                </TouchableOpacity>

                <Text className="text-dark font-medium text-sm">
                  {page} / {totalPages}
                </Text>

                <TouchableOpacity
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  activeOpacity={0.8}
                  className={`w-10 h-10 rounded-full items-center justify-center border ${
                    page === totalPages ? 'border-gray-200 opacity-40' : 'border-primary'
                  }`}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={page === totalPages ? '#D1D5DB' : COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
