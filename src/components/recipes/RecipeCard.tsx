import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Recipe } from '../../lib/types';
import { Avatar } from '../ui/Avatar';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDuration, getAgeGroupColor, getAgeGroupTextColor } from '../../utils/helpers';
import { COLORS } from '../../lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  /** Compact (mini) mode for grid layouts */
  compact?: boolean;
}

/** Size of the avatar circle (border excluded). */
const AVATAR_SIZE = 56;
/** Width of the white border ring around the avatar. */
const AVATAR_BORDER = 3;

/** Asymmetric border radius for the age group badge — matches web design. */
const BADGE_BORDER_RADIUS = {
  borderTopLeftRadius: 12,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 12,
  borderBottomLeftRadius: 4,
};

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

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    await toggle(recipe.id);
  };

  const totalTime = recipe.total_time ?? (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);

  // Use the age_group string field first (full name, e.g. "Aile Sofrasına Geçiş (12-24 Ay)"),
  // fall back to the first item in the age_groups array.
  const ageGroupText = recipe.age_group ?? recipe.age_groups?.[0]?.name;
  const ageGroupColor = getAgeGroupColor(
    ageGroupText,
    recipe.age_groups?.[0]?.color,
  );
  const ageGroupTextColor = getAgeGroupTextColor(ageGroupText);

  const imageHeight = compact ? 130 : 200;
  const hasAuthor = !compact && !!recipe.author;
  const isExpertApproved = (recipe.is_expert_approved ?? recipe.expert?.approved) === true;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        opacity: pressed ? 0.97 : 1,
        // overflow must stay visible so the avatar can overlap the image bottom edge
        overflow: 'visible',
      })}
    >
      {/* ── Image section ─────────────────────────────────────────────────────── */}
      {/*
        Outer View has NO overflow:hidden so absolute overlays are not clipped and
        touch events are not blocked. The inner View clips the image to rounded corners.
      */}
      <View>
        {/* Inner image container — clips photo to rounded top corners only */}
        <View
          style={{
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
            style={{ width: '100%', height: imageHeight }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        </View>

        {/* Age Group Badge — top left overlay, asymmetric corners, web-matched pastel colors */}
        {ageGroupText ? (
          <View
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 10,
              ...BADGE_BORDER_RADIUS,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: ageGroupColor,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <Text style={{ color: ageGroupTextColor, fontSize: 12, fontWeight: 'bold' }}>
              {ageGroupText}
            </Text>
          </View>
        ) : null}

        {/* Favorite Button — top right overlay */}
        <Pressable
          onPress={handleFavoriteToggle}
          hitSlop={8}
          style={({ pressed }) => ({
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.9)',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          })}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={favorite ? '#EF4444' : '#6B7280'}
          />
        </Pressable>

        {/* Expert Approved Badge — below the favorite button */}
        {isExpertApproved ? (
          <View
            style={{
              position: 'absolute',
              top: 64,
              right: 12,
              zIndex: 10,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#22C55E',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        ) : null}

        {/* Prep Time Badge — bottom right */}
        {totalTime > 0 ? (
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              zIndex: 10,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            <Ionicons name="time-outline" size={12} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 11 }}>
              {formatDuration(totalTime)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Content area ────────────────────────────────────────────────────────── */}
      <View
        style={{
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingBottom: 14,
          // No paddingTop here — the avatar's negative margin controls the spacing
          paddingTop: hasAuthor ? 0 : 12,
        }}
      >
        {/* Avatar — half overlapping the image bottom, centered */}
        {hasAuthor ? (
          <View style={{ alignItems: 'center', marginTop: -(AVATAR_SIZE / 2 + AVATAR_BORDER) }}>
            <View
              style={{
                width: AVATAR_SIZE + AVATAR_BORDER * 2,
                height: AVATAR_SIZE + AVATAR_BORDER * 2,
                borderRadius: (AVATAR_SIZE + AVATAR_BORDER * 2) / 2,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Avatar
                uri={recipe.author!.avatar_url}
                name={recipe.author!.name}
                size={AVATAR_SIZE}
              />
            </View>
          </View>
        ) : null}

        {/* Chef / author name */}
        {hasAuthor && recipe.author?.name ? (
          <Text
            style={{
              textAlign: 'center',
              color: '#6B7280',
              fontSize: 12,
              marginTop: 6,
              fontWeight: '500',
            }}
            numberOfLines={1}
          >
            {recipe.author.name}
          </Text>
        ) : null}

        {/* Recipe title */}
        <Text
          style={{
            textAlign: hasAuthor ? 'center' : 'left',
            color: COLORS.dark,
            fontWeight: '700',
            fontSize: 14,
            marginTop: hasAuthor ? 4 : 0,
            marginBottom: 6,
          }}
          numberOfLines={2}
        >
          {recipe.title}
        </Text>

        {/* Diet type & meal type chips — hidden in compact mode */}
        {!compact && ((recipe.diet_types && recipe.diet_types.length > 0) || recipe.meal_type) ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: hasAuthor ? 'center' : 'flex-start',
            }}
          >
            {recipe.meal_type ? (
              <View
                style={{
                  backgroundColor: '#FFF3EE',
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
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
                  paddingVertical: 3,
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
    </Pressable>
  );
}

