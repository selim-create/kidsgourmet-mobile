import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Linking } from 'react-native';
import type { BlogPost } from '../../lib/types';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'hero' | 'sponsored';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getCategoryName(post: BlogPost): string {
  return post.categories?.[0]?.name ?? 'Genel';
}

function resolveVariant(post: BlogPost, variant?: 'default' | 'hero' | 'sponsored'): 'default' | 'hero' | 'sponsored' {
  if (variant) return variant;
  return post.sponsor_data?.is_sponsored ? 'sponsored' : 'default';
}

function handleCardPress(post: BlogPost) {
  if (post.sponsor_data?.is_sponsored && post.sponsor_data?.direct_redirect && post.sponsor_data?.sponsor_url) {
    Linking.openURL(post.sponsor_data.sponsor_url).catch(() => {
      router.push(`/blog/${post.slug}`);
    });
  } else {
    router.push(`/blog/${post.slug}`);
  }
}

export function BlogCard({ post, variant: variantProp }: BlogCardProps) {
  const variant = resolveVariant(post, variantProp);

  if (variant === 'hero') {
    return <HeroCard post={post} />;
  }
  if (variant === 'sponsored') {
    return <SponsoredCard post={post} />;
  }
  return <DefaultCard post={post} />;
}

// ─── Default Card ──────────────────────────────────────────────────────────────

function DefaultCard({ post }: { post: BlogPost }) {
  return (
    <TouchableOpacity
      onPress={() => handleCardPress(post)}
      activeOpacity={0.8}
      style={styles.card}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {post.featured_image || post.thumbnail ? (
          <Image
            source={{ uri: post.featured_image ?? post.thumbnail }}
            style={styles.defaultImage}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View style={[styles.defaultImage, styles.imagePlaceholder]}>
            <Ionicons name="newspaper-outline" size={40} color="#AED581" />
          </View>
        )}
        {/* Category badge top-left */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{getCategoryName(post)}</Text>
        </View>
        {/* Favorite button top-right */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          activeOpacity={0.8}
          onPress={() => console.log('favorite', post.id)}
        >
          <Ionicons name="heart-outline" size={16} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Meta */}
        <Text style={styles.meta}>
          {formatDate(post.created_at)}
          {post.author ? ` · ${post.author.name}` : ''}
        </Text>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        {/* Excerpt */}
        {post.excerpt ? (
          <Text style={styles.excerpt} numberOfLines={3}>{post.excerpt}</Text>
        ) : null}
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.readMore}>Devamını Oku →</Text>
          {post.comment_count ? (
            <View style={styles.commentRow}>
              <Ionicons name="chatbubble-outline" size={12} color="#9CA3AF" />
              <Text style={styles.commentText}>{post.comment_count}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Sponsored Card ────────────────────────────────────────────────────────────

function SponsoredCard({ post }: { post: BlogPost }) {
  const sd = post.sponsor_data;

  return (
    <TouchableOpacity
      onPress={() => handleCardPress(post)}
      activeOpacity={0.8}
      style={styles.card}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {post.featured_image || post.thumbnail ? (
          <Image
            source={{ uri: post.featured_image ?? post.thumbnail }}
            style={styles.defaultImage}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View style={[styles.defaultImage, styles.imagePlaceholder]}>
            <Ionicons name="newspaper-outline" size={40} color="#AED581" />
          </View>
        )}
        {/* Sponsored badge top-left */}
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredBadgeText}>Sponsorlu</Text>
        </View>
        {/* Sponsor logo bottom-left */}
        {(sd?.sponsor_logo || sd?.sponsor_light_logo) ? (
          <View style={styles.sponsorLogoContainer}>
            <Image
              source={{ uri: sd.sponsor_logo ?? sd.sponsor_light_logo }}
              style={styles.sponsorLogo}
              contentFit="contain"
            />
          </View>
        ) : null}
        {/* Favorite button top-right */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          activeOpacity={0.8}
          onPress={() => console.log('favorite', post.id)}
        >
          <Ionicons name="heart-outline" size={16} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Sponsor meta */}
        <View style={styles.sponsorMetaRow}>
          <View style={styles.sponsorChip}>
            <Text style={styles.sponsorChipText}>Sponsorlu</Text>
          </View>
          {sd?.sponsor_name ? (
            <Text style={styles.sponsorName}>{sd.sponsor_name}</Text>
          ) : null}
        </View>

        {/* Discount text */}
        {sd?.discount_text ? (
          <View style={styles.discountBox}>
            <Ionicons name="pricetag-outline" size={14} color="#16A34A" />
            <Text style={styles.discountText}>{sd.discount_text}</Text>
          </View>
        ) : null}

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        {/* Excerpt */}
        {post.excerpt ? (
          <Text style={styles.excerpt} numberOfLines={3}>{post.excerpt}</Text>
        ) : null}
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.readMore}>Devamını Oku →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Hero Card ─────────────────────────────────────────────────────────────────

function HeroCard({ post }: { post: BlogPost }) {
  const isSponsored = post.sponsor_data?.is_sponsored;

  return (
    <TouchableOpacity
      onPress={() => handleCardPress(post)}
      activeOpacity={0.88}
      style={[styles.heroCard, styles.card]}
    >
      {/* Full-bleed image */}
      {post.featured_image || post.thumbnail ? (
        <Image
          source={{ uri: post.featured_image ?? post.thumbnail }}
          style={styles.heroImage}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View style={[styles.heroImage, styles.imagePlaceholder]}>
          <Ionicons name="newspaper-outline" size={60} color="#AED581" />
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.heroGradient}
      />

      {/* Top-left badge */}
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>
          {isSponsored ? '📢 Sponsorlu İçerik' : '⭐ Editörün Seçimi'}
        </Text>
      </View>

      {/* Top-right favorite */}
      <TouchableOpacity
        style={styles.favoriteBtn}
        activeOpacity={0.8}
        onPress={() => console.log('favorite', post.id)}
      >
        <Ionicons name="heart-outline" size={16} color="#fff" />
      </TouchableOpacity>

      {/* Bottom content */}
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle} numberOfLines={3}>{post.title}</Text>
        <View style={styles.heroMeta}>
          {post.author?.avatar_url ? (
            <Image
              source={{ uri: post.author.avatar_url }}
              style={styles.heroAvatar}
              contentFit="cover"
            />
          ) : null}
          <Text style={styles.heroMetaText}>
            {post.author?.name ?? ''}
            {post.author && post.created_at ? '  ·  ' : ''}
            {formatDate(post.created_at)}
          </Text>
          {post.comment_count ? (
            <>
              <Text style={styles.heroMetaText}>{'  ·  '}</Text>
              <Ionicons name="chatbubble-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaText}> {post.comment_count}</Text>
            </>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  defaultImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  imagePlaceholder: {
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '700',
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
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
  sponsorLogoContainer: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    padding: 4,
  },
  sponsorLogo: {
    width: 60,
    height: 24,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  meta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 23,
    marginBottom: 6,
  },
  excerpt: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  readMore: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '700',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  commentText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sponsorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sponsorChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sponsorChipText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
  sponsorName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  discountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  discountText: {
    fontSize: 13,
    color: '#16A34A',
    flex: 1,
  },
  // Hero styles
  heroCard: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  heroBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  heroAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
  },
  heroMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
});

