import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ToolHeader } from '../../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../../src/components/tools/ToolGradientHero';
import { Icon } from '../../../src/components/ui/Icon';
import { searchStains } from '../../../src/services/tool-service';
import type { StainGuide } from '../../../src/lib/types';

const DEBOUNCE_MS = 400;

const popularStains: Pick<StainGuide, 'slug' | 'name' | 'emoji'>[] = [
  { slug: 'domates-lekesi', name: 'Domates', emoji: '🍅' },
  { slug: 'cikolata-lekesi', name: 'Çikolata', emoji: '🍫' },
  { slug: 'muz-lekesi', name: 'Muz', emoji: '🍌' },
  { slug: 'havuc-lekesi', name: 'Havuç', emoji: '🥕' },
  { slug: 'cim-lekesi', name: 'Çim', emoji: '🌿' },
  { slug: 'kaka-lekesi', name: 'Kaka', emoji: '💩' },
  { slug: 'kusmuk-lekesi', name: 'Kusmuk', emoji: '🤮' },
  { slug: 'anne-sutu-lekesi', name: 'Anne Sütü', emoji: '🍼' },
];

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    food: 'Yemek Lekeleri',
    bodily: 'Vücut Sıvıları',
    outdoor: 'Dış Mekan',
    craft: 'Sanat/Oyun',
    household: 'Ev İçi',
  };
  return labels[category] || category;
};

function PopularCard({ stain, onPress }: { stain: Pick<StainGuide, 'slug' | 'name' | 'emoji'>; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl p-4 mb-3 mx-4 shadow-sm border border-gray-100 flex-row items-center gap-3"
    >
      <View className="w-12 h-12 rounded-xl bg-purple-50 items-center justify-center flex-shrink-0">
        <Text className="text-2xl">{stain.emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-dark mb-0.5" numberOfLines={1}>
          {stain.name}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function StainCard({ stain, onPress }: { stain: StainGuide; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl p-4 mb-3 mx-4 shadow-sm border border-gray-100 flex-row items-center gap-3"
    >
      <View className="w-12 h-12 rounded-xl bg-purple-50 items-center justify-center flex-shrink-0">
        <Text className="text-2xl">{stain.emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-dark mb-0.5" numberOfLines={1}>
          {stain.name}
        </Text>
        {stain.category ? (
          <View className="flex-row">
            <View className="bg-purple-100 rounded-full px-2 py-0.5">
              <Text className="text-xs text-purple-700 font-medium">{getCategoryLabel(stain.category)}</Text>
            </View>
          </View>
        ) : null}
      </View>
      <Icon name="chevron-right" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function StainListScreen() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StainGuide[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!text.trim() || text.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchStains(text.trim());
        setSearchResults(Array.isArray(results) ? results : []);
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Arama sırasında hata oluştu',
          text2: 'Lütfen tekrar deneyin.',
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setSearchResults(null);
    setIsSearching(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  const handleStainPress = (slug: string) => {
    router.push(`/akilli-asistan/leke-rehberi/${slug}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Leke Ansiklopedisi — KidsGourmet ile bebek lekelerini kolayca temizle: https://kidsgourmet.com.tr/akilli-asistan/leke-rehberi',
        url: 'https://kidsgourmet.com.tr/akilli-asistan/leke-rehberi',
      });
    } catch {
      // user cancelled or error
    }
  };

  const safeResults = Array.isArray(searchResults) ? searchResults : [];
  const isInSearchMode = query.trim().length > 0;
  const showEmpty = isInSearchMode && !isSearching && searchResults !== null && safeResults.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ToolHeader title="Leke Ansiklopedisi" />

      {isInSearchMode ? (
        <FlatList
          data={safeResults}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <>
              <ToolGradientHero
                iconName="shirt"
                iconColor="#ffffff"
                gradientColors={['#8B5CF6', '#6D28D9']}
                title="Leke Ansiklopedisi"
                subtitle="Bebek kıyafetlerindeki lekeleri nasıl çıkaracağınızı öğrenin."
              />

              {/* Search Bar */}
              <View className="px-4 pt-4 pb-2">
                <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-200 gap-2">
                  <Icon name="search" size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 text-base text-dark"
                    placeholder="Leke ara... (çikolata, meyve, çimen...)"
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={handleSearch}
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                  <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="times" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {!isSearching && searchResults !== null ? (
                <View className="px-4 pt-4 pb-2">
                  <Text className="text-sm text-gray-500">
                    {safeResults.length > 0
                      ? `"${query}" için ${safeResults.length} sonuç`
                      : null}
                  </Text>
                </View>
              ) : null}
            </>
          }
          ListFooterComponent={
            <>
              {isSearching ? (
                <View className="py-8">
                  <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
              ) : null}

              {showEmpty ? (
                <View className="px-4 py-8 items-center">
                  <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                    <Icon name="search" size={28} color="#9CA3AF" />
                  </View>
                  <Text className="text-base font-semibold text-dark mb-1">Sonuç bulunamadı</Text>
                  <Text className="text-sm text-gray-500 text-center">
                    "{query}" için leke bulunamadı. Farklı bir arama terimi deneyin.
                  </Text>
                </View>
              ) : null}

              <View className="h-6" />
            </>
          }
          renderItem={({ item }) => (
            <StainCard stain={item} onPress={() => handleStainPress(item.slug)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={popularStains}
          keyExtractor={(item) => item.slug}
          ListHeaderComponent={
            <>
              <ToolGradientHero
                iconName="shirt"
                iconColor="#ffffff"
                gradientColors={['#8B5CF6', '#6D28D9']}
                title="Leke Ansiklopedisi"
                subtitle="Bebek kıyafetlerindeki lekeleri nasıl çıkaracağınızı öğrenin."
              />

              {/* Search Bar */}
              <View className="px-4 pt-4 pb-2">
                <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-200 gap-2">
                  <Icon name="search" size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 text-base text-dark"
                    placeholder="Leke ara... (çikolata, meyve, çimen...)"
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={handleSearch}
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                </View>
              </View>

              {/* Section title */}
              <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Text className="text-base font-bold text-dark">Popüler Lekeler</Text>
                <TouchableOpacity onPress={handleShare} activeOpacity={0.7} className="flex-row items-center gap-1.5">
                  <Icon name="share" size={14} color="#8B5CF6" />
                  <Text className="text-sm text-purple-600 font-medium">Paylaş</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          ListFooterComponent={<View className="h-6" />}
          renderItem={({ item }) => (
            <PopularCard stain={item} onPress={() => handleStainPress(item.slug)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
