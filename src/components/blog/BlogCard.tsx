import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { BlogPost } from '../../lib/types';

interface BlogCardProps {
  post: BlogPost;
  hero?: boolean;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function BlogCard({ post, hero = false }: BlogCardProps) {
  const handlePress = () => {
    router.push(`/blog/${post.slug}`);
  };

  const imageHeight = hero ? 220 : 150;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl overflow-hidden mb-4"
      style={{
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
    >
      {/* Thumbnail */}
      <View className="relative">
        {post.featured_image || post.thumbnail ? (
          <Image
            source={{ uri: post.featured_image ?? post.thumbnail }}
            style={{ width: '100%', height: imageHeight }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View
            className="w-full items-center justify-center bg-secondary/20"
            style={{ height: imageHeight }}
          >
            <Ionicons name="newspaper-outline" size={40} color="#AED581" />
          </View>
        )}

        {/* Category badge */}
        {post.categories && post.categories.length > 0 && (
          <View className="absolute top-3 left-3 bg-primary rounded-full px-3 py-1">
            <Text className="text-white text-xs font-semibold">
              {post.categories[0].name}
            </Text>
          </View>
        )}

        {/* Reading time badge */}
        {post.reading_time ? (
          <View
            className="absolute bottom-3 right-3 flex-row items-center rounded-full px-2 py-0.5"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Ionicons name="time-outline" size={12} color="#fff" />
            <Text className="text-white text-xs ml-1">{post.reading_time} dk</Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View className="p-4">
        <Text
          className={`text-dark font-bold mb-1 ${hero ? 'text-xl' : 'text-base'}`}
          numberOfLines={hero ? 3 : 2}
        >
          {post.title}
        </Text>

        {post.excerpt ? (
          <Text className="text-gray-500 text-sm mb-3" numberOfLines={hero ? 3 : 2}>
            {post.excerpt}
          </Text>
        ) : null}

        {/* Footer row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs ml-1">
              {formatDate(post.created_at)}
            </Text>
          </View>

          {post.author && (
            <Text className="text-gray-400 text-xs">{post.author.name}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
