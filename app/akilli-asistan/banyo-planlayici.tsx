import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ToolHeader } from '../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../src/components/tools/ToolGradientHero';
import { Icon } from '../../src/components/ui/Icon';
import { getBathPlannerConfig, generateBathPlan } from '../../src/services/tool-service';
import type { BathPlannerConfig, BathPlannerResult } from '../../src/lib/types';

type Stage = 'intro' | 'form' | 'result';

const DEFAULT_SKIN_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'sensitive', label: 'Hassas' },
  { value: 'dry', label: 'Kuru' },
  { value: 'oily', label: 'Yağlı' },
];

const SEASON_LABELS: Record<string, string> = {
  spring: 'İlkbahar',
  summer: 'Yaz',
  autumn: 'Sonbahar',
  fall: 'Sonbahar',
  winter: 'Kış',
};

function getSeasonLabel(season: string): string {
  return SEASON_LABELS[season.toLowerCase()] ?? season;
}

export default function BanyoPlanlayiciScreen() {
  const [stage, setStage] = useState<Stage>('intro');
  const [config, setConfig] = useState<BathPlannerConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(false);

  const [babyAgeMonths, setBabyAgeMonths] = useState('');
  const [skinType, setSkinType] = useState('normal');
  const [season, setSeason] = useState('');
  const [hasEczema, setHasEczema] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BathPlannerResult | null>(null);

  useEffect(() => {
    getBathPlannerConfig()
      .then((cfg) => {
        setConfig(cfg);
        if (cfg.seasons && cfg.seasons.length > 0) {
          setSeason(cfg.seasons[0]);
        }
      })
      .catch(() => {
        setConfigError(true);
      })
      .finally(() => {
        setConfigLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    const age = parseInt(babyAgeMonths, 10);
    if (!babyAgeMonths.trim() || isNaN(age) || age < 0 || age > 216) {
      Toast.show({
        type: 'error',
        text1: 'Geçersiz yaş',
        text2: 'Lütfen geçerli bir ay cinsinden yaş girin (0–216).',
      });
      return;
    }
    if (!season) {
      Toast.show({
        type: 'error',
        text1: 'Mevsim seçin',
        text2: 'Lütfen bir mevsim seçin.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await generateBathPlan({
        baby_age_months: age,
        skin_type: skinType,
        season,
        has_eczema: hasEczema,
      });
      setResult(res);
      setStage('result');
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Bir hata oluştu',
        text2: 'Plan oluşturulurken hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStage('form');
  };

  if (configLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Banyo Rutini Planlayıcı" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text className="mt-3 text-gray-500 text-sm">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (configError || !config) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Banyo Rutini Planlayıcı" />
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="exclamation-circle" size={40} color="#DC2626" />
          <Text className="text-lg font-bold text-dark mt-4 mb-2 text-center">
            Yüklenemedi
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Banyo planlayıcı yapılandırması yüklenemedi. Lütfen tekrar deneyin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Intro Stage ─────────────────────────────────────────────────────────────

  if (stage === 'intro') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Banyo Rutini Planlayıcı" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <ToolGradientHero
            iconName="bath"
            iconColor="#ffffff"
            gradientColors={['#0EA5E9', '#38BDF8']}
            title="Banyo Rutini Planlayıcı"
            subtitle="Bebeğiniz için mevsime ve cilt tipine göre ideal banyo sıklığını ve rutinini planlayın."
          />

          <View className="px-4 pt-6 gap-4">
            <View className="bg-white rounded-2xl p-4 border border-gray-100 gap-3">
              {(
                [
                  { icon: 'calendar', text: 'Haftalık banyo sıklığı önerisi' },
                  { icon: 'clock', text: 'En uygun banyo saati' },
                  { icon: 'droplet', text: 'İdeal su sıcaklığı' },
                  { icon: 'lightbulb', text: 'Cilt tipine özel bakım ipuçları' },
                ] as const
              ).map(({ icon, text }) => (
                <View key={text} className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-sky-100 items-center justify-center flex-shrink-0">
                    <Icon name={icon} size={15} color="#0EA5E9" />
                  </View>
                  <Text className="flex-1 text-sm text-gray-700">{text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setStage('form')}
              activeOpacity={0.85}
              className="bg-sky-500 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-bold text-base">Planlamaya Başla</Text>
            </TouchableOpacity>

            <View className="h-4" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Form Stage ───────────────────────────────────────────────────────────────

  if (stage === 'form') {
    const skinTypeOptions = config.skin_types
      ? config.skin_types.map((v) => ({
          value: v,
          label: v.charAt(0).toUpperCase() + v.slice(1),
        }))
      : DEFAULT_SKIN_TYPES;

    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Banyo Rutini Planlayıcı" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="px-4 pt-5 gap-5">
              {/* Baby Age */}
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-sm font-semibold text-dark mb-3">
                  Bebek Yaşı (ay cinsinden)
                </Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 text-dark text-base border border-gray-200"
                  placeholder="Örn: 8"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={babyAgeMonths}
                  onChangeText={setBabyAgeMonths}
                  maxLength={3}
                />
              </View>

              {/* Skin Type */}
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-sm font-semibold text-dark mb-3">Cilt Tipi</Text>
                <View className="flex-row flex-wrap gap-2">
                  {skinTypeOptions.map((opt) => {
                    const isSelected = skinType === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setSkinType(opt.value)}
                        activeOpacity={0.8}
                        className={`px-4 py-2 rounded-full border ${
                          isSelected ? 'bg-sky-500 border-sky-500' : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Season */}
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-sm font-semibold text-dark mb-3">Mevsim</Text>
                <View className="flex-row flex-wrap gap-2">
                  {config.seasons.map((s) => {
                    const isSelected = season === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setSeason(s)}
                        activeOpacity={0.8}
                        className={`px-4 py-2 rounded-full border ${
                          isSelected ? 'bg-sky-500 border-sky-500' : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {getSeasonLabel(s)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Has Eczema */}
              <TouchableOpacity
                onPress={() => setHasEczema((prev) => !prev)}
                activeOpacity={0.8}
                className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-semibold text-dark">Egzama var mı?</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Cilt hassasiyeti için özelleştirilmiş öneriler alın
                  </Text>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    hasEczema ? 'bg-sky-500 border-sky-500' : 'bg-white border-gray-300'
                  }`}
                >
                  {hasEczema ? <Icon name="check" size={12} color="#ffffff" /> : null}
                </View>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={isSubmitting}
                className="bg-sky-500 rounded-2xl py-4 items-center"
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">Plan Oluştur</Text>
                )}
              </TouchableOpacity>

              <View className="h-6" />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── Result Stage ─────────────────────────────────────────────────────────────

  if (stage === 'result' && result) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Banyo Rutini Planlayıcı" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Result header */}
          <View className="bg-sky-500 px-4 pt-6 pb-8 items-center">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
              <Icon name="check-circle" size={32} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-white">Banyo Planınız Hazır!</Text>
            <Text className="text-white/80 text-sm mt-1 text-center">
              Bebeğinize özel banyo rutini oluşturuldu.
            </Text>
          </View>

          <View className="px-4 pt-4 gap-4">
            {/* Frequency */}
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-sky-100 items-center justify-center">
                  <Icon name="calendar" size={15} color="#0EA5E9" />
                </View>
                <Text className="text-sm font-bold text-dark">Haftalık Banyo Sıklığı</Text>
              </View>
              <Text className="text-2xl font-bold text-sky-500">
                Haftada {result.frequency_per_week} kez
              </Text>
            </View>

            {/* Best Time */}
            {result.best_time ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-8 h-8 rounded-full bg-sky-100 items-center justify-center">
                    <Icon name="clock" size={15} color="#0EA5E9" />
                  </View>
                  <Text className="text-sm font-bold text-dark">En İyi Banyo Saati</Text>
                </View>
                <Text className="text-base text-gray-700">{result.best_time}</Text>
              </View>
            ) : null}

            {/* Duration */}
            {result.duration_minutes ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-8 h-8 rounded-full bg-sky-100 items-center justify-center">
                    <Icon name="hourglass" size={15} color="#0EA5E9" />
                  </View>
                  <Text className="text-sm font-bold text-dark">Önerilen Süre</Text>
                </View>
                <Text className="text-base text-gray-700">{result.duration_minutes} dakika</Text>
              </View>
            ) : null}

            {/* Water Temperature */}
            {result.water_temperature ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-8 h-8 rounded-full bg-sky-100 items-center justify-center">
                    <Icon name="droplet" size={15} color="#0EA5E9" />
                  </View>
                  <Text className="text-sm font-bold text-dark">Su Sıcaklığı</Text>
                </View>
                <Text className="text-base text-gray-700">{result.water_temperature}</Text>
              </View>
            ) : null}

            {/* Tips */}
            {result.tips && result.tips.length > 0 ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center">
                    <Icon name="lightbulb" size={15} color="#D97706" />
                  </View>
                  <Text className="text-sm font-bold text-dark">İpuçları</Text>
                </View>
                {result.tips.map((tip, index) => (
                  <View key={index} className="flex-row items-start gap-2.5 mb-2.5">
                    <View className="w-5 h-5 rounded-full bg-sky-100 items-center justify-center flex-shrink-0 mt-0.5">
                      <Text className="text-sky-600 text-xs font-bold">{index + 1}</Text>
                    </View>
                    <Text className="flex-1 text-sm text-gray-700 leading-5">{tip}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Products */}
            {result.products && result.products.length > 0 ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                    <Icon name="box" size={15} color="#3B82F6" />
                  </View>
                  <Text className="text-sm font-bold text-dark">Önerilen Ürünler</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {result.products.map((product, index) => (
                    <View key={index} className="bg-blue-50 rounded-full px-3 py-1.5">
                      <Text className="text-xs text-blue-700 font-medium">{product}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Disclaimer */}
            {result.disclaimer ? (
              <View className="bg-gray-100 rounded-2xl p-4 flex-row items-start gap-2.5">
                <Icon name="info-circle" size={16} color="#6B7280" />
                <Text className="flex-1 text-xs text-gray-500 leading-4">
                  {result.disclaimer}
                </Text>
              </View>
            ) : null}

            {/* New Plan Button */}
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.85}
              className="bg-sky-500 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-bold text-base">Yeni Plan Oluştur</Text>
            </TouchableOpacity>

            <View className="h-6" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}
