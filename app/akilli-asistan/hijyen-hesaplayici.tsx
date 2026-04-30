import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { ToolHeader } from '../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../src/components/tools/ToolGradientHero';
import { Icon } from '../../src/components/ui/Icon';
import { calculateHygiene } from '../../src/services/tool-service';
import type { HygieneCalculatorResult } from '../../src/lib/types';

// Wipes per pack (standard pack size)
const WIPES_PER_PACK = 56;

function calculatePackages(monthlyWipes: number): number {
  return Math.ceil(monthlyWipes / WIPES_PER_PACK);
}

type Stage = 'intro' | 'form' | 'result';

interface FormState {
  baby_age_months: string;
  daily_diaper_changes: string;
  outdoor_hours: string;
  meal_count: string;
}

const DEFAULT_FORM: FormState = {
  baby_age_months: '',
  daily_diaper_changes: '',
  outdoor_hours: '',
  meal_count: '',
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  suffix?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-dark mb-1.5">{label}</Text>
      <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <TextInput
          className="flex-1 text-base text-dark"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          returnKeyType="done"
        />
        {suffix ? (
          <Text className="text-sm text-gray-400 ml-2">{suffix}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function HygieneCalculatorScreen() {
  const [stage, setStage] = useState<Stage>('intro');
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HygieneCalculatorResult | null>(null);

  const setField = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    const age = parseInt(form.baby_age_months, 10);
    const diapers = parseInt(form.daily_diaper_changes, 10);
    const outdoor = parseFloat(form.outdoor_hours);
    const meals = parseInt(form.meal_count, 10);
    return (
      !isNaN(age) && age >= 0 &&
      !isNaN(diapers) && diapers >= 0 &&
      !isNaN(outdoor) && outdoor >= 0 &&
      !isNaN(meals) && meals >= 0
    );
  };

  const handleCalculate = async () => {
    if (!isFormValid()) {
      Toast.show({
        type: 'error',
        text1: 'Lütfen tüm alanları doldurun',
        text2: 'Geçerli sayısal değerler girin.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await calculateHygiene({
        baby_age_months: parseInt(form.baby_age_months, 10),
        daily_diaper_changes: parseInt(form.daily_diaper_changes, 10),
        outdoor_hours: parseFloat(form.outdoor_hours),
        meal_count: parseInt(form.meal_count, 10),
      });
      setResult(res);
      setStage('result');
    } catch {
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
    setForm(DEFAULT_FORM);
    setResult(null);
    setStage('intro');
  };

  const handleShare = async () => {
    if (!result) return;
    const packs = calculatePackages(result.monthly_wipes_needed);
    const text =
      `Günlük Hijyen İhtiyacı Hesaplayıcı — KidsGourmet\n\n` +
      `Aylık mendil ihtiyacı: ${result.monthly_wipes_needed} adet (≈ ${packs} paket)\n\n` +
      `Öneriler:\n${result.recommendations.map((r) => `• ${r}`).join('\n')}\n\n` +
      `https://kidsgourmet.com.tr/akilli-asistan/hijyen-hesaplayici`;

    try {
      const shareResult = await Share.share({ message: text });
      if (shareResult.action === Share.dismissedAction) return;
    } catch {
      // fallback: copy to clipboard
      await Clipboard.setStringAsync(text);
      Toast.show({
        type: 'success',
        text1: 'Panoya kopyalandı',
        text2: 'Sonuçlar panonuza kopyalandı.',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ToolHeader title="Günlük Hijyen İhtiyacı Hesaplayıcı" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <ToolGradientHero
            iconName="hand-sparkles"
            iconColor="#ffffff"
            gradientColors={['#14B8A6', '#06B6D4']}
            title="Günlük Hijyen İhtiyacı Hesaplayıcı"
            subtitle="Bebeğinizin yaşına ve günlük rutinine göre aylık mendil ihtiyacınızı ve taşıma çantası listesini hesaplayın."
          />

          {/* Intro stage */}
          {stage === 'intro' ? (
            <View className="px-4 pt-6">
              <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                <Text className="text-base font-bold text-dark mb-2">Bu araç ne yapar?</Text>
                <Text className="text-sm text-gray-600 leading-5 mb-3">
                  Bebeğinizin yaşı, günlük bez değiştirme sayısı, dışarıda geçirilen süre ve öğün sayısına göre aylık mendil ihtiyacınızı ve kaç paket almanız gerektiğini hesaplar.
                </Text>
                <View className="flex-row items-start gap-2 mb-2">
                  <Icon name="check-circle" size={16} color="#14B8A6" />
                  <Text className="text-sm text-gray-600 flex-1">Aylık mendil miktarı ve paket sayısı</Text>
                </View>
                <View className="flex-row items-start gap-2 mb-2">
                  <Icon name="check-circle" size={16} color="#14B8A6" />
                  <Text className="text-sm text-gray-600 flex-1">Kişiselleştirilmiş hijyen önerileri</Text>
                </View>
                <View className="flex-row items-start gap-2">
                  <Icon name="check-circle" size={16} color="#14B8A6" />
                  <Text className="text-sm text-gray-600 flex-1">Taşıma çantası için temel malzeme listesi</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setStage('form')}
                activeOpacity={0.85}
                className="bg-teal-500 rounded-2xl py-4 items-center"
              >
                <Text className="text-white font-bold text-base">Hesaplamaya Başla</Text>
              </TouchableOpacity>

              <View className="h-8" />
            </View>
          ) : null}

          {/* Form stage */}
          {stage === 'form' ? (
            <View className="px-4 pt-6">
              <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                <Text className="text-base font-bold text-dark mb-4">Bilgileri Girin</Text>

                <FormField
                  label="Bebeğin Yaşı (ay)"
                  value={form.baby_age_months}
                  onChangeText={setField('baby_age_months')}
                  placeholder="Örn. 8"
                  suffix="ay"
                />

                <FormField
                  label="Günlük Bez Değiştirme Sayısı"
                  value={form.daily_diaper_changes}
                  onChangeText={setField('daily_diaper_changes')}
                  placeholder="Örn. 6"
                  suffix="kez"
                />

                <FormField
                  label="Günlük Dışarıda Geçirilen Süre"
                  value={form.outdoor_hours}
                  onChangeText={setField('outdoor_hours')}
                  placeholder="Örn. 2"
                  suffix="saat"
                />

                <FormField
                  label="Günlük Öğün Sayısı"
                  value={form.meal_count}
                  onChangeText={setField('meal_count')}
                  placeholder="Örn. 3"
                  suffix="öğün"
                />
              </View>

              <TouchableOpacity
                onPress={handleCalculate}
                disabled={loading}
                activeOpacity={0.85}
                className="bg-teal-500 rounded-2xl py-4 items-center mb-3"
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">Hesapla</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStage('intro')}
                activeOpacity={0.7}
                className="py-3 items-center"
              >
                <Text className="text-gray-400 text-sm">Geri</Text>
              </TouchableOpacity>

              <View className="h-8" />
            </View>
          ) : null}

          {/* Result stage */}
          {stage === 'result' && result ? (
            <View className="px-4 pt-6">
              {/* Monthly wipes summary card */}
              <View className="bg-teal-500 rounded-2xl p-5 shadow-sm mb-4 items-center">
                <Text className="text-white/80 text-sm mb-1">Aylık Mendil İhtiyacı</Text>
                <Text className="text-white text-5xl font-bold mb-1">
                  {result.monthly_wipes_needed}
                </Text>
                <Text className="text-white/80 text-sm">adet</Text>
                <View className="mt-3 bg-white/20 rounded-xl px-4 py-2">
                  <Text className="text-white text-sm font-semibold text-center">
                    ≈ {calculatePackages(result.monthly_wipes_needed)} paket ({WIPES_PER_PACK} mendil/paket)
                  </Text>
                </View>
              </View>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 ? (
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Icon name="lightbulb" size={18} color="#14B8A6" />
                    <Text className="text-base font-bold text-dark">Öneriler</Text>
                  </View>
                  {result.recommendations.map((rec, idx) => (
                    <View key={idx} className="flex-row items-start gap-2 mb-2">
                      <View className="w-5 h-5 rounded-full bg-teal-100 items-center justify-center mt-0.5 flex-shrink-0">
                        <Text className="text-xs font-bold text-teal-700">{idx + 1}</Text>
                      </View>
                      <Text className="text-sm text-gray-700 leading-5 flex-1">{rec}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Carry bag essentials */}
              {result.carry_bag_essentials && result.carry_bag_essentials.length > 0 ? (
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Icon name="box" size={18} color="#14B8A6" />
                    <Text className="text-base font-bold text-dark">Çanta İçeriği</Text>
                  </View>
                  {result.carry_bag_essentials.map((item, idx) => (
                    <View key={idx} className="flex-row items-center gap-2 mb-2">
                      <Icon name="check-circle" size={14} color="#14B8A6" />
                      <Text className="text-sm text-gray-700 flex-1">{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Sponsor */}
              {result.sponsor ? (
                <View className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-4">
                  <Text className="text-xs text-teal-600 font-medium mb-1">Sponsorlu İçerik</Text>
                  <Text className="text-sm text-teal-800 font-semibold">{result.sponsor.name}</Text>
                  {result.sponsor.cta ? (
                    <Text className="text-xs text-teal-600 mt-0.5">{result.sponsor.cta}</Text>
                  ) : null}
                </View>
              ) : null}

              {/* Action buttons */}
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.85}
                className="flex-row items-center justify-center bg-white border border-teal-200 rounded-2xl py-4 mb-3 gap-2"
              >
                <Icon name="share" size={16} color="#14B8A6" />
                <Text className="text-teal-600 font-semibold text-base">Sonuçları Paylaş</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.85}
                className="bg-teal-500 rounded-2xl py-4 items-center"
              >
                <Text className="text-white font-bold text-base">Yeniden Hesapla</Text>
              </TouchableOpacity>

              <View className="h-8" />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
