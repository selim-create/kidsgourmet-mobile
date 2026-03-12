import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Recipe } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { useFavorites } from '../../contexts/FavoritesContext';
import { formatDuration } from '../../utils/helpers';

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const { isFavorite, toggle } = useFavorites();
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
    await toggle(recipe.id);
  };

  const totalTime = recipe.total_time ?? (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4"
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
          style={{ width: '100%', height: 180 }}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={handleFavoriteToggle}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 items-center justify-center shadow-sm"
          activeOpacity={0.8}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={favorite ? '#EF4444' : '#6B7280'}
          />
        </TouchableOpacity>

        {/* Expert Approved Badge */}
        {recipe.is_expert_approved ? (
          <View className="absolute bottom-3 left-3 flex-row items-center bg-success/90 rounded-full px-2 py-1">
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text className="text-white text-xs ml-1 font-medium">Uzman Onaylı</Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Age Group Badges */}
        {recipe.age_groups && recipe.age_groups.length > 0 ? (
          <View className="flex-row flex-wrap gap-1 mb-2">
            {recipe.age_groups.slice(0, 2).map((ag) => (
              <Badge key={ag.id} variant="secondary" size="sm">
                {ag.name}
              </Badge>
            ))}
          </View>
        ) : null}

        {/* Title */}
        <Text
          className="text-dark font-semibold text-base mb-2"
          numberOfLines={2}
        >
          {recipe.title}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          {/* Time */}
          {totalTime > 0 ? (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs ml-1">
                {formatDuration(totalTime)}
              </Text>
            </View>
          ) : null}

          {/* Author */}
          {recipe.author ? (
            <Text className="text-gray-400 text-xs" numberOfLines={1}>
              {recipe.author.name}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
