import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Recipe } from '../../lib/types';
import { Avatar } from '../ui/Avatar';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDuration, getAgeGroupColor } from '../../utils/helpers';
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
  const ageGroupColor = primaryAgeGroup
    ? getAgeGroupColor(primaryAgeGroup.slug ?? '', primaryAgeGroup.color)
    : undefined;
  const imageHeight = compact ? 130 : 200;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl overflow-hidden mb-4"
      style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }}
    >
      {/* Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
          style={{ width: '100%', height: imageHeight }}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        {/* Age Group Badge — top left overlay */}
        {primaryAgeGroup?.name ? (
          <View
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 3,
              backgroundColor: ageGroupColor ?? COLORS.primary,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
              {primaryAgeGroup.name}
            </Text>
          </View>
        ) : null}

        {/* Favorite Button — top right */}
        <TouchableOpacity
          onPress={handleFavoriteToggle}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.9)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
          }}
          activeOpacity={0.8}
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
            style={{
              position: 'absolute',
              top: compact ? 44 : 46,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(34,197,94,0.9)',
            }}
          >
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
          </View>
        ) : null}

        {/* Author overlay — gradient fade at the bottom, non-compact only */}
        {!compact && recipe.author ? (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: imageHeight * 0.55,
              justifyContent: 'flex-end',
              alignItems: 'center',
              paddingBottom: 10,
            }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.42)']}
              locations={[0, 0.4, 1]}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: imageHeight * 0.55,
              }}
            />
            <Avatar uri={recipe.author.avatar_url} name={recipe.author.name} size={32} />
            <Text
              style={{
                color: '#fff',
                fontSize: 11,
                fontWeight: '600',
                marginTop: 4,
                textShadowColor: 'rgba(0,0,0,0.7)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
              numberOfLines={1}
            >
              {recipe.author.name}
            </Text>
          </View>
        ) : null}

        {/* Prep Time Badge — bottom right, glassmorphism */}
        {totalTime > 0 ? (
          <View
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }}
          >
            <Ionicons name="time-outline" size={11} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 11 }}>
              {formatDuration(totalTime)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View style={{ padding: 12 }}>
        {/* Title */}
        <Text
          style={{ color: COLORS.dark, fontWeight: '700', fontSize: 13, marginBottom: 6 }}
          numberOfLines={2}
        >
          {recipe.title}
        </Text>

        {/* Diet type & meal type chips */}
        {!compact && ((recipe.diet_types && recipe.diet_types.length > 0) || recipe.meal_type) ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {recipe.meal_type ? (
              <View
                style={{
                  backgroundColor: '#FFF3EE',
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: '600' }}>
                  {recipe.meal_type}
                </Text>
              </View>
            ) : null}
            {recipe.diet_types?.map((dt) => (
              <View
                key={dt}
                style={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 10, color: '#15803D', fontWeight: '600' }}>
                  {dt}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

