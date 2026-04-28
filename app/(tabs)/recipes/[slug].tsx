import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import useSWR from 'swr';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRecipe, getRelatedRecipes, rateRecipe } from '../../../src/services/recipe-service';
import { getRecipeComments, addComment } from '../../../src/services/comment-service';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Avatar } from '../../../src/components/ui/Avatar';
import { SafetyBanner } from '../../../src/components/safety/SafetyBanner';
import { DetailHeader } from '../../../src/components/ui/DetailHeader';
import { RecipeCard } from '../../../src/components/recipes/RecipeCard';
import { useFavorites } from '../../../src/contexts/FavoritesContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useRecipeSafetyCheck } from '../../../src/hooks/useSafetyCheck';
import { formatDuration, stripHtml, getInstructionContent, DIFFICULTY_LABELS } from '../../../src/utils/helpers';
import { COLORS } from '../../../src/lib/constants';
import type { SafetyCheck, Comment, Ingredient } from '../../../src/lib/types';

// ─── Portion multiplier options (web-style labels) ───────────────────────────
const PORTION_OPTIONS = [
  { label: '1 Öğün', value: 1 },
  { label: '2 Öğün', value: 2 },
  { label: '4 Öğün', value: 4 },
];

function calculatePortion(amount: string | undefined, multiplier: number): string {
  if (!amount) return '';
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  const result = num * multiplier;
  return result % 1 === 0 ? String(result) : result.toFixed(1);
}

// ─── Star Rating component ────────────────────────────────────────────────────
interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

function StarRating({ rating, onRate, size = 24, readonly = false }: StarRatingProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onRate?.(star)}
          disabled={readonly}
          activeOpacity={readonly ? 1 : 0.7}
        >
          <Ionicons
            name={rating >= star ? 'star' : 'star-outline'}
            size={size}
            color={rating >= star ? '#F59E0B' : '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Ingredient row ───────────────────────────────────────────────────────────
interface IngredientRowProps {
  ing: Ingredient;
  portionMultiplier: number;
  isChecked: boolean;
  onToggle: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function IngredientRow({ ing, portionMultiplier, isChecked, onToggle, isExpanded, onToggleExpand }: IngredientRowProps) {
  const hasExtra = !!(ing.alternatives?.length || ing.notes || ing.allergen_warning);

  return (
    <View>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: isExpanded ? 0 : 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        {/* Bullet / check */}
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isChecked ? COLORS.primary : '#D1D5DB',
            backgroundColor: isChecked ? COLORS.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            flexShrink: 0,
          }}
        >
          {isChecked ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
        </View>

        {/* Name + amount */}
        <Text
          style={{
            color: isChecked ? '#9CA3AF' : COLORS.dark,
            flex: 1,
            fontSize: 14,
            textDecorationLine: isChecked ? 'line-through' : 'none',
          }}
        >
          {ing.amount
            ? `${calculatePortion(ing.amount, portionMultiplier)} ${ing.unit ?? ''} `
            : ''}
          {ing.name}
        </Text>

        {/* Badges / icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {ing.is_optional ? (
            <Badge variant="gray" size="sm">İsteğe bağlı</Badge>
          ) : null}
          {hasExtra ? (
            <TouchableOpacity
              onPress={onToggleExpand}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isExpanded ? 'chevron-up-circle-outline' : 'information-circle-outline'}
                size={18}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ) : null}
          {ing.allergen_warning ? (
            <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Inline expand panel */}
      {isExpanded && hasExtra ? (
        <View
          style={{
            backgroundColor: '#FFFBE6',
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#FDE68A',
          }}
        >
          {ing.alternatives && ing.alternatives.length > 0 ? (
            <View style={{ marginBottom: ing.notes ? 8 : 0 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.dark, marginBottom: 4 }}>
                Alternatifler:
              </Text>
              <Text style={{ fontSize: 13, color: '#374151' }}>
                {ing.alternatives.join(', ')}
              </Text>
            </View>
          ) : null}
          {ing.notes ? (
            <View style={{ marginBottom: ing.allergen_warning ? 8 : 0 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.dark, marginBottom: 4 }}>
                Not:
              </Text>
              <Text style={{ fontSize: 13, color: '#374151' }}>{ing.notes}</Text>
            </View>
          ) : null}
          {ing.allergen_warning ? (
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#B45309', marginBottom: 4 }}>
                Alerjen Uyarısı:
              </Text>
              <Text style={{ fontSize: 13, color: '#92400E' }}>{ing.allergen_warning}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecipeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isFavorite, toggle } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [userRating, setUserRating] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [expandedIngredientId, setExpandedIngredientId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const { data: recipe, isLoading, error, mutate } = useSWR(
    slug ? `recipe-detail-${slug}` : null,
    () => getRecipe(slug!),
  );

  // Related recipes
  const { data: relatedRecipes } = useSWR(
    recipe ? `related-${recipe.id}` : null,
    () => getRelatedRecipes(recipe!.id, 6),
  );

  // Comments
  const { data: comments, mutate: mutateComments } = useSWR<Comment[]>(
    recipe ? `comments-${recipe.id}` : null,
    () => getRecipeComments(recipe!.id),
  );

  const { safetyChecks, ageGroupSafe, isLoading: safetyLoading, hasActiveChild, ageMonths: childAgeMonths } =
    useRecipeSafetyCheck(recipe);

  const favorite = recipe ? isFavorite(recipe.id) : false;

  const handleShare = async () => {
    if (!recipe) return;
    await Share.share({
      title: recipe.title,
      message: `KidsGourmet'ta harika bir tarif: ${recipe.title}`,
    });
  };

  // Combine API safety checks with age-group check into a single banner datum
  const bannerData: SafetyCheck[] | null = (() => {
    if (!hasActiveChild) return null;
    const combined: SafetyCheck[] = [...safetyChecks];
    if (ageGroupSafe === false) {
      combined.push({
        ingredient: 'Yaş uygunluğu',
        age_months: childAgeMonths ?? 0,
        is_safe: false,
        safety_level: 'caution',
        notes: 'Bu tarif çocuğunuzun yaş grubuna uygun olmayabilir.',
      });
    }
    return combined.length > 0 ? combined : null;
  })();

  const handleRate = useCallback(async (star: number) => {
    if (!recipe || !isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (isRating) return;
    setIsRating(true);
    setUserRating(star);
    try {
      await rateRecipe(recipe.id, star);
      await mutate();
    } catch {
      setUserRating(0);
    } finally {
      setIsRating(false);
    }
  }, [recipe, isAuthenticated, isRating, mutate]);

  const handleAddComment = useCallback(async () => {
    if (!recipe || !isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    const text = commentText.trim();
    if (!text) return;
    setIsSubmittingComment(true);
    try {
      await addComment(recipe.id, text);
      setCommentText('');
      await mutateComments();
    } catch {
      // silent fail
    } finally {
      setIsSubmittingComment(false);
    }
  }, [recipe, isAuthenticated, commentText, mutateComments]);

  const toggleIngredientCheck = useCallback((id: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleIngredientExpand = useCallback((id: string) => {
    setExpandedIngredientId((prev) => (prev === id ? null : id));
  }, []);

  const buildShoppingText = useCallback(() => {
    if (!recipe) return '';
    const lines = (recipe.ingredients ?? []).map((ing) => {
      const qty = ing.amount
        ? `${calculatePortion(ing.amount, portionMultiplier)} ${ing.unit ?? ''}`.trim()
        : '';
      return `• ${qty ? qty + ' ' : ''}${ing.name}`;
    });
    return `${recipe.title}\n${lines.join('\n')}`;
  }, [recipe, portionMultiplier]);

  const handleWhatsAppShare = useCallback(async () => {
    const text = buildShoppingText();
    const encoded = encodeURIComponent(text);
    const waUrl = `whatsapp://send?text=${encoded}`;
    const fallbackUrl = `https://wa.me/?text=${encoded}`;
    try {
      const supported = await Linking.canOpenURL(waUrl);
      await Linking.openURL(supported ? waUrl : fallbackUrl);
    } catch {
      await Linking.openURL(fallbackUrl);
    }
  }, [buildShoppingText]);

  const handleCopyShoppingList = useCallback(async () => {
    const text = buildShoppingText();
    await Clipboard.setStringAsync(text);
    Alert.alert('Kopyalandı', 'Alışveriş listesi kopyalandı.');
  }, [buildShoppingText]);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Tarif yükleniyor..." />;
  }

  if (error || !recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <DetailHeader transparent />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={{ color: '#374151', fontWeight: '700', fontSize: 18, marginTop: 16 }}>
            Tarif yüklenemedi
          </Text>
          <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
            Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.
          </Text>
          <Button variant="primary" className="mt-6" onPress={() => mutate()}>
            Tekrar Dene
          </Button>
        </View>
      </View>
    );
  }

  const totalTime =
    recipe.total_time ?? (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);

  const displayRating = userRating || recipe.rating || 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFBE6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* ── Hero Image ── */}
        <View>
          <Image
            source={{ uri: recipe.featured_image ?? recipe.thumbnail }}
            style={{ width: '100%', height: 320 }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* ── Age Group Badges (tıklanabilir) ── */}
          {recipe.age_groups && recipe.age_groups.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {recipe.age_groups.map((ag) => (
                <TouchableOpacity
                  key={ag.slug ?? String(ag.id)}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/(tabs)/recipes?age_group=${ag.slug}` as never)}
                >
                  <View
                    style={{
                      backgroundColor: ag.color ?? COLORS.primary,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                      {ag.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* ── Title ── */}
          <Text style={{ color: COLORS.dark, fontSize: 22, fontWeight: '800', marginBottom: 8 }}>
            {recipe.title}
          </Text>

          {/* ── Excerpt / Description ── */}
          {recipe.excerpt ? (
            <Text style={{ color: '#6B7280', fontSize: 14, lineHeight: 22, marginBottom: 12 }}>
              {stripHtml(recipe.excerpt)}
            </Text>
          ) : null}

          {/* ── Expert Approved badge ── */}
          {recipe.is_expert_approved ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="shield-checkmark" size={16} color="#22C55E" />
              <Text style={{ color: '#15803D', fontSize: 13, marginLeft: 6, fontWeight: '600' }}>
                Uzman Onaylı Tarif
              </Text>
            </View>
          ) : null}

          {/* ── Author block ── */}
          {recipe.author ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 12,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Avatar uri={recipe.author.avatar_url} name={recipe.author.name} size={44} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.dark }}>
                  {recipe.author.name}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push(`/(tabs)/recipes?author=${recipe.author!.id}` as never)}
                >
                  <Text style={{ fontSize: 12, color: COLORS.primary, marginTop: 2 }}>
                    Tüm yazılarını görüntüle →
                  </Text>
                </TouchableOpacity>
              </View>
              {recipe.is_expert_approved ? (
                <View
                  style={{
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    borderRadius: 999,
                    padding: 6,
                  }}
                >
                  <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ── Expert Note Card ── */}
          {recipe.is_expert_approved && recipe.expert ? (
            <View
              style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#86EFAC',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="shield-checkmark" size={18} color="#15803D" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#15803D' }}>
                  Uzman Görüşü
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <Avatar uri={recipe.expert.avatar_url} name={recipe.expert.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.dark }}>
                    {recipe.expert.name}
                  </Text>
                  {recipe.expert.title ? (
                    <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      {recipe.expert.title}
                    </Text>
                  ) : null}
                  {(recipe.expert.note ?? recipe.expert_note) ? (
                    <Text style={{ fontSize: 13, color: '#374151', marginTop: 8, lineHeight: 20 }}>
                      {recipe.expert.note ?? recipe.expert_note}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}

          {/* ── Safety Banner ── */}
          <SafetyBanner
            safetyData={bannerData}
            isLoading={safetyLoading && hasActiveChild}
          />

          {/* ── Meta Row ── */}
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: 8 }}>
              {recipe.prep_time ? (
                <View style={{ alignItems: 'center', minWidth: 64 }}>
                  <Ionicons name="cut-outline" size={20} color={COLORS.primary} />
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Hazırlık</Text>
                  <Text style={{ color: COLORS.dark, fontWeight: '600', fontSize: 13, marginTop: 2 }}>
                    {formatDuration(recipe.prep_time)}
                  </Text>
                </View>
              ) : null}
              {recipe.cook_time ? (
                <View style={{ alignItems: 'center', minWidth: 64 }}>
                  <Ionicons name="flame-outline" size={20} color={COLORS.primary} />
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Pişirme</Text>
                  <Text style={{ color: COLORS.dark, fontWeight: '600', fontSize: 13, marginTop: 2 }}>
                    {formatDuration(recipe.cook_time)}
                  </Text>
                </View>
              ) : null}
              {totalTime > 0 ? (
                <View style={{ alignItems: 'center', minWidth: 64 }}>
                  <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Toplam</Text>
                  <Text style={{ color: COLORS.dark, fontWeight: '600', fontSize: 13, marginTop: 2 }}>
                    {formatDuration(totalTime)}
                  </Text>
                </View>
              ) : null}
              {recipe.servings ? (
                <View style={{ alignItems: 'center', minWidth: 64 }}>
                  <Ionicons name="people-outline" size={20} color={COLORS.primary} />
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Porsiyon</Text>
                  <Text style={{ color: COLORS.dark, fontWeight: '600', fontSize: 13, marginTop: 2 }}>
                    {recipe.servings} kişilik
                  </Text>
                </View>
              ) : null}
              {recipe.difficulty ? (
                <View style={{ alignItems: 'center', minWidth: 64 }}>
                  <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary} />
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Zorluk</Text>
                  <Text style={{ color: COLORS.dark, fontWeight: '600', fontSize: 13, marginTop: 2 }}>
                    {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Meal type & diet type chips (tıklanabilir) */}
            {(recipe.meal_type || (recipe.diet_types && recipe.diet_types.length > 0)) ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                {recipe.meal_type ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push(`/(tabs)/recipes?meal_type=${encodeURIComponent(recipe.meal_type!)}` as never)}
                  >
                    <View style={{ backgroundColor: '#FFF3EE', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="restaurant-outline" size={11} color={COLORS.primary} />
                      <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>{recipe.meal_type}</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
                {recipe.diet_types?.map((dt) => (
                  <TouchableOpacity
                    key={dt}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/(tabs)/recipes?diet_type=${encodeURIComponent(dt)}` as never)}
                  >
                    <View style={{ backgroundColor: '#F0FDF4', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="leaf-outline" size={11} color="#15803D" />
                      <Text style={{ fontSize: 12, color: '#15803D', fontWeight: '600' }}>{dt}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </Card>

          {/* ── Rating ── */}
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.dark }}>Puanla</Text>
              {recipe.rating_count ? (
                <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                  {recipe.rating_count} değerlendirme
                </Text>
              ) : null}
            </View>
            <StarRating rating={displayRating} onRate={handleRate} size={28} readonly={isRating} />
            {recipe.rating ? (
              <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 8 }}>
                Ortalama: {recipe.rating.toFixed(1)} / 5
              </Text>
            ) : null}
          </Card>

          {/* ── Malzemeler Kartı ── */}
          <Card style={{ marginBottom: 16 }}>
            {/* Portion selector */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.dark }}>Malzemeler</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {PORTION_OPTIONS.map((pm) => (
                  <TouchableOpacity
                    key={pm.label}
                    onPress={() => setPortionMultiplier(pm.value)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: portionMultiplier === pm.value ? COLORS.primary : '#F3F4F6',
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: portionMultiplier === pm.value ? '#fff' : '#6B7280' }}>
                      {pm.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {recipe.servings ? (
              <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                {Math.round(recipe.servings * portionMultiplier)} kişilik
              </Text>
            ) : null}

            {/* Ingredient list */}
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing, idx) => {
                const ingKey = String(ing.id ?? `${ing.name}-${idx}`);
                return (
                  <IngredientRow
                    key={ingKey}
                    ing={ing}
                    portionMultiplier={portionMultiplier}
                    isChecked={checkedIngredients.has(ingKey)}
                    onToggle={() => toggleIngredientCheck(ingKey)}
                    isExpanded={expandedIngredientId === ingKey}
                    onToggleExpand={() => toggleIngredientExpand(ingKey)}
                  />
                );
              })
            ) : (
              <Text style={{ color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 }}>
                Malzeme bilgisi bulunamadı
              </Text>
            )}

            {/* Share buttons */}
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleWhatsAppShare}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#25D366',
                    borderRadius: 10,
                    paddingVertical: 10,
                    gap: 6,
                  }}
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCopyShoppingList}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 10,
                    paddingVertical: 10,
                    gap: 6,
                  }}
                >
                  <Ionicons name="copy-outline" size={18} color={COLORS.dark} />
                  <Text style={{ color: COLORS.dark, fontSize: 13, fontWeight: '600' }}>Listeyi Kopyala</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Card>

          {/* ── Hazırlanışı Kartı ── */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 16 }}>
              Hazırlanışı
            </Text>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              recipe.instructions.map((step, idx) => {
                const stepNumber = step.step ?? idx + 1;
                const stepContent = getInstructionContent(step);
                return (
                  <View key={stepNumber} style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{stepNumber}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.dark, lineHeight: 24, fontSize: 14 }}>
                        {stripHtml(stepContent)}
                      </Text>
                      {step.image ? (
                        <Image
                          source={{ uri: step.image }}
                          style={{ width: '100%', height: 180, borderRadius: 12, marginTop: 10 }}
                          contentFit="cover"
                        />
                      ) : null}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 }}>
                Yapılış bilgisi bulunamadı
              </Text>
            )}
          </Card>

          {/* ── Nutrition ── */}
          {recipe.nutrition ? (
            <Card style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 12 }}>
                Besin Değerleri
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { label: 'Kalori', value: recipe.nutrition.calories, unit: 'kcal' },
                  { label: 'Protein', value: recipe.nutrition.protein, unit: 'g' },
                  { label: 'Karbonhidrat', value: recipe.nutrition.carbs, unit: 'g' },
                  { label: 'Yağ', value: recipe.nutrition.fat, unit: 'g' },
                  { label: 'Lif', value: recipe.nutrition.fiber, unit: 'g' },
                  { label: 'Şeker', value: recipe.nutrition.sugar, unit: 'g' },
                ]
                  .filter((n) => n.value !== undefined)
                  .map((n) => (
                    <View
                      key={n.label}
                      style={{
                        backgroundColor: '#FFFBE6',
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        alignItems: 'center',
                        minWidth: 72,
                      }}
                    >
                      <Text style={{ color: COLORS.dark, fontWeight: '800', fontSize: 18 }}>
                        {n.value}
                      </Text>
                      <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{n.unit}</Text>
                      <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{n.label}</Text>
                    </View>
                  ))}
              </View>
            </Card>
          ) : null}

          {/* ── Tags ── */}
          {recipe.tags && recipe.tags.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {recipe.tags.map((tag) => (
                <View
                  key={tag.id}
                  style={{
                    backgroundColor: '#F3F4F6',
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>#{tag.name}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* ── Add to Meal Plan ── */}
          <Button
            variant="outline"
            style={{ marginBottom: 24 }}
            onPress={() => {
              // TODO: Open meal plan picker modal
            }}
          >
            Haftalık Plana Ekle
          </Button>

          {/* ── Similar / Related Recipes ── */}
          {relatedRecipes && relatedRecipes.length > 0 ? (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 12 }}>
                Benzer Tarifler
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={relatedRecipes}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                  <View style={{ width: 180 }}>
                    <RecipeCard recipe={item} compact />
                  </View>
                )}
              />
            </View>
          ) : null}

          {/* ── Comments ── */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 16 }}>
              Yorumlar {comments && comments.length > 0 ? `(${comments.length})` : ''}
            </Text>

            {/* Comment form */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 12,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <TextInput
                multiline
                numberOfLines={3}
                style={{
                  fontSize: 14,
                  color: COLORS.dark,
                  minHeight: 72,
                  textAlignVertical: 'top',
                }}
                placeholder={isAuthenticated ? 'Yorum yazın...' : 'Yorum yazmak için giriş yapın'}
                placeholderTextColor="#9CA3AF"
                value={commentText}
                onChangeText={setCommentText}
                editable={isAuthenticated}
                onFocus={() => {
                  if (!isAuthenticated) router.push('/(auth)/login');
                }}
              />
              <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
                <Button
                  variant="primary"
                  onPress={handleAddComment}
                  style={{ paddingHorizontal: 20 }}
                >
                  {isSubmittingComment ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
              </View>
            </View>

            {/* Comment list */}
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <View
                  key={comment.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Avatar uri={comment.author.avatar_url} name={comment.author.name} size={32} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.dark }}>
                        {comment.author.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                        {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
                    {comment.content}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 }}>
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <DetailHeader
        onShare={handleShare}
        onFavorite={() => {
          if (!isAuthenticated) {
            router.push('/(auth)/login');
            return;
          }
          toggle(recipe.id);
        }}
        isFavorited={favorite}
        transparent
      />
    </KeyboardAvoidingView>
  );
}
