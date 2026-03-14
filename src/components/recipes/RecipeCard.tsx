import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Recipe } from '../../lib/types';
import { Avatar } from '../ui/Avatar';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDuration } from '../../utils/helpers';
import { COLORS } from '../../lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  /** Compact (mini) mode for grid layouts */
  compact?: boolean;
}

export function RecipeCard({ recipe, onPress, compact = false }: RecipeCardProps) {
  const { isFavorite, toggle } = useFavorites();
  const { isAuthenticated } = useAuth();
  const favorite = isFavorite(recipe.id);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/recipes/${recipe.slug}`);
    }
  };

  const handleFavoriteToggle = async (e: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    await toggle(recipe.id);
  };

  const totalTime = recipe.total_time ?? (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);
  const primaryAgeGroup = recipe.age_groups?.[0];
  const imageHeight = compact ? 130 : 200;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl overflow-hidden mb-4"
      style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }}
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
          style={{ width: '100%', height: imageHeight }}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        {/* Age Group Badge — top left overlay */}
        {primaryAgeGroup?.name ? (
          <View
            className="absolute top-2 left-2 rounded-full px-2 py-0.5"
            style={{ backgroundColor: primaryAgeGroup.color ?? COLORS.primary }}
          >
            <Text className="text-white text-xs font-medium">{primaryAgeGroup.name}</Text>
          </View>
        ) : null}

        {/* Favorite Button — top right */}
        <TouchableOpacity
          onPress={handleFavoriteToggle}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center"
          activeOpacity={0.8}
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3 }}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={18}
            color={favorite ? '#EF4444' : '#6B7280'}
          />
        </TouchableOpacity>

        {/* Expert Approved Badge — below favorite button */}
        {recipe.is_expert_approved ? (
          <View
            className="absolute right-2 w-8 h-8 rounded-full items-center justify-center"
            style={{ top: compact ? 44 : 46, backgroundColor: 'rgba(34,197,94,0.9)' }}
          >
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
          </View>
        ) : null}

        {/* Prep Time Badge — bottom right, glassmorphism */}
        {totalTime > 0 ? (
          <View
            className="absolute bottom-2 right-2 flex-row items-center rounded-full px-2 py-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Ionicons name="time-outline" size={11} color="#fff" />
            <Text className="text-white font-medium ml-1" style={{ fontSize: 11 }}>
              {formatDuration(totalTime)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Title */}
        <Text
          className="text-dark font-bold text-sm mb-1.5"
          numberOfLines={2}
        >
          {recipe.title}
        </Text>

        {/* Author row — hidden in compact mode */}
        {!compact && recipe.author ? (
          <View className="flex-row items-center mt-1">
            <Avatar uri={recipe.author.avatar_url} name={recipe.author.name} size={20} />
            <Text className="text-gray-400 text-xs ml-1.5 flex-1" numberOfLines={1}>
              {recipe.author.name}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
