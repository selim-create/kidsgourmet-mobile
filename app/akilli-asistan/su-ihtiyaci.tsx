import React, { useEffect, useMemo, useState } from 'react';
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
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';
import type { WaterNeedResult } from '../../src/lib/types';

type Weather = 'hot' | 'normal' | 'cold';

const WEATHER_OPTIONS: { value: Weather; label: string }[] = [
  { value: 'hot', label: 'Sıcak' },
  { value: 'normal', label: 'Normal' },
  { value: 'cold', label: 'Soğuk' },
];

type Stage = 'form' | 'result';

export default function WaterCalculatorScreen() {
  const { activeChild } = useActiveChild();
  const [stage, setStage] = useState<Stage>('form');
  const [ageMonths, setAgeMonths] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weather, setWeather] = useState<Weather>('normal');
  const [isBreastfed, setIsBreastfed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaterNeedResult | null>(null);

  const autoWeight = useMemo(() => {
    if (!activeChild) return null;
    return (
      activeChild.weight_kg ??
      activeChild.current_weight_kg ??
      null
    );
  }, [activeChild]);

  useEffect(() => {
    if (!activeChild) return;
    if (activeChild.birth_date) {
      setAgeMonths(String(getAgeInMonths(activeChild.birth_date)));
    }
    if (autoWeight !== null && autoWeight !== undefined && Number.isFinite(autoWeight)) {
      setWeightKg(String(autoWeight));
    }
  }, [activeChild, autoWeight]);

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

    if (!weightKg.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Ağırlık zorunlu',
        text2: 'Lütfen bebeğinizin kilosunu girin.',
      });
      return;
    }

    const weight = parseFloat(weightKg);
    if (isNaN(weight) || weight <= 0 || weight > 30) {
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
        weather,
        is_breastfed: isBreastfed,
      });
      setResult(res);
      setStage('result');
    } catch (err) {
      if (__DEV__) {
        console.error(
          '[WaterCalculator] calculateWaterNeed error:',
          err instanceof Error ? err.message : err,
        );
      }
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
    setWeather('normal');
    setIsBreastfed(false);
    if (activeChild?.birth_date) {
      setAgeMonths(String(getAgeInMonths(activeChild.birth_date)));
    } else {
      setAgeMonths('');
    }
    if (autoWeight !== null && autoWeight !== undefined && Number.isFinite(autoWeight)) {
      setWeightKg(String(autoWeight));
    } else {
      setWeightKg('');
    }
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
          subtitle="Bebeğinizin yaş, kilo ve koşullarına göre günlük sıvı ihtiyacını hesaplayın."
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
              <Text className="text-sm font-medium text-gray-500 mb-2">Ağırlık (kg) *</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-base text-dark"
                placeholder="Örn: 7.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={weightKg}
                onChangeText={setWeightKg}
              />
            </View>

            {/* Is breastfed */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-500 mb-3">Sadece anne sütü mü?</Text>
              <View className="flex-row gap-2">
                {[
                  { label: 'Evet', value: true },
                  { label: 'Hayır', value: false },
                ].map((opt) => {
                  const selected = isBreastfed === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      onPress={() => setIsBreastfed(opt.value)}
                      activeOpacity={0.8}
                      className={`flex-1 flex-row items-center justify-center bg-white border rounded-2xl px-4 py-3 gap-3 ${selected ? 'border-cyan-500' : 'border-gray-200'}`}
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

            {/* Weather */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-500 mb-3">Hava durumu</Text>
              <View className="flex-row gap-2">
                {WEATHER_OPTIONS.map((opt) => {
                  const selected = weather === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setWeather(opt.value)}
                      activeOpacity={0.8}
                      className={`flex-1 bg-white border rounded-2xl px-4 py-3 items-center ${selected ? 'border-cyan-500' : 'border-gray-200'}`}
                    >
                      <Text
                        className={`text-sm ${selected ? 'font-semibold text-cyan-700' : 'text-dark'}`}
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
              <Text className="text-5xl font-bold text-cyan-700 mb-1">
                {result.daily_fluid_need_ml}
              </Text>
              <Text className="text-sm text-cyan-600">ml / gün</Text>
            </View>

            {/* Breakdown */}
            <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
              <Text className="text-sm font-semibold text-dark mb-3">Sıvı Dağılımı</Text>
              {[
                {
                  label: 'Anne sütü / mama',
                  value: result.breakdown.from_breast_milk_formula,
                },
                { label: 'Gıdadan', value: result.breakdown.from_food },
                { label: 'Sudan', value: result.breakdown.from_water },
              ].map((item) => (
                <View key={item.label} className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-gray-600">{item.label}</Text>
                  <Text className="text-sm font-semibold text-dark">{item.value} ml</Text>
                </View>
              ))}
            </View>

            {/* Formula */}
            <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex-row gap-3">
              <Icon name="calculator" size={18} color="#06B6D4" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-dark mb-1">Kullanılan Formül</Text>
                <Text className="text-sm text-gray-600 leading-5">{result.formula}</Text>
              </View>
            </View>

            {/* Notes */}
            {result.notes.length > 0 ? (
              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
                <Text className="text-sm font-semibold text-dark mb-3">Notlar</Text>
                {result.notes.map((note, index) => (
                  <View key={index} className="flex-row items-start gap-2 mb-2">
                    <Icon name="circle-check" size={14} color="#06B6D4" />
                    <Text className="flex-1 text-sm text-gray-600 leading-5">{note}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Warning */}
            {result.warning ? (
              <View className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex-row gap-3">
                <Icon name="triangle-exclamation" size={16} color="#D97706" />
                <Text className="flex-1 text-xs text-amber-800 leading-5">
                  {result.warning}
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
