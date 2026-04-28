import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import useSWR from 'swr';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRecipes } from '../../../src/services/recipe-service';
import { RecipeCard } from '../../../src/components/recipes/RecipeCard';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { AppHeader } from '../../../src/components/ui/AppHeader';
import { useAgeGroups } from '../../../src/hooks/useAgeGroups';
import { useMealTypes } from '../../../src/hooks/useMealTypes';
import { useDietTypes } from '../../../src/hooks/useDietTypes';
import { useSpecialConditions } from '../../../src/hooks/useSpecialConditions';
import type { SearchFilters } from '../../../src/lib/types';
import { API_ENDPOINTS, PAGINATION, COLORS } from '../../../src/lib/constants';
import { searchIngredients } from '../../../src/services/ingredient-service';

const SORT_OPTIONS: { value: NonNullable<SearchFilters['sort']>; label: string }[] = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'popular', label: 'En Popüler' },
  { value: 'rating', label: 'En Yüksek Puan' },
  { value: 'time', label: 'Hazırlık Süresi (Kısa → Uzun)' },
];

interface FilterSectionProps {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  children: React.ReactNode;
}

function FilterSection({ title, icon, children }: FilterSectionProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151', marginLeft: 6 }}>{title}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {children}
      </View>
    </View>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

function FilterChip({ label, selected, onPress, color }: FilterChipProps) {
  const bg = selected ? (color ?? COLORS.primary) : '#F3F4F6';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: bg,
        borderWidth: selected ? 0 : 1,
        borderColor: '#E5E7EB',
      }}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: selected ? '#fff' : '#6B7280' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Age group color map (consistent with RecipeCard)
const AGE_GROUP_COLORS: Record<string, string> = {
  '6-8-ay': '#AED581',
  '8-12-ay': '#81D4FA',
  '12-ay': '#FF8A65',
  '1-3-yas': '#FFB74D',
  '3-yas': '#B39DDB',
  '4-yas': '#F48FB1',
  '5-yas': '#80DEEA',
};

function getAgeGroupColor(slug: string, fallback?: string): string {
  const key = Object.keys(AGE_GROUP_COLORS).find((k) => slug.includes(k));
  return key ? AGE_GROUP_COLORS[key] : fallback ?? COLORS.primary;
}

interface TempFilters {
  meal_type?: string;
  diet_type?: string;
  special_condition?: string;
  expert_approved?: boolean;
  sort?: SearchFilters['sort'];
  ingredient?: string;
}

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    per_page: PAGINATION.RECIPES_PER_PAGE,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<TempFilters>({});

  // Ingredient search state (debounced)
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientResults, setIngredientResults] = useState<string[]>([]);
  const [isSearchingIngredients, setIsSearchingIngredients] = useState(false);
  const ingredientDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const swrKey = `${API_ENDPOINTS.RECIPES}?${JSON.stringify(filters)}`;

  const { data, isLoading, mutate } = useSWR(
    swrKey,
    () => getRecipes(filters),
  );

  const { ageGroups } = useAgeGroups();
  const { mealTypes } = useMealTypes();
  const { dietTypes } = useDietTypes();
  const { specialConditions } = useSpecialConditions();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      query: searchQuery.trim() || undefined,
      page: 1,
    }));
  }, [searchQuery]);

  const handleAgeGroupSelect = useCallback(
    (slug: string | null) => {
      setSelectedAgeGroup(slug);
      setFilters((prev) => ({
        ...prev,
        age_group: slug ?? undefined,
        page: 1,
      }));
    },
    [],
  );

  // Debounced ingredient search
  useEffect(() => {
    if (ingredientDebounceRef.current) {
      clearTimeout(ingredientDebounceRef.current);
    }
    if (!ingredientInput.trim()) {
      setIngredientResults([]);
      return;
    }
    setIsSearchingIngredients(true);
    ingredientDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchIngredients(ingredientInput.trim());
        setIngredientResults(results.map((r) => r.name).slice(0, 8));
      } catch {
        setIngredientResults([]);
      } finally {
        setIsSearchingIngredients(false);
      }
    }, 400);
    return () => {
      if (ingredientDebounceRef.current) clearTimeout(ingredientDebounceRef.current);
    };
  }, [ingredientInput]);

  const openFilterModal = () => {
    setTempFilters({
      meal_type: filters.meal_type,
      diet_type: filters.diet_type,
      special_condition: filters.special_condition,
      expert_approved: filters.expert_approved,
      sort: filters.sort,
      ingredient: filters.ingredient,
    });
    setIngredientInput(filters.ingredient ?? '');
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      meal_type: tempFilters.meal_type,
      diet_type: tempFilters.diet_type,
      special_condition: tempFilters.special_condition,
      expert_approved: tempFilters.expert_approved,
      sort: tempFilters.sort,
      ingredient: tempFilters.ingredient,
      page: 1,
    }));
    setShowFilterModal(false);
  };

  const resetTempFilters = () => {
    setTempFilters({});
    setIngredientInput('');
    setIngredientResults([]);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedAgeGroup(null);
    setFilters({ page: 1, per_page: PAGINATION.RECIPES_PER_PAGE });
  };

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => ({ ...prev, [key]: undefined, page: 1 }));
    if (key === 'age_group') setSelectedAgeGroup(null);
  }, []);

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; key: string }[] = [];
    if (filters.age_group) {
      const ag = (ageGroups ?? []).find((a) => a.slug === filters.age_group);
      chips.push({ label: ag?.name ?? filters.age_group, key: 'age_group' });
    }
    if (filters.meal_type) {
      const mt = (mealTypes ?? []).find((m) => m.slug === filters.meal_type);
      chips.push({ label: mt?.name ?? filters.meal_type, key: 'meal_type' });
    }
    if (filters.diet_type) {
      const dt = (dietTypes ?? []).find((d) => d.slug === filters.diet_type);
      chips.push({ label: dt?.name ?? filters.diet_type, key: 'diet_type' });
    }
    if (filters.special_condition) {
      const sc = (specialConditions ?? []).find((s) => s.slug === filters.special_condition);
      chips.push({ label: sc?.name ?? filters.special_condition, key: 'special_condition' });
    }
    if (filters.ingredient) {
      chips.push({ label: `Malzeme: ${filters.ingredient}`, key: 'ingredient' });
    }
    if (filters.expert_approved) {
      chips.push({ label: 'Uzman Onaylı', key: 'expert_approved' });
    }
    if (filters.sort) {
      const s = SORT_OPTIONS.find((o) => o.value === filters.sort);
      chips.push({ label: s?.label ?? filters.sort, key: 'sort' });
    }
    return chips;
  }, [filters, ageGroups, mealTypes, dietTypes, specialConditions]);

  const activeFilterCount = activeFilterChips.length;

  const recipes = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const currentPage = filters.page ?? 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <AppHeader />

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-dark text-sm"
              placeholder="Tarif ara..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setFilters((p) => ({ ...p, query: undefined, page: 1 }));
                }}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
          {/* Filter button */}
          <TouchableOpacity
            onPress={openFilterModal}
            style={{ padding: 8, position: 'relative' }}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={22} color={COLORS.primary} />
            {activeFilterCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: '#EF4444',
                  borderRadius: 8,
                  width: 16,
                  height: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Age Group Filters */}
      {ageGroups && ageGroups.length > 0 ? (
        <View className="bg-white border-b border-gray-100">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 0, name: 'Tümü', slug: '', color: undefined }, ...ageGroups]}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
            ItemSeparatorComponent={() => <View className="w-2" />}
            renderItem={({ item }) => {
              const isSelected =
                item.slug === '' ? !selectedAgeGroup : selectedAgeGroup === item.slug;
              const chipColor = item.slug
                ? getAgeGroupColor(item.slug, (item as { color?: string }).color)
                : COLORS.primary;
              return (
                <TouchableOpacity
                  onPress={() =>
                    handleAgeGroupSelect(item.slug === '' ? null : item.slug)
                  }
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: isSelected ? chipColor : '#F3F4F6',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: isSelected ? '#fff' : '#6B7280',
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}
          style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
        >
          {activeFilterChips.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              onPress={() => removeFilter(chip.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF3EE',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>
                {chip.label}
              </Text>
              <Ionicons name="close-circle" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={resetAllFilters}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Tümünü Temizle</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Recipe List */}
      {isLoading && recipes.length === 0 ? (
        <LoadingSpinner fullScreen label="Tarifler yükleniyor..." />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF8A65"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="restaurant-outline"
              title="Tarif bulunamadı"
              description="Arama kriterlerinizi değiştirmeyi deneyin"
              actionLabel="Filtreleri Temizle"
              onAction={resetAllFilters}
            />
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="flex-row items-center justify-center gap-3 py-4">
                <TouchableOpacity
                  onPress={() =>
                    setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
                  }
                  disabled={currentPage <= 1}
                  className={`px-4 py-2 rounded-xl ${
                    currentPage <= 1 ? 'bg-gray-100' : 'bg-primary'
                  }`}
                >
                  <Text
                    className={currentPage <= 1 ? 'text-gray-400' : 'text-white'}
                  >
                    Önceki
                  </Text>
                </TouchableOpacity>
                <Badge variant="gray" size="md">
                  {currentPage} / {totalPages}
                </Badge>
                <TouchableOpacity
                  onPress={() =>
                    setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))
                  }
                  disabled={currentPage >= totalPages}
                  className={`px-4 py-2 rounded-xl ${
                    currentPage >= totalPages ? 'bg-gray-100' : 'bg-primary'
                  }`}
                >
                  <Text
                    className={
                      currentPage >= totalPages ? 'text-gray-400' : 'text-white'
                    }
                  >
                    Sonraki
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          renderItem={({ item }) => <RecipeCard recipe={item} />}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              flex: 1,
              marginTop: 80,
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>
                Filtrele
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ paddingTop: 20 }}>

                {/* Yaş Grubu — top of list */}
                {ageGroups.length > 0 && (
                  <FilterSection title="Yaş Grubu" icon="person-outline">
                    {ageGroups.map((ag) => (
                      <FilterChip
                        key={ag.slug}
                        label={ag.name}
                        selected={filters.age_group === ag.slug}
                        color={getAgeGroupColor(ag.slug, ag.color)}
                        onPress={() =>
                          setFilters((f) => ({
                            ...f,
                            age_group: f.age_group === ag.slug ? undefined : ag.slug,
                            page: 1,
                          }))
                        }
                      />
                    ))}
                  </FilterSection>
                )}

                {/* Öğün Tipi */}
                {mealTypes.length > 0 && (
                  <FilterSection title="Öğün Tipi" icon="restaurant-outline">
                    {mealTypes.map((mt) => (
                      <FilterChip
                        key={mt.slug}
                        label={mt.name}
                        selected={tempFilters.meal_type === mt.slug}
                        onPress={() =>
                          setTempFilters((f) => ({
                            ...f,
                            meal_type: f.meal_type === mt.slug ? undefined : mt.slug,
                          }))
                        }
                      />
                    ))}
                  </FilterSection>
                )}

                {/* Diyet Tipi */}
                {dietTypes.length > 0 && (
                  <FilterSection title="Diyet Tipi" icon="leaf-outline">
                    {dietTypes.map((dt) => (
                      <FilterChip
                        key={dt.slug}
                        label={dt.name}
                        selected={tempFilters.diet_type === dt.slug}
                        onPress={() =>
                          setTempFilters((f) => ({
                            ...f,
                            diet_type: f.diet_type === dt.slug ? undefined : dt.slug,
                          }))
                        }
                      />
                    ))}
                  </FilterSection>
                )}

                {/* Özel Durum */}
                {specialConditions.length > 0 && (
                  <FilterSection title="Özel Durum" icon="medical-outline">
                    {specialConditions.map((sc) => (
                      <FilterChip
                        key={sc.slug}
                        label={sc.name}
                        selected={tempFilters.special_condition === sc.slug}
                        onPress={() =>
                          setTempFilters((f) => ({
                            ...f,
                            special_condition: f.special_condition === sc.slug ? undefined : sc.slug,
                          }))
                        }
                      />
                    ))}
                  </FilterSection>
                )}

                {/* Malzeme Ara */}
                <View style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Ionicons name="nutrition-outline" size={18} color={COLORS.primary} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151', marginLeft: 6 }}>
                      Malzeme
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 8, fontSize: 14, color: '#374151' }}
                      placeholder="Malzeme ara..."
                      placeholderTextColor="#9CA3AF"
                      value={ingredientInput}
                      onChangeText={(text) => {
                        setIngredientInput(text);
                        setTempFilters((f) => ({ ...f, ingredient: text || undefined }));
                      }}
                    />
                    {ingredientInput.length > 0 ? (
                      <TouchableOpacity
                        onPress={() => {
                          setIngredientInput('');
                          setIngredientResults([]);
                          setTempFilters((f) => ({ ...f, ingredient: undefined }));
                        }}
                      >
                        <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {/* Ingredient suggestions */}
                  {isSearchingIngredients ? (
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6, marginLeft: 4 }}>
                      Aranıyor...
                    </Text>
                  ) : ingredientResults.length > 0 ? (
                    <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {ingredientResults.map((name) => (
                        <TouchableOpacity
                          key={name}
                          onPress={() => {
                            setIngredientInput(name);
                            setTempFilters((f) => ({ ...f, ingredient: name }));
                            setIngredientResults([]);
                          }}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            backgroundColor: '#FFF3EE',
                            borderRadius: 12,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>
                            {name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </View>

                {/* Uzman Onayı */}
                <FilterSection title="Uzman Onayı" icon="shield-checkmark-outline">
                  <TouchableOpacity
                    onPress={() =>
                      setTempFilters((f) => ({ ...f, expert_approved: !f.expert_approved }))
                    }
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={tempFilters.expert_approved ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={COLORS.primary}
                    />
                    <Text style={{ fontSize: 14, color: '#374151' }}>
                      Sadece Uzman Onaylı Tarifler
                    </Text>
                  </TouchableOpacity>
                </FilterSection>

                {/* Sıralama */}
                <FilterSection title="Sıralama" icon="swap-vertical-outline">
                  {SORT_OPTIONS.map((s) => (
                    <FilterChip
                      key={s.value}
                      label={s.label}
                      selected={tempFilters.sort === s.value}
                      onPress={() =>
                        setTempFilters((f) => ({
                          ...f,
                          sort: f.sort === s.value ? undefined : s.value,
                        }))
                      }
                    />
                  ))}
                </FilterSection>
              </View>
            </ScrollView>

            {/* Apply & Reset buttons */}
            <View
              style={{
                flexDirection: 'row',
                padding: 20,
                gap: 12,
                paddingBottom: insets.bottom + 20,
                borderTopWidth: 1,
                borderTopColor: '#F3F4F6',
              }}
            >
              <Button variant="outline" className="flex-1" onPress={resetTempFilters}>
                Temizle
              </Button>
              <Button variant="primary" className="flex-1" style={{ flexGrow: 2 }} onPress={applyFilters}>
                Uygula
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
