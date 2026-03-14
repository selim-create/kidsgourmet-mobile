import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import useSWR, { useSWRConfig } from 'swr';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { RecipeCard } from '../../src/components/recipes/RecipeCard';
import { BlogCard } from '../../src/components/blog/BlogCard';
import { FeaturedSlider } from '../../src/components/home/FeaturedSlider';
import { QuickSearch } from '../../src/components/home/QuickSearch';
import { ToolsSection } from '../../src/components/home/ToolsSection';
import { CrossSellBanner } from '../../src/components/home/CrossSellBanner';
import { FeaturesSection } from '../../src/components/home/FeaturesSection';
import { NewsletterSection } from '../../src/components/home/NewsletterSection';
import { useAuth } from '../../src/contexts/AuthContext';
import { useBlog } from '../../src/hooks/use-blog';
import { getRecipes } from '../../src/services/recipe-service';
import { COLORS } from '../../src/lib/constants';
import type { Recipe } from '../../src/lib/types';

export default function HomeScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const { mutate } = useSWRConfig();

  const { data: recipesData, isLoading: loadingRecipes } = useSWR(
    'home-recipes',
    () => getRecipes({ per_page: 8 }),
  );
  const { posts: blogPosts, isLoading: loadingBlog } = useBlog(1, 6);

  const recipes: Recipe[] = recipesData?.items ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await mutate(() => true, undefined, { revalidate: true });
    setRefreshing(false);
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen label="Yükleniyor..." />;
  }

  // Build recipe grid rows (2 per row)
  const recipeRows = Array.from(
    { length: Math.ceil(recipes.length / 2) },
    (_, i) => recipes.slice(i * 2, i * 2 + 2),
  );

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── SECTION 1: Featured Slider ──────────────────────────────────── */}
        <View style={styles.sectionTop}>
          <FeaturedSlider />
        </View>

        {/* ── SECTION 2: Quick Search ─────────────────────────────────────── */}
        <QuickSearch />

        {/* ── SECTION 3: Auth CTA (only when not logged in) ──────────────── */}
        {!isAuthenticated && (
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Özelleştirilmiş içerik için</Text>
            <Text style={styles.authSubtitle}>
              Kişiselleştirilmiş tarifler, haftalık planlar ve daha fazlası için hesap oluşturun.
            </Text>
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.authLoginBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.authLoginText}>Giriş Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.authRegisterBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.authRegisterText}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── SECTION 4: Recipes ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Minik Gurmelere Özel</Text>
              <Text style={styles.sectionSubtitle}>İştah açan besleyici tarifler</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/recipes')}
              activeOpacity={0.8}
            >
              <Text style={styles.seeAllText}>Tümünü Gör →</Text>
            </TouchableOpacity>
          </View>

          {loadingRecipes ? (
            <View style={styles.loadingWrap}>
              <LoadingSpinner size="small" />
            </View>
          ) : (
            recipeRows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.recipeRow}>
                {row.map((recipe) => (
                  <View key={recipe.id} style={styles.recipeCol}>
                    <RecipeCard recipe={recipe} compact />
                  </View>
                ))}
                {/* Fill empty slot in last row */}
                {row.length === 1 && <View style={styles.recipeCol} />}
              </View>
            ))
          )}
        </View>

        {/* ── SECTION 5: Tariften.com Banner ─────────────────────────────── */}
        <CrossSellBanner variant="tariften" />

        {/* ── SECTION 6: Tools ───────────────────────────────────────────── */}
        <ToolsSection />

        {/* ── SECTION 7: Blog ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Ebeveyn Rehberi</Text>
              <Text style={styles.sectionSubtitle}>
                Uzmanlardan bilgiler, güncel rehberler ve beslenme ipuçları
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/blog')}
              activeOpacity={0.8}
            >
              <Text style={styles.seeAllText}>Tümünü Gör →</Text>
            </TouchableOpacity>
          </View>

          {loadingBlog ? (
            <View style={styles.loadingWrap}>
              <LoadingSpinner size="small" />
            </View>
          ) : blogPosts.length > 0 ? (
            <>
              {/* Hero post */}
              <BlogCard post={blogPosts[0]} hero />
              {/* Rest as compact cards */}
              {blogPosts.slice(1).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </>
          ) : null}
        </View>

        {/* ── SECTION 8: Rejimde.com Banner ──────────────────────────────── */}
        <CrossSellBanner variant="rejimde" />

        {/* ── SECTION 9: Features ────────────────────────────────────────── */}
        <FeaturesSection />

        {/* ── SECTION 10: Newsletter ─────────────────────────────────────── */}
        <NewsletterSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTop: {
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  recipeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  recipeCol: {
    flex: 1,
  },
  // Auth CTA
  authCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  authTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
    lineHeight: 18,
    marginBottom: 16,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  authLoginBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authLoginText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  authRegisterBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  authRegisterText: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
  },
});
