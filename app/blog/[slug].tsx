import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import useSWR from 'swr';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBlogPost } from '../../src/services/blog-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar } from '../../src/components/ui/Avatar';
import { COLORS } from '../../src/lib/constants';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Very simple HTML → plain text stripper for basic content rendering */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .trim();
}

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: post, isLoading } = useSWR(
    slug ? `/wp/v2/posts?slug=${slug}&_embed` : null,
    () => getBlogPost(slug!),
  );

  const handleShare = async () => {
    if (!post) return;
    await Share.share({
      title: post.title,
      message: `KidsGourmet Blog: ${post.title}`,
    });
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

  const bodyText = post.content ? stripHtml(post.content) : post.excerpt ?? '';

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-light">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          {post.featured_image || post.thumbnail ? (
            <Image
              source={{ uri: post.featured_image ?? post.thumbnail }}
              style={{ width: '100%', height: 260 }}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
          ) : (
            <View
              className="w-full items-center justify-center bg-secondary/20"
              style={{ height: 200 }}
            >
              <Ionicons name="newspaper-outline" size={60} color="#AED581" />
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity
            onPress={handleShare}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow"
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={22} color={COLORS.dark} />
          </TouchableOpacity>
        </View>

        <View className="px-4 pt-5 pb-10">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {post.categories.map((cat) => (
                <Badge key={cat.id} variant="secondary" size="sm">
                  {cat.name}
                </Badge>
              ))}
            </View>
          )}

          {/* Title */}
          <Text className="text-dark text-2xl font-bold mb-3">{post.title}</Text>

          {/* Meta info */}
          <View className="flex-row items-center justify-between mb-4">
            {post.author ? (
              <View className="flex-row items-center">
                <Avatar uri={post.author.avatar_url} name={post.author.name} size={32} />
                <View className="ml-2">
                  <Text className="text-dark text-sm font-medium">{post.author.name}</Text>
                  {post.created_at ? (
                    <Text className="text-gray-400 text-xs">{formatDate(post.created_at)}</Text>
                  ) : null}
                </View>
              </View>
            ) : post.created_at ? (
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm ml-1">{formatDate(post.created_at)}</Text>
              </View>
            ) : null}

            {post.reading_time ? (
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm ml-1">{post.reading_time} dk okuma</Text>
              </View>
            ) : null}
          </View>

          {/* Divider */}
          <View className="border-b border-gray-100 mb-4" />

          {/* Content */}
          <Text className="text-dark text-base leading-7" style={{ lineHeight: 26 }}>
            {bodyText}
          </Text>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <View
                  key={tag.id}
                  className="bg-gray-100 rounded-full px-3 py-1"
                >
                  <Text className="text-gray-500 text-xs">#{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
