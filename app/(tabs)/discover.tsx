import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { BlogCard } from '../../src/components/blog/BlogCard';
import { CategoryChips } from '../../src/components/blog/CategoryChips';
import { NewsletterBanner } from '../../src/components/blog/NewsletterBanner';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useBlog } from '../../src/hooks/use-blog';
import { useBlogCategories } from '../../src/hooks/use-blog-categories';
import { COLORS } from '../../src/lib/constants';

export default function DiscoverScreen() {
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const { categories } = useBlogCategories();

  const categoryParam = activeCategory === 'all' ? undefined : String(activeCategory);
  const { posts, isLoading } = useBlog(1, 10, categoryParam);

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero header */}
        <View style={styles.heroHeader}>
          <Text style={styles.heroSuperTitle}>Ebeveyn Kütüphanesi</Text>
          <Text style={styles.heroTitle}>
            {'Bilgili Ebeveynler\n'}
            <Text style={styles.heroTitleOrange}>Mutlu Çocuklar</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Uzmanlardan bilgiler, güncel rehberler, beslenme ipuçları ve gelişim notları.
          </Text>
        </View>

        {/* Category chips */}
        <CategoryChips
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Blog posts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Yazılar</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/blog')}>
              <Text style={styles.seeAll}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            posts.map((post) => <BlogCard key={post.id} post={post} />)
          )}
        </View>

        {/* Nutrition guide shortcut */}
        <TouchableOpacity
          style={styles.bigCard}
          activeOpacity={0.8}
          onPress={() => router.push('/ingredient')}
        >
          <View style={[styles.bigCardIcon, { backgroundColor: COLORS.secondary + '33' }]}>
            <Ionicons name="nutrition-outline" size={32} color={COLORS.secondary} />
          </View>
          <View style={styles.bigCardText}>
            <Text style={styles.bigCardTitle}>Beslenme Rehberi</Text>
            <Text style={styles.bigCardDesc}>Bebeğiniz için doğru besinleri keşfedin</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[300]} />
        </TouchableOpacity>

        {/* Trending recipes shortcut */}
        <TouchableOpacity
          style={styles.bigCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/recipes')}
        >
          <View style={[styles.bigCardIcon, { backgroundColor: COLORS.primary + '22' }]}>
            <Ionicons name="restaurant-outline" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.bigCardText}>
            <Text style={styles.bigCardTitle}>Popüler Tarifler</Text>
            <Text style={styles.bigCardDesc}>Yüzlerce sağlıklı ve lezzetli tarif</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[300]} />
        </TouchableOpacity>

        {/* Newsletter banner */}
        <NewsletterBanner source="mobile_discover" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  content: {
    paddingBottom: 100,
  },
  heroHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  heroSuperTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 33,
    marginBottom: 10,
  },
  heroTitleOrange: {
    color: '#F97316',
  },
  heroDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bigCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bigCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bigCardText: {
    flex: 1,
  },
  bigCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3,
  },
  bigCardDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
});

