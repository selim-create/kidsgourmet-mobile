import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import useSWR from 'swr';
import { Ionicons } from '@expo/vector-icons';
import { getRecipes } from '../../../src/services/recipe-service';
import { getAgeGroups } from '../../../src/services/taxonomy-service';
import { RecipeCard } from '../../../src/components/recipes/RecipeCard';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { Badge } from '../../../src/components/ui/Badge';
import { AppHeader } from '../../../src/components/ui/AppHeader';
import type { SearchFilters } from '../../../src/lib/types';
import { API_ENDPOINTS, PAGINATION } from '../../../src/lib/constants';

export default function RecipesScreen() {
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    per_page: PAGINATION.RECIPES_PER_PAGE,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);

  const swrKey = `${API_ENDPOINTS.RECIPES}?${JSON.stringify(filters)}`;

  const { data, isLoading, mutate } = useSWR(
    swrKey,
    () => getRecipes(filters),
  );

  const { data: ageGroups } = useSWR(
    API_ENDPOINTS.AGE_GROUPS,
    () => getAgeGroups(),
    { revalidateOnFocus: false },
  );

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

  const recipes = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const currentPage = filters.page ?? 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <AppHeader />

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
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
      </View>

      {/* Age Group Filters */}
      {ageGroups && ageGroups.length > 0 ? (
        <View className="bg-white border-b border-gray-100">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 0, name: 'Tümü', slug: '' }, ...ageGroups]}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
            ItemSeparatorComponent={() => <View className="w-2" />}
            renderItem={({ item }) => {
              const isSelected =
                item.slug === '' ? !selectedAgeGroup : selectedAgeGroup === item.slug;
              return (
                <TouchableOpacity
                  onPress={() =>
                    handleAgeGroupSelect(item.slug === '' ? null : item.slug)
                  }
                  className={`px-4 py-2 rounded-full ${
                    isSelected
                      ? 'bg-primary'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}

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
              onAction={() => {
                setSearchQuery('');
                setSelectedAgeGroup(null);
                setFilters({ page: 1, per_page: PAGINATION.RECIPES_PER_PAGE });
              }}
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
    </View>
  );
}
