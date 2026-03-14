import React from 'react';
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
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useBlog } from '../../src/hooks/use-blog';
import { COLORS } from '../../src/lib/constants';

const CATEGORY_SHORTCUTS = [
  { label: 'Beslenme', icon: 'nutrition-outline' as const, color: '#FF8A65' },
  { label: 'Gelişim', icon: 'trending-up-outline' as const, color: '#AED581' },
  { label: 'Sağlık', icon: 'medkit-outline' as const, color: '#81D4FA' },
  { label: 'Tarifler', icon: 'restaurant-outline' as const, color: '#B39DDB' },
];

export default function DiscoverScreen() {
  const { posts, isLoading } = useBlog(1, 5);

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Quick category shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <View style={styles.categoryRow}>
            {CATEGORY_SHORTCUTS.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.categoryButton, { backgroundColor: cat.color + '22' }]}
                activeOpacity={0.8}
                onPress={() => router.push('/blog')}
              >
                <Ionicons name={cat.icon} size={22} color={cat.color} />
                <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Latest blog posts */}
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
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
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
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  bigCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
