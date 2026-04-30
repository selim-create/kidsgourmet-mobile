import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import useSWR from 'swr';
import Toast from 'react-native-toast-message';
import { ToolHeader } from '../../../src/components/tools/ToolHeader';
import { Icon } from '../../../src/components/ui/Icon';
import { getStainBySlug } from '../../../src/services/tool-service';

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

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'Kolay';
    case 'medium': return 'Orta';
    case 'hard': return 'Zor';
    default: return difficulty;
  }
};

const getDifficultyColors = (difficulty: string): { bg: string; text: string } => {
  switch (difficulty) {
    case 'easy': return { bg: '#D1FAE5', text: '#065F46' };
    case 'medium': return { bg: '#FEF3C7', text: '#92400E' };
    case 'hard': return { bg: '#FEE2E2', text: '#991B1B' };
    default: return { bg: '#F3F4F6', text: '#374151' };
  }
};

export default function StainDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: stain, isLoading, error } = useSWR(
    slug ? `stain-${slug}` : null,
    () => getStainBySlug(slug as string),
  );

  const handleShare = async () => {
    const url = `https://kidsgourmet.com.tr/akilli-asistan/leke-rehberi/${slug}`;
    try {
      await Share.share({
        message: stain
          ? `${stain.emoji} ${stain.name} — Leke Ansiklopedisi: ${url}`
          : url,
        url,
      });
    } catch {
      // user cancelled
    }
  };

  const handleCopyLink = async () => {
    const url = `https://kidsgourmet.com.tr/akilli-asistan/leke-rehberi/${slug}`;
    await Clipboard.setStringAsync(url);
    Toast.show({
      type: 'success',
      text1: 'Bağlantı kopyalandı!',
      text2: 'Leke rehberi linki panoya kopyalandı.',
      visibilityTime: 2000,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Leke Detayı" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="mt-3 text-gray-500 text-sm">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !stain) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Leke Detayı" />
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="exclamation-circle" size={40} color="#DC2626" />
          <Text className="text-lg font-bold text-dark mt-4 mb-2 text-center">
            Leke bulunamadı
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-6">
            Bu leke bilgisi yüklenemedi. Lütfen geri dönüp tekrar deneyin.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-purple-600 rounded-xl px-6 py-3"
          >
            <Text className="text-white font-semibold">Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const difficultyColors = getDifficultyColors(stain.difficulty);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ToolHeader title={stain.name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="bg-white border-b border-gray-100 px-4 pt-5 pb-6">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-4xl mb-2">{stain.emoji}</Text>
              <Text className="text-2xl font-bold text-dark mb-2">{stain.name}</Text>
              <View className="flex-row gap-2 flex-wrap">
                <View className="bg-purple-100 rounded-full px-3 py-1">
                  <Text className="text-xs font-semibold text-purple-700">{getCategoryLabel(stain.category)}</Text>
                </View>
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: difficultyColors.bg }}>
                  <Text className="text-xs font-semibold" style={{ color: difficultyColors.text }}>
                    {getDifficultyLabel(stain.difficulty)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleCopyLink}
                activeOpacity={0.7}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              >
                <Icon name="link" size={16} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.7}
                className="w-9 h-9 rounded-full bg-purple-100 items-center justify-center"
              >
                <Icon name="share" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4 gap-4">
          {/* Steps */}
          {stain.steps && stain.steps.length > 0 ? (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
                  <Icon name="list-ol" size={16} color="#8B5CF6" />
                </View>
                <Text className="text-base font-bold text-dark">Temizleme Adımları</Text>
              </View>
              {stain.steps.map((s, index) => (
                <View key={index} className="mb-4">
                  <View className="flex-row gap-3">
                    <View className="w-6 h-6 rounded-full bg-purple-600 items-center justify-center flex-shrink-0 mt-0.5">
                      <Text className="text-white text-xs font-bold">{s.step}</Text>
                    </View>
                    <Text className="flex-1 text-sm text-gray-700 leading-5">{s.instruction}</Text>
                  </View>
                  {s.tip ? (
                    <View className="ml-9 mt-2 flex-row items-start gap-2">
                      <Icon name="lightbulb" size={12} color="#D97706" />
                      <Text className="flex-1 text-xs text-yellow-700 leading-4">{s.tip}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Warnings */}
          {stain.warnings && stain.warnings.length > 0 ? (
            <View className="bg-red-50 rounded-2xl p-4 border border-red-200">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
                  <Icon name="triangle-exclamation" size={16} color="#DC2626" />
                </View>
                <Text className="text-base font-bold text-red-800">Uyarılar</Text>
              </View>
              {stain.warnings.map((warning, index) => (
                <View key={index} className="flex-row items-start gap-2.5 mb-2.5">
                  <View className="flex-shrink-0 mt-0.5">
                    <Icon name="exclamation-circle" size={14} color="#DC2626" />
                  </View>
                  <Text className="flex-1 text-sm text-red-700 leading-5">{warning}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Related Ingredients */}
          {stain.related_ingredients && stain.related_ingredients.length > 0 ? (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                  <Icon name="box" size={16} color="#3B82F6" />
                </View>
                <Text className="text-base font-bold text-dark">İlgili Maddeler</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {stain.related_ingredients.map((ingredient, index) => (
                  <View key={index} className="bg-blue-50 rounded-full px-3 py-1">
                    <Text className="text-xs text-blue-700 font-medium">{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Sponsor CTA */}
          {stain.sponsor ? (
            <View className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <Text className="text-xs text-purple-500 font-medium mb-1">Sponsor</Text>
              <Text className="text-sm text-purple-800 font-semibold">{stain.sponsor.name}</Text>
            </View>
          ) : null}

          {/* Info footer */}
          <View className="bg-gray-100 rounded-2xl p-4 flex-row items-start gap-2.5">
            <Icon name="info-circle" size={16} color="#6B7280" />
            <Text className="flex-1 text-xs text-gray-500 leading-4">
              Bu bilgiler genel rehber niteliğindedir. Hassas kumaşlar için bir profesyonele danışmanızı öneririz.
            </Text>
          </View>

          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
