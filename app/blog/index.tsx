import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBlog } from '../../src/hooks/use-blog';
import { useBlogCategories } from '../../src/hooks/use-blog-categories';
import { BlogCard } from '../../src/components/blog/BlogCard';
import { CategoryChips } from '../../src/components/blog/CategoryChips';
import { NewsletterBanner } from '../../src/components/blog/NewsletterBanner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { COLORS } from '../../src/lib/constants';
import { useSWRConfig } from 'swr';

export default function BlogListScreen() {
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const { mutate } = useSWRConfig();

  const { categories } = useBlogCategories();
  const categoryParam = activeCategory === 'all' ? undefined : String(activeCategory);
  const { posts, totalPages, isLoading } = useBlog(page, 10, categoryParam);

  const handleCategoryChange = (id: number | 'all') => {
    setActiveCategory(id);
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
      </View>

      {/* Category chips */}
      <View className="bg-white border-b border-gray-100">
        <CategoryChips
          categories={categories}
          activeId={activeCategory}
          onSelect={handleCategoryChange}
        />
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
            <BlogCard
              post={posts[0]}
              variant={posts[0].sponsor_data?.is_sponsored ? 'sponsored' : 'hero'}
            />

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

            {/* Newsletter banner */}
            <NewsletterBanner source="mobile_blog" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
