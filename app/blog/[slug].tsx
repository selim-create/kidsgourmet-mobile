import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Share,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useSWR from 'swr';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBlogPost, getBlogPosts } from '../../src/services/blog-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Avatar } from '../../src/components/ui/Avatar';
import { DetailHeader } from '../../src/components/ui/DetailHeader';
import { BlogContent } from '../../src/components/blog/BlogContent';
import { BlogCard } from '../../src/components/blog/BlogCard';
import { NewsletterBanner } from '../../src/components/blog/NewsletterBanner';
import { extractImageUrl } from '../../src/utils/url';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { router } from 'expo-router';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function calculateReadTime(html: string): number {
  const text = (html ?? '').replace(/<[^>]*>?/gm, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { isPostFavorite, togglePost } = useFavorites();
  const { isAuthenticated } = useAuth();

  const { data: post, isLoading } = useSWR(
    slug ? `/wp/v2/posts?slug=${slug}&_embed` : null,
    () => getBlogPost(slug!),
  );

  const categoryId = post?.categories?.[0]?.id;
  const { data: relatedData } = useSWR(
    post && categoryId ? `/blog/related/${categoryId}` : null,
    () => getBlogPosts(1, 5, String(categoryId)),
  );
  const relatedPosts = relatedData?.items?.filter((p) => p.slug !== post?.slug).slice(0, 4) ?? [];

  const handleShare = async () => {
    if (!post) return;
    await Share.share({
      title: post.title,
      message: `KidsGourmet Blog: ${post.title}`,
    });
  };

  const handleFavorite = async () => {
    if (!post) return;
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    await togglePost(post.id);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Yazı yükleniyor..." />;
  }

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-light">
        <Text className="text-gray-500">Yazı bulunamadı</Text>
      </View>
    );
  }

  const isSponsored = post.sponsor_data?.is_sponsored;
  const sd = post.sponsor_data;
  const isFav = isPostFavorite(post.id);
  const logoUrl = extractImageUrl(sd?.sponsor_logo) ?? extractImageUrl(sd?.sponsor_light_logo);
  const readTime = post.reading_time || calculateReadTime(post.content ?? '');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {post.featured_image || post.thumbnail ? (
            <Image
              source={{ uri: post.featured_image ?? post.thumbnail }}
              style={styles.heroImage}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="newspaper-outline" size={60} color="#AED581" />
            </View>
          )}
          {/* Gradient overlay from bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)']}
            style={styles.heroGradient}
          />
          {/* Floating action buttons: share + favorite */}
          <View style={[styles.heroActions, { top: insets.top + 12 }]}>
            <TouchableOpacity style={styles.heroActionBtn} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroActionBtn} onPress={handleFavorite} activeOpacity={0.7}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? '#EF4444' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Category chips (below hero, above title) */}
          {isSponsored ? (
            <View style={styles.categoryRow}>
              <View style={styles.sponsoredBadge}>
                <Text style={styles.sponsoredBadgeText}>📢 Sponsorlu</Text>
              </View>
            </View>
          ) : post.categories && post.categories.length > 0 ? (
            <View style={styles.categoryRow}>
              {post.categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryChip}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/blog?categoryId=${cat.id}`)}
                >
                  <Text style={styles.categoryChipText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Title */}
          <Text style={styles.title}>{post.title}</Text>

          {/* Meta row */}
          <Text style={styles.metaRow}>
            {formatDate(post.created_at)}
            {` · ${readTime} dk okuma`}
            {post.comment_count ? ` · 💬 ${post.comment_count}` : ''}
          </Text>

          {/* Mini author row (non-sponsored only) */}
          {!isSponsored && post.author ? (
            <View style={styles.miniAuthorRow}>
              <Avatar uri={post.author.avatar_url} name={post.author.name} size={24} />
              <Text style={styles.miniAuthorLabel}>Yazar: </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/authors/${post.author?.id}`)}
              >
                <Text style={styles.miniAuthorName}>{post.author.name}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.divider} />

          {/* Sponsored block (instead of author block) */}
          {isSponsored && sd ? (
            <TouchableOpacity
              style={styles.sponsorCard}
              activeOpacity={0.85}
              onPress={() => sd.sponsor_url ? Linking.openURL(sd.sponsor_url).catch(() => {}) : undefined}
            >
              <View style={styles.sponsorCardHeader}>
                <Text style={styles.sponsorCardLabel}>📢 SPONSORLU İÇERİK</Text>
              </View>
              <View style={styles.sponsorCardRow}>
                {logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={styles.sponsorCardLogo}
                    contentFit="contain"
                    onError={() => {}}
                  />
                ) : null}
                {sd.sponsor_name ? (
                  <Text style={styles.sponsorCardName}>{sd.sponsor_name}</Text>
                ) : null}
              </View>
              {sd.discount_text ? (
                <View style={styles.discountChip}>
                  <Ionicons name="pricetag-outline" size={13} color="#16A34A" />
                  <Text style={styles.discountText}>{sd.discount_text}</Text>
                </View>
              ) : null}
              <Text style={styles.sponsorCardNote}>
                {`Bu içerik ${sd.sponsor_name ?? 'sponsor'} katkılarıyla hazırlanmıştır.`}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Rich HTML Content */}
          {post.content ? (
            <View style={styles.bodyContainer}>
              <BlogContent html={post.content} />
            </View>
          ) : post.excerpt ? (
            <Text style={styles.excerpt}>{post.excerpt}</Text>
          ) : null}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {post.tags.map((tag) => (
                <View key={tag.id} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Newsletter banner */}
        <NewsletterBanner source="mobile_blog_detail" />

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>İlgili Yazılar</Text>
            {relatedPosts.map((rPost) => (
              <BlogCard key={rPost.id} post={rPost} />
            ))}
          </View>
        )}
      </ScrollView>
      <DetailHeader transparent />
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  heroPlaceholder: {
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  heroActions: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  heroActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryChipText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  sponsoredBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sponsoredBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 34,
    marginBottom: 10,
  },
  metaRow: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  miniAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  miniAuthorLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  miniAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  sponsorCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sponsorCardHeader: {
    marginBottom: 10,
  },
  sponsorCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  sponsorCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sponsorCardLogo: {
    width: 80,
    height: 32,
  },
  sponsorCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  discountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  discountText: {
    fontSize: 13,
    color: '#16A34A',
  },
  sponsorCardNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  bodyContainer: {
    paddingVertical: 8,
  },
  excerpt: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 26,
    paddingVertical: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  relatedSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
});

