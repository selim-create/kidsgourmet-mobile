import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ToolHeader } from '../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../src/components/tools/ToolGradientHero';
import { Icon } from '../../src/components/ui/Icon';
import { calculateWaterNeed } from '../../src/services/tool-service';
import type { WaterNeedResult } from '../../src/lib/types';

type FeedingType = 'breast' | 'formula' | 'mixed' | 'solid';

const FEEDING_OPTIONS: { value: FeedingType; label: string }[] = [
  { value: 'breast', label: 'Anne Sütü' },
  { value: 'formula', label: 'Mama' },
  { value: 'mixed', label: 'Karma' },
  { value: 'solid', label: 'Katı Gıda' },
];

type Stage = 'form' | 'result';

export default function WaterCalculatorScreen() {
  const [stage, setStage] = useState<Stage>('form');
  const [ageMonths, setAgeMonths] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [feedingType, setFeedingType] = useState<FeedingType>('breast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaterNeedResult | null>(null);

  const handleCalculate = async () => {
    const age = parseInt(ageMonths, 10);
    if (!ageMonths.trim() || isNaN(age) || age < 0 || age > 36) {
      Toast.show({
        type: 'error',
        text1: 'Geçersiz yaş',
        text2: 'Lütfen 0–36 arasında bir ay değeri girin.',
      });
      return;
    }

    const weight = weightKg.trim() ? parseFloat(weightKg) : undefined;
    if (weight !== undefined && (isNaN(weight) || weight <= 0 || weight > 30)) {
      Toast.show({
        type: 'error',
        text1: 'Geçersiz ağırlık',
        text2: 'Lütfen geçerli bir ağırlık değeri girin.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await calculateWaterNeed({
        age_months: age,
        weight_kg: weight,
        feeding_type: feedingType,
      });
      setResult(res);
      setStage('result');
    } catch (err) {
      console.error('[WaterCalculator] calculateWaterNeed error:', err);
      Toast.show({
        type: 'error',
        text1: 'Hesaplama başarısız',
        text2: 'Lütfen tekrar deneyin.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStage('form');
    setResult(null);
    setAgeMonths('');
    setWeightKg('');
    setFeedingType('breast');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ToolHeader title="Su İhtiyacı Hesaplayıcı" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ToolGradientHero
          iconName="droplet"
          iconColor="#ffffff"
          gradientColors={['#06B6D4', '#0891B2']}
          title="Su İhtiyacı Hesaplayıcı"
          subtitle="Bebeğinizin yaş ve beslenme şekline göre günlük su ihtiyacını hesaplayın."
        />

        {stage === 'form' ? (
          <View className="px-4 pt-6 pb-8">
            {/* Age field */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-2">Yaş (ay) *</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-base text-dark"
                placeholder="Örn: 6"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={ageMonths}
                onChangeText={setAgeMonths}
                maxLength={2}
              />
              <Text className="text-xs text-gray-400 mt-1">0–36 ay arası girin</Text>
            </View>

            {/* Weight field */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-2">
                Ağırlık (kg) — opsiyonel
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-base text-dark"
                placeholder="Örn: 7.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={weightKg}
                onChangeText={setWeightKg}
              />
            </View>

            {/* Feeding type */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-500 mb-3">Beslenme Türü</Text>
              <View className="gap-2">
                {FEEDING_OPTIONS.map((opt) => {
                  const selected = feedingType === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setFeedingType(opt.value)}
                      activeOpacity={0.8}
                      className={`flex-row items-center bg-white border rounded-2xl px-4 py-3 gap-3 ${selected ? 'border-cyan-500' : 'border-gray-200'}`}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-300'}`}
                      >
                        {selected && <View className="w-2 h-2 rounded-full bg-white" />}
                      </View>
                      <Text
                        className={`text-base ${selected ? 'font-semibold text-cyan-700' : 'text-dark'}`}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Calculate button */}
            <TouchableOpacity
              onPress={handleCalculate}
              disabled={loading}
              activeOpacity={0.85}
              className="bg-cyan-500 rounded-2xl py-4 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Hesapla</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : result ? (
          <View className="px-4 pt-6 pb-8">
            {/* Daily ml — prominent */}
            <View className="bg-cyan-50 border border-cyan-100 rounded-2xl p-5 mb-4 items-center">
              <Text className="text-xs font-medium text-cyan-600 uppercase tracking-wide mb-1">
                Günlük Su İhtiyacı
              </Text>
              <Text className="text-5xl font-bold text-cyan-700 mb-1">{result.daily_ml}</Text>
              <Text className="text-sm text-cyan-600">ml / gün</Text>
            </View>

            {/* Min–Max range */}
            {(result.min_ml !== undefined || result.max_ml !== undefined) && (
              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex-row justify-around">
                {result.min_ml !== undefined && (
                  <View className="items-center">
                    <Text className="text-xs text-gray-500 mb-1">Minimum</Text>
                    <Text className="text-xl font-bold text-dark">{result.min_ml}</Text>
                    <Text className="text-xs text-gray-400">ml</Text>
                  </View>
                )}
                {result.min_ml !== undefined && result.max_ml !== undefined && (
                  <View className="w-px bg-gray-100" />
                )}
                {result.max_ml !== undefined && (
                  <View className="items-center">
                    <Text className="text-xs text-gray-500 mb-1">Maksimum</Text>
                    <Text className="text-xl font-bold text-dark">{result.max_ml}</Text>
                    <Text className="text-xs text-gray-400">ml</Text>
                  </View>
                )}
              </View>
            )}

            {/* Note */}
            {result.note ? (
              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex-row gap-3">
                <Icon name="info-circle" size={18} color="#06B6D4" />
                <Text className="flex-1 text-sm text-dark leading-5">{result.note}</Text>
              </View>
            ) : null}

            {/* Sources */}
            {result.sources && result.sources.length > 0 ? (
              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
                <Text className="text-sm font-semibold text-dark mb-3">Kaynaklar</Text>
                {result.sources.map((source, index) => (
                  <View key={index} className="flex-row gap-2 mb-2">
                    <Icon name="link" size={14} color="#9CA3AF" />
                    <Text className="flex-1 text-sm text-gray-600 leading-5">{source}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Disclaimer */}
            {result.disclaimer ? (
              <View className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex-row gap-3">
                <Icon name="triangle-exclamation" size={16} color="#D97706" />
                <Text className="flex-1 text-xs text-amber-800 leading-5">
                  {result.disclaimer}
                </Text>
              </View>
            ) : null}

            {/* Reset button */}
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.85}
              className="bg-gray-100 rounded-2xl py-4 items-center justify-center flex-row gap-2"
            >
              <Icon name="rotate-left" size={16} color="#475569" />
              <Text className="text-dark text-base font-semibold">Yeniden Hesapla</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
