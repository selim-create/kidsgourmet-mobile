import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import useSWR from 'swr';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRecipe, getRelatedRecipes, rateRecipe } from '../../../src/services/recipe-service';
import { getRecipeComments, addComment } from '../../../src/services/comment-service';
import { getCrossSellBannerConfig } from '../../../src/services/featured-service';
import { CrossSellBanner } from '../../../src/components/home/CrossSellBanner';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Avatar } from '../../../src/components/ui/Avatar';
import { SafetyBanner } from '../../../src/components/safety/SafetyBanner';
import { DetailHeader } from '../../../src/components/ui/DetailHeader';
import { RecipeCard } from '../../../src/components/recipes/RecipeCard';
import { NewsletterSection } from '../../../src/components/home/NewsletterSection';
import { useFavorites } from '../../../src/contexts/FavoritesContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useRecipeSafetyCheck } from '../../../src/hooks/useSafetyCheck';
import { formatDuration, stripHtml, getInstructionContent, DIFFICULTY_LABELS, slugify } from '../../../src/utils/helpers';
import { COLORS } from '../../../src/lib/constants';
import { ApiError } from '../../../src/lib/api';
import { ALL_TOOLS, pickRandom } from '../../../src/lib/tools';
import type { SafetyCheck, Comment, Ingredient } from '../../../src/lib/types';

// ─── Portion multiplier options (web-style labels) ───────────────────────────
const PORTION_OPTIONS = [
  { label: '1 Öğün', value: 1 },
  { label: '2 Öğün', value: 2 },
  { label: '4 Öğün', value: 4 },
];

/** Horizontal padding of the main content view — used to cancel it for full-bleed banners. */
const CONTENT_HORIZONTAL_PADDING = 16;

// ─── Cross-sell banner style: negative horizontal margin offsets the parent's padding ──
const CROSS_SELL_BANNER_STYLE = {
  marginHorizontal: -CONTENT_HORIZONTAL_PADDING as const,
  marginBottom: 16 as const,
};

/** SWR options for the cross-sell banner config (no retry, no focus revalidation). */
const CROSS_SELL_BANNER_SWR_OPTIONS = { revalidateOnFocus: false, shouldRetryOnError: false } as const;

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
  const [substitutesModalVisible, setSubstitutesModalVisible] = useState(false);
  const hasNotes = !!ing.notes;
  const hasAlternatives = !!(ing.alternatives && ing.alternatives.length > 0);
  const hasAllergen = !!ing.allergen_warning;
  const hasExtra = hasNotes || hasAllergen;

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
          {hasNotes ? (
            <TouchableOpacity
              onPress={onToggleExpand}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="help-circle-outline" size={18} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
          {hasAlternatives ? (
            <TouchableOpacity
              onPress={() => setSubstitutesModalVisible(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          ) : null}
          {hasAllergen ? (
            <TouchableOpacity
              onPress={onToggleExpand}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Inline expand panel (notes + allergen) */}
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
          {hasNotes ? (
            <View style={{ marginBottom: hasAllergen ? 8 : 0 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.dark, marginBottom: 4 }}>
                📝 Not:
              </Text>
              <Text style={{ fontSize: 13, color: '#374151' }}>{ing.notes}</Text>
            </View>
          ) : null}
          {hasAllergen ? (
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#B45309', marginBottom: 4 }}>
                ⚠️ Alerjen Uyarısı:
              </Text>
              <Text style={{ fontSize: 13, color: '#92400E' }}>{ing.allergen_warning}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Substitutes modal */}
      {hasAlternatives ? (
        <Modal
          visible={substitutesModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setSubstitutesModalVisible(false)}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
            activeOpacity={1}
            onPress={() => setSubstitutesModalVisible(false)}
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 24,
                paddingTop: 20,
                paddingBottom: 36,
              }}
              onStartShouldSetResponder={() => true}
            >
              {/* Handle bar */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#D1D5DB',
                  alignSelf: 'center',
                  marginBottom: 20,
                }}
              />
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#FFF3EE',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.dark }}>
                    İkame Malzemeler
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {ing.name} için kullanabilirsiniz
                  </Text>
                </View>
              </View>
              {/* Substitutes list */}
              {ing.alternatives!.map((alt, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: idx < ing.alternatives!.length - 1 ? 1 : 0,
                    borderBottomColor: '#F3F4F6',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Text style={{ fontSize: 15 }}>🔄</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: COLORS.dark, flex: 1 }}>{alt}</Text>
                </View>
              ))}
              {/* Close button */}
              <TouchableOpacity
                onPress={() => setSubstitutesModalVisible(false)}
                activeOpacity={0.8}
                style={{
                  marginTop: 20,
                  backgroundColor: COLORS.primary,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
  const [userRating, setUserRating] = useState<number>(0);
  // Ref so handleRate can read the latest rating without a stale closure
  const userRatingRef = React.useRef(0);
  const [isRating, setIsRating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [expandedIngredientId, setExpandedIngredientId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const insets = useSafeAreaInsets();

  // Pick 4 random tools once per render (stable across re-renders)
  const randomTools = useMemo(() => pickRandom(ALL_TOOLS, 4), []);

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

  // Cross-sell banner config — fetched from API; banner is hidden when null/disabled
  const { data: crossSellConfig } = useSWR(
    'cross-sell-banner-config',
    getCrossSellBannerConfig,
    CROSS_SELL_BANNER_SWR_OPTIONS,
  );
  const showCrossSellBanner = crossSellConfig?.enabled !== false;

  const { safetyChecks, ageGroupSafe, isLoading: safetyLoading, hasActiveChild, ageMonths: childAgeMonths } =
    useRecipeSafetyCheck(recipe);

  // Initialize user rating from server when recipe loads
  React.useEffect(() => {
    if (recipe?.user_rating) {
      setUserRating(recipe.user_rating);
      userRatingRef.current = recipe.user_rating;
    }
  }, [recipe?.user_rating]);

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
    const prevRating = userRatingRef.current;
    setIsRating(true);
    setUserRating(star);
    userRatingRef.current = star;
    try {
      const result = await rateRecipe(recipe.id, star);
      // Update local recipe state with returned rating values (no full refetch needed)
      await mutate(
        (current) =>
          current
            ? { ...current, rating: result.rating, rating_count: result.rating_count, user_rating: star }
            : current,
        { revalidate: false },
      );
      Toast.show({
        type: 'success',
        text1: 'Puan verildi!',
        text2: `${star} yıldız verdiniz. Teşekkürler!`,
        visibilityTime: 2500,
      });
    } catch (err) {
      setUserRating(prevRating);
      userRatingRef.current = prevRating;
      const isAuthError = err instanceof ApiError && (err.status === 401 || err.status === 403);
      if (isAuthError) {
        Toast.show({
          type: 'error',
          text1: 'Giriş gerekli',
          text2: 'Puan verebilmek için lütfen giriş yapın.',
          visibilityTime: 3000,
        });
        router.push('/(auth)/login');
      } else {
        Alert.alert(
          'Puan Verilemedi',
          err instanceof Error
            ? err.message
            : 'Puan verilirken bir hata oluştu. Lütfen tekrar deneyin.',
        );
      }
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

  const toggleStep = useCallback((stepNum: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
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

  // Ingredient CTA: prefer first ingredient with alternatives, else first ingredient
  const ctaIngredient = recipe.ingredients?.find(
    (ing) => ing.alternatives && ing.alternatives.length > 0,
  ) ?? recipe.ingredients?.[0];
  const ctaAlternative = ctaIngredient?.alternatives?.[0];

  // Nutrition rows – filter out null, undefined, 0, and empty string
  const nutritionRows = recipe.nutrition
    ? [
        { label: 'Kalori', value: recipe.nutrition.calories, unit: 'kcal' },
        { label: 'Protein', value: recipe.nutrition.protein, unit: 'g' },
        { label: 'Karbonhidrat', value: recipe.nutrition.carbs, unit: 'g' },
        { label: 'Yağ', value: recipe.nutrition.fat, unit: 'g' },
        { label: 'Lif', value: recipe.nutrition.fiber, unit: 'g' },
        { label: 'Şeker', value: recipe.nutrition.sugar, unit: 'g' },
        { label: 'Sodyum', value: recipe.nutrition.sodium, unit: 'mg' },
      ].filter((n) => n.value !== undefined && n.value !== null && n.value !== 0)
    : [];

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
              {recipe.age_groups
                .filter((ag) => ag && (ag.name || ag.slug))
                .map((ag) => {
                  const label = ag.name ?? (ag.slug ? ag.slug.replace(/-/g, ' ') : '');
                  return (
                    <TouchableOpacity
                      key={ag.slug ?? String(ag.id)}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (ag.slug) router.push(`/(tabs)/recipes?age_group=${ag.slug}` as never);
                      }}
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
                          {label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
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
                  onPress={() => {
                    if (recipe.author?.id) router.push(`/authors/${recipe.author.id}` as never);
                  }}
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
              {recipe.is_freezable !== undefined ? (
                <View style={{ alignItems: 'center', minWidth: 64 }}>
                  <Text style={{ fontSize: 20 }}>❄️</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Dondurulabilir</Text>
                  <Text style={{ color: COLORS.dark, fontWeight: '600', fontSize: 13, marginTop: 2 }}>
                    {recipe.is_freezable ? 'Evet' : 'Hayır'}
                  </Text>
                </View>
              ) : null}
              {recipe.storage_duration ? (
                <View style={{ alignItems: 'center', minWidth: 64 }}>
                  <Text style={{ fontSize: 20 }}>📦</Text>
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Saklama</Text>
                  <Text style={{ color: COLORS.dark, fontWeight: '600', fontSize: 13, marginTop: 2 }}>
                    {recipe.storage_duration}
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
                    onPress={() => router.push(`/(tabs)/recipes?meal_type=${encodeURIComponent(recipe.meal_type as string)}` as never)}
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
          <Card style={{ marginBottom: 8 }}>
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

          {/* ── Malzemeye Göre Tarif Öneri (CTA) ── */}
          {ctaIngredient ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (ctaAlternative) {
                  router.push(`/(tabs)/recipes?ingredient=${encodeURIComponent(ctaAlternative)}` as never);
                } else {
                  router.push(`/(tabs)/recipes?ingredient=${encodeURIComponent(ctaIngredient.name)}` as never);
                }
              }}
              style={{ marginBottom: 16 }}
            >
              <View
                style={{
                  backgroundColor: '#FFF3EE',
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#FFD0B0',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: COLORS.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Ionicons name="swap-horizontal-outline" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.dark }}>
                    Evde {ctaIngredient.name} yok mu?
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {ctaAlternative
                      ? `${ctaAlternative} ile alternatif tariflere git →`
                      : 'Alternatif tariflere git →'}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          ) : null}

          {/* ── Hazırlanışı Kartı ── */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 16 }}>
              Hazırlanışı
            </Text>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              recipe.instructions.map((step, idx) => {
                const stepNumber = step.step ?? idx + 1;
                const stepContent = getInstructionContent(step);
                const isCompleted = completedSteps.has(stepNumber);
                return (
                  <TouchableOpacity
                    key={stepNumber}
                    onPress={() => toggleStep(stepNumber)}
                    activeOpacity={0.8}
                    style={{ flexDirection: 'row', marginBottom: 20 }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isCompleted ? '#22C55E' : COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      ) : (
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{stepNumber}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: isCompleted ? '#9CA3AF' : COLORS.dark,
                          lineHeight: 24,
                          fontSize: 14,
                          textDecorationLine: isCompleted ? 'line-through' : 'none',
                        }}
                      >
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
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={{ color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 }}>
                Yapılış bilgisi bulunamadı
              </Text>
            )}
          </Card>

          {/* ── Expert Note Card (Hazırlanışı'nın altında) ── */}
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
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="shield-checkmark" size={18} color="#15803D" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#15803D' }}>
                  Uzman Görüşü
                </Text>
              </View>
              {/* Expert info row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar uri={recipe.expert.avatar_url} name={recipe.expert.name} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    Bu tarif ile ilgili Uzman Notu:
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.dark, marginTop: 2 }}>
                    {[recipe.expert.title, recipe.expert.name].filter(Boolean).join(' ')}
                  </Text>
                </View>
              </View>
              {/* Expert note text */}
              {(recipe.expert.note ?? recipe.expert_note) ? (
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#15803D', marginBottom: 6 }}>
                    Uzman Notu:
                  </Text>
                  <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>
                    {recipe.expert.note ?? recipe.expert_note}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ── Nutrition ── */}
          {nutritionRows.length > 0 ? (
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 12 }}>
                Besin Değerleri
              </Text>
              {nutritionRows.map((n, idx) => (
                <View
                  key={n.label}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: idx < nutritionRows.length - 1 ? 1 : 0,
                    borderBottomColor: '#F3F4F6',
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>{n.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.dark }}>
                    {n.value} {n.unit}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}

          {/* ── Alerjen Uyarısı ── */}
          {recipe.allergens && recipe.allergens.length > 0 ? (
            <Card style={{ marginBottom: 16, backgroundColor: '#FFFBE6', borderWidth: 1, borderColor: '#FDE68A' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="warning-outline" size={18} color="#D97706" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#D97706' }}>
                  Alerjen Uyarısı
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 20, marginBottom: 10 }}>
                Bu tarif aşağıdaki alerjenleri içermektedir:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {recipe.allergens.map((allergen, idx) => (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: '#FDE68A',
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '700' }}>{allergen}</Text>
                  </View>
                ))}
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 6 }}>
                  3 gün kuralı nedir?
                </Text>
                <Text style={{ fontSize: 12, color: '#92400E', lineHeight: 19 }}>
                  Bebeğinize yeni bir besin tanıtırken, her yeni besini 3 gün arayla verin. Bu süre boyunca alerji belirtilerini (kızarıklık, kaşıntı, sindirim sorunları) gözlemleyin. Herhangi bir belirtide doktorunuza başvurun.
                </Text>
              </View>
            </Card>
          ) : null}

          {/* ── Özel Notlar ── */}
          {recipe.special_notes ? (
            <Card style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.dark }}>
                  Özel Notlar
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>
                {stripHtml(recipe.special_notes)}
              </Text>
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

          {/* ── "Bizimkiler Ne Yiyecek?" banner — shown above Faydalı Araçlar unless API explicitly disables it ── */}

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

          {/* ══════════════════════════════════════════════════════
              SIDEBAR BLOCKS — displayed vertically at the bottom
          ══════════════════════════════════════════════════════ */}

          {/* ── "Bizimkiler Ne Yiyecek?" banner — right above Faydalı Araçlar, shown unless explicitly disabled ── */}
          {showCrossSellBanner ? (
            <CrossSellBanner variant={crossSellConfig?.variant ?? 'tariften'} style={CROSS_SELL_BANNER_STYLE} />
          ) : null}

          {/* ── 1. Rastgele 4 Faydalı Araç ── */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 12 }}>
              Faydalı Araçlar
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {randomTools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  activeOpacity={0.85}
                  onPress={() => router.push(tool.route as never)}
                  style={{
                    width: '47%',
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 14,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.07,
                    shadowRadius: 6,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: tool.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons name={tool.icon} size={22} color={tool.color} />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.dark, marginBottom: 4 }} numberOfLines={2}>
                    {tool.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', lineHeight: 15 }} numberOfLines={3}>
                    {tool.description}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: tool.color, marginTop: 8 }}>
                    Keşfet →
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── 2. "Aklınıza Takılan mı Var?" Banner ── */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => Linking.openURL('https://www.kidsgourmet.com/topluluk')}
            style={{ marginBottom: 16 }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: '#FFF3EE',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={26} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 6 }}>
                    Aklınıza Takılan mı Var?
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 14 }}>
                    Uzman diyetisyen ve çocuk beslenmesi uzmanlarına sorularınızı sorun.
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, alignSelf: 'flex-start', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 16, gap: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Soru Sor</Text>
                    <Ionicons name="arrow-forward" size={15} color="#fff" />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* ── 4. Tarifin Malzemeleri (kompakt chips) ── */}
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.dark, marginBottom: 10 }}>
                Tarifin Malzemeleri
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {recipe.ingredients.map((ing, idx) => {
                  const ingSlug = ing.slug ?? slugify(ing.name);
                  return (
                    <TouchableOpacity
                      key={ing.id ?? `chip-${idx}`}
                      activeOpacity={0.7}
                      onPress={() => router.push(`/ingredients/${ingSlug}` as never)}
                    >
                      <View
                        style={{
                          backgroundColor: '#F3F4F6',
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: COLORS.dark }}>{ing.name}</Text>
                        <Ionicons name="chevron-forward" size={10} color="#9CA3AF" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          ) : null}

          {/* ── 5. Alt Alta Benzer Tarifler ── */}
          {relatedRecipes && relatedRecipes.length > 0 ? (
            <View style={{ marginBottom: 24, gap: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 4 }}>
                Benzer Tarifler
              </Text>
              {relatedRecipes.map((item) => (
                <RecipeCard key={String(item.id)} recipe={item} />
              ))}
            </View>
          ) : null}

          {/* ── 6. K&G Bülten ── */}
          <NewsletterSection />
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
