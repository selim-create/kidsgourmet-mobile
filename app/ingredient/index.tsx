import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useIngredients } from '../../src/hooks/useIngredients';
import { IngredientCard } from '../../src/components/ingredients/IngredientCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { COLORS } from '../../src/lib/constants';

const AGE_FILTERS: { label: string; months: number | undefined }[] = [
  { label: 'Tümü', months: undefined },
  { label: '4-6 ay', months: 4 },
  { label: '6-8 ay', months: 6 },
  { label: '8-10 ay', months: 8 },
  { label: '10-12 ay', months: 10 },
  { label: '12+ ay', months: 12 },
];

const QUICK_GUIDES = [
  { title: 'Ek Gıda Rehberi', icon: 'leaf-outline' as const, color: '#7CB342', bg: '#F0FDF4', route: '/food-guide' },
  { title: 'Büyüme Takibi', icon: 'trending-up-outline' as const, color: '#0EA5E9', bg: '#E0F2FE', route: '/growth' },
  { title: 'Aşı Takvimi', icon: 'medical-outline' as const, color: '#EF4444', bg: '#FEF2F2', route: '/vaccines' },
];

export default function IngredientListScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAge, setSelectedAge] = useState<number | undefined>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ingredients, isLoading, error } = useIngredients({ search: debouncedSearch, age: selectedAge });

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 500);
  };

  const handleClear = () => {
    setSearch('');
    setDebouncedSearch('');
  };

  const filtered = ingredients;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-light">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text className="text-dark text-xl font-bold">Beslenme Rehberi</Text>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={handleSearchChange}
            placeholder="Malzeme ara..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 py-3 text-dark"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.8}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Guides strip */}
        <View style={styles.quickGuidesContainer}>
          <Text style={styles.quickGuidesTitle}>Diğer Rehberler</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickGuidesScroll}
          >
            {QUICK_GUIDES.map((guide) => (
              <TouchableOpacity
                key={guide.title}
                style={[styles.quickGuideCard, { backgroundColor: guide.bg }]}
                activeOpacity={0.8}
                onPress={() => router.push(guide.route as never)}
              >
                <View style={[styles.quickGuideIconWrap, { backgroundColor: guide.color + '22' }]}>
                  <Ionicons name={guide.icon} size={20} color={guide.color} />
                </View>
                <Text style={styles.quickGuideText} numberOfLines={2}>
                  {guide.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Age filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {AGE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.label}
              onPress={() => setSelectedAge(f.months)}
              activeOpacity={0.8}
              className={`mr-2 px-4 py-1.5 rounded-full border ${
                selectedAge === f.months
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedAge === f.months ? 'text-white' : 'text-gray-500'
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <EmptyState
            icon="wifi-outline"
            title="Malzemeler yüklenemedi"
            description="Daha sonra tekrar deneyin."
          />
        ) : isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text className="text-gray-400 text-sm mt-3">Yükleniyor...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="nutrition-outline"
            title="Malzeme bulunamadı"
            description={
              debouncedSearch
                ? `"${debouncedSearch}" için sonuç yok.`
                : 'Arama yapın veya filtre uygulayın.'
            }
          />
        ) : (
          <>
            <Text className="text-gray-400 text-xs mb-3">{filtered.length} malzeme</Text>
            {filtered.map((item) => (
              <IngredientCard key={item.id} item={item} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  quickGuidesContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  quickGuidesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickGuidesScroll: {
    paddingRight: 8,
    gap: 10,
  },
  quickGuideCard: {
    width: 130,
    height: 76,
    borderRadius: 16,
    padding: 10,
    justifyContent: 'space-between',
  },
  quickGuideIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGuideText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 16,
  },
});
