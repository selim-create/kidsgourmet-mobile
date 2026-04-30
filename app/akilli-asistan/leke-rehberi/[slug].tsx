import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
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
          ? `${stain.title} — Leke Ansiklopedisi: ${url}`
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ToolHeader title={stain.title} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="bg-white border-b border-gray-100 px-4 pt-5 pb-6">
          {stain.image ? (
            <Image
              source={{ uri: stain.image }}
              className="w-full h-48 rounded-2xl mb-4 bg-gray-100"
              resizeMode="cover"
            />
          ) : null}

          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-dark mb-2">{stain.title}</Text>
              {stain.stain_type ? (
                <View className="flex-row">
                  <View className="bg-purple-100 rounded-full px-3 py-1">
                    <Text className="text-xs font-semibold text-purple-700">{stain.stain_type}</Text>
                  </View>
                </View>
              ) : null}
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
          {/* Removal Steps */}
          {stain.removal_steps && stain.removal_steps.length > 0 ? (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
                  <Icon name="list-ol" size={16} color="#8B5CF6" />
                </View>
                <Text className="text-base font-bold text-dark">Temizleme Adımları</Text>
              </View>
              {stain.removal_steps.map((step, index) => (
                <View key={index} className="flex-row gap-3 mb-3">
                  <View className="w-6 h-6 rounded-full bg-purple-600 items-center justify-center flex-shrink-0 mt-0.5">
                    <Text className="text-white text-xs font-bold">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-sm text-gray-700 leading-5">{step}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Products */}
          {stain.products && stain.products.length > 0 ? (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                  <Icon name="box" size={16} color="#3B82F6" />
                </View>
                <Text className="text-base font-bold text-dark">Önerilen Ürünler</Text>
              </View>
              {stain.products.map((product, index) => (
                <View key={index} className="flex-row items-start gap-2.5 mb-2.5">
                  <View className="w-5 h-5 rounded-full bg-blue-50 items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="check-circle" size={12} color="#3B82F6" />
                  </View>
                  <Text className="flex-1 text-sm text-gray-700 leading-5">{product}</Text>
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

          {/* Tips */}
          {stain.tips && stain.tips.length > 0 ? (
            <View className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center">
                  <Icon name="lightbulb" size={16} color="#D97706" />
                </View>
                <Text className="text-base font-bold text-yellow-900">İpuçları</Text>
              </View>
              {stain.tips.map((tip, index) => (
                <View key={index} className="flex-row items-start gap-2.5 mb-2.5">
                  <View className="flex-shrink-0 mt-0.5">
                    <Icon name="lightbulb" size={12} color="#D97706" />
                  </View>
                  <Text className="flex-1 text-sm text-yellow-800 leading-5">{tip}</Text>
                </View>
              ))}
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
