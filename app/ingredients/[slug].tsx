import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSWR from 'swr';

import { ingredientService } from '../../src/services/ingredient-service';
import { addShoppingItem } from '../../src/services/shopping-list-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { DetailHeader } from '../../src/components/ui/DetailHeader';
import { IngredientSafetyAlert } from '../../src/components/ingredients/IngredientSafetyAlert';
import { PrepByAge } from '../../src/components/ingredients/PrepByAge';
import { IngredientFAQ } from '../../src/components/ingredients/IngredientFAQ';
import { useIngredientFavorites } from '../../src/hooks/useIngredientFavorites';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/lib/constants';
import type { IngredientGuideItem } from '../../src/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllergyBadge(risk?: string) {
  if (risk === 'Yüksek') return { label: 'Yüksek Risk', color: '#DC2626', bg: '#FEE2E2' };
  if (risk === 'Orta') return { label: 'Orta Risk', color: '#D97706', bg: '#FEF3C7' };
  return { label: 'Düşük Risk', color: '#16A34A', bg: '#DCFCE7' };
}

function getSeasonLabel(season?: string | string[]): string | null {
  if (!season) return null;
  if (Array.isArray(season)) return season.join(', ');
  return season;
}

function parseNutritionPer100g(data: any): Array<{ label: string; value: string; unit: string }> {
  if (!data || typeof data !== 'object') return [];
  return Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== 0 && v !== '')
    .map(([key, v]: [string, any]) => {
      if (typeof v === 'object' && v !== null) {
        return {
          label: v.label ?? key,
          value: String(v.value ?? v.amount ?? ''),
          unit: v.unit ?? '',
        };
      }
      return { label: key, value: String(v), unit: '' };
    })
    .filter((r) => r.value !== '' && r.value !== '0');
}

function parsePairing(p: any): string | null {
  if (typeof p === 'string') return p;
  if (p && typeof p === 'object') return p.name ?? p.title ?? p.ingredient ?? null;
  return null;
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: COLORS.primary + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        <Ionicons name={icon} size={17} color={COLORS.primary} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.dark }}>{title}</Text>
    </View>
  );
}

// ─── Tip Card ─────────────────────────────────────────────────────────────────

function TipCard({
  icon,
  title,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  text: string;
}) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <SectionHeader icon={icon} title={title} />
      <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>{text}</Text>
    </Card>
  );
}

// ─── Related Recipe Card ───────────────────────────────────────────────────────

function RelatedRecipeRow({ item }: { item: any }) {
  const slug = item.slug ?? '';
  const title = item.title ?? item.name ?? '';
  const image = item.featured_image ?? item.image ?? item.thumbnail ?? null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(tabs)/recipes/${slug}` as never)}
      style={{
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 14,
        marginRight: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: '100%', height: 100 }}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: 100,
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="restaurant-outline" size={28} color="#D1D5DB" />
        </View>
      )}
      <View style={{ padding: 10 }}>
        <Text
          style={{ fontSize: 12, fontWeight: '700', color: COLORS.dark, lineHeight: 17 }}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function IngredientBySlugScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggle: toggleFavorite } = useIngredientFavorites();

  const { data: ingredient, isLoading, error } = useSWR<IngredientGuideItem | null>(
    slug ? `ingredient-guide-${slug}` : null,
    () => ingredientService.getBySlug(slug!),
  );

  const favorited = slug ? isFavorite(slug) : false;

  const handleShare = useCallback(() => {
    if (!ingredient) return;
    const url = `https://kidsgourmet.com.tr/beslenme-rehberi/${slug}`;
    Share.share({
      message: `${ingredient.name} - KidsGourmet Beslenme Rehberi\n${url}`,
      url,
      title: ingredient.name,
    });
  }, [ingredient, slug]);

  const handleFavorite = useCallback(() => {
    if (slug) toggleFavorite(slug);
  }, [slug, toggleFavorite]);

  const handleAddToShoppingList = useCallback(async () => {
    if (!ingredient) return;
    if (!isAuthenticated) {
      Alert.alert(
        'Giriş Gerekli',
        'Alışveriş listesine eklemek için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Giriş Yap',
            onPress: () => router.push('/(auth)/login' as never),
          },
        ],
      );
      return;
    }
    try {
      await addShoppingItem({ name: ingredient.name, category: ingredient.category });
      Alert.alert('Eklendi', `${ingredient.name} alışveriş listenize eklendi.`);
    } catch {
      Alert.alert('Hata', 'Alışveriş listesine eklenirken bir hata oluştu.');
    }
  }, [ingredient, isAuthenticated]);

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return <LoadingSpinner fullScreen label="Malzeme yükleniyor..." />;
  }

  // ─── Error / Not found state ───────────────────────────────────────────────
  if (error || !ingredient) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFFBE6',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Ionicons name="nutrition-outline" size={56} color="#9CA3AF" />
        <Text
          style={{
            color: COLORS.dark,
            fontWeight: '800',
            fontSize: 20,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Malzeme bulunamadı
        </Text>
        <Text
          style={{
            color: '#6B7280',
            fontSize: 14,
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          Aradığınız malzeme mevcut değil veya kaldırılmış olabilir.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: COLORS.primary,
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Data derivations ──────────────────────────────────────────────────────
  const allergyBadge = getAllergyBadge(ingredient.allergy_risk);
  const seasonLabel = getSeasonLabel(ingredient.season);

  const nutritionRows = (() => {
    if (ingredient.nutrition_per_100g) {
      return parseNutritionPer100g(ingredient.nutrition_per_100g);
    }
    if (ingredient.nutrition && typeof ingredient.nutrition === 'object') {
      return parseNutritionPer100g(ingredient.nutrition);
    }
    return [];
  })();

  const hasPrepByAge =
    Array.isArray(ingredient.prep_by_age) && ingredient.prep_by_age.length > 0;
  const hasPairings =
    Array.isArray(ingredient.pairings) && ingredient.pairings.length > 0;
  const hasRelatedRecipes =
    Array.isArray(ingredient.related_recipes) && ingredient.related_recipes.length > 0;
  const hasFAQ = Array.isArray(ingredient.faq) && ingredient.faq.length > 0;

  const BOTTOM_BAR_HEIGHT = 72 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BOTTOM_BAR_HEIGHT + 16 }}
      >
        {/* ── A) Hero image ────────────────────────────────────────────── */}
        <View>
          {ingredient.image ? (
            <Image
              source={{ uri: ingredient.image }}
              style={{ width: '100%', height: 280 }}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: 240,
                backgroundColor: '#E8F5E9',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 80 }}>🥦</Text>
            </View>
          )}
        </View>

        {/* ── B) Title + Badges (white card below hero) ─────────────────── */}
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginTop: -20,
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 8,
          }}
        >
          {/* Badge row: age, category, season, allergy */}
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}
          >
            {ingredient.start_age ? (
              <View
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: '#EEF2FF',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4338CA' }}>
                  {ingredient.start_age}
                </Text>
              </View>
            ) : null}
            {ingredient.category ? (
              <View
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: '#FFF3EE',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>
                  {ingredient.category}
                </Text>
              </View>
            ) : null}
            {seasonLabel ? (
              <View
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: '#ECFDF5',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>
                  {seasonLabel}
                </Text>
              </View>
            ) : null}
            {ingredient.allergy_risk ? (
              <View
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: allergyBadge.bg,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: '700', color: allergyBadge.color }}
                >
                  {allergyBadge.label}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Name */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: '900',
              color: COLORS.dark,
              marginBottom: 4,
            }}
          >
            {ingredient.name}
          </Text>

          {/* Category subtitle */}
          {ingredient.category ? (
            <Text
              style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 }}
            >
              {ingredient.category}
            </Text>
          ) : null}
        </View>

        {/* ── Content sections ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>

          {/* ── C) Description ─────────────────────────────────────────── */}
          {ingredient.description ? (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 23 }}>
                {ingredient.description}
              </Text>
              <View
                style={{ height: 1, backgroundColor: '#F3F4F6', marginTop: 16 }}
              />
            </View>
          ) : null}

          {/* ── D) Allergen Safety Alert ────────────────────────────────── */}
          <IngredientSafetyAlert ingredient={ingredient} />

          {/* ── E) Prep by Age ─────────────────────────────────────────── */}
          {hasPrepByAge ? (
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader icon="people-outline" title="Yaşa Göre Hazırlama" />
              <PrepByAge items={ingredient.prep_by_age!} />
            </Card>
          ) : null}

          {/* ── F) Benefits ────────────────────────────────────────────── */}
          {ingredient.benefits ? (
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader icon="heart-outline" title="Faydaları" />
              <View style={{ gap: 6 }}>
                {ingredient.benefits
                  .split(/[.\n]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((line, idx) => (
                    <View
                      key={idx}
                      style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#16A34A"
                        style={{ marginRight: 8, marginTop: 2 }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color: '#374151',
                          lineHeight: 20,
                        }}
                      >
                        {line}
                      </Text>
                    </View>
                  ))}
              </View>
            </Card>
          ) : null}

          {/* ── G) Nutrition ───────────────────────────────────────────── */}
          {nutritionRows.length > 0 ? (
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader icon="analytics-outline" title="Besin Değerleri (100g)" />
              {nutritionRows.map((n, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: idx < nutritionRows.length - 1 ? 1 : 0,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#6B7280', flex: 1 }}>
                    {n.label}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.dark }}>
                    {n.value}
                    {n.unit ? ` ${n.unit}` : ''}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}

          {/* ── H) Selection Tips + Pro Tips ───────────────────────────── */}
          {ingredient.selection_tips ? (
            <TipCard
              icon="eye-outline"
              title="Seçim İpuçları"
              text={ingredient.selection_tips}
            />
          ) : null}
          {ingredient.pro_tips ? (
            <TipCard
              icon="star-outline"
              title="Pro İpuçları"
              text={ingredient.pro_tips}
            />
          ) : null}

          {/* ── I) Storage Tips ────────────────────────────────────────── */}
          {ingredient.storage_tips ? (
            <TipCard
              icon="cube-outline"
              title="Saklama İpuçları"
              text={ingredient.storage_tips}
            />
          ) : null}

          {/* ── J) Pairings ────────────────────────────────────────────── */}
          {hasPairings ? (
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader icon="git-merge-outline" title="Uyumlu Besinler" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ingredient.pairings!.map((p, idx) => {
                  const label = parsePairing(p);
                  if (!label) return null;
                  return (
                    <View
                      key={idx}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: '#F0FDF4',
                        borderWidth: 1,
                        borderColor: '#86EFAC',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: '#15803D',
                          fontWeight: '600',
                        }}
                      >
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : null}

          {/* ── K) Related Recipes ─────────────────────────────────────── */}
          {hasRelatedRecipes ? (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: COLORS.dark,
                  marginBottom: 12,
                }}
              >
                İlgili Tarifler
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {ingredient.related_recipes!.map((r, idx) => (
                  <RelatedRecipeRow key={r.id ?? idx} item={r} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* ── L) FAQ ─────────────────────────────────────────────────── */}
          {hasFAQ ? (
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader icon="help-circle-outline" title="Sıkça Sorulanlar" />
              <IngredientFAQ items={ingredient.faq!} />
            </Card>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Floating back / share / favorite header overlay ───────────────── */}
      <DetailHeader
        transparent
        onShare={handleShare}
        onFavorite={handleFavorite}
        isFavorited={favorited}
      />

      {/* ── M) Sticky Bottom Action Bar ───────────────────────────────────── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12 + insets.bottom,
          gap: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {/* Favorite button */}
        <TouchableOpacity
          onPress={handleFavorite}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: favorited ? '#EF4444' : '#E5E7EB',
            backgroundColor: favorited ? '#FEF2F2' : '#F9FAFB',
            paddingHorizontal: 14,
            paddingVertical: 11,
            gap: 6,
          }}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={20}
            color={favorited ? '#EF4444' : '#6B7280'}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: favorited ? '#EF4444' : '#6B7280',
            }}
          >
            {favorited ? 'Favoride' : 'Favori'}
          </Text>
        </TouchableOpacity>

        {/* Add to shopping list */}
        <TouchableOpacity
          onPress={handleAddToShoppingList}
          activeOpacity={0.8}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            backgroundColor: COLORS.primary,
            paddingVertical: 11,
            gap: 6,
          }}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
            Listeye Ekle
          </Text>
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: '#E5E7EB',
            backgroundColor: '#F9FAFB',
            paddingHorizontal: 14,
            paddingVertical: 11,
          }}
        >
          <Ionicons name="share-social-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
