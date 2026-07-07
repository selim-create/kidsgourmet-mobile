import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import useSWR from 'swr';
import { ToolHeader } from '../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../src/components/tools/ToolGradientHero';
import { Icon } from '../../src/components/ui/Icon';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { getAllergenPlannerConfig, generateAllergenPlan } from '../../src/services/tool-service';
import type { AllergenPlannerConfig, AllergenTrialPlan } from '../../src/lib/types';
import { API_ENDPOINTS } from '../../src/lib/constants';

type Stage = 'intro' | 'form' | 'result';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AlerjenPlanlayiciScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeChild } = useActiveChild();

  const [stage, setStage] = useState<Stage>('intro');
  const [selectedAllergenId, setSelectedAllergenId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plan, setPlan] = useState<AllergenTrialPlan | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [authLoading, isAuthenticated]);

  // Fetch config with SWR (allergen list is cacheable)
  const {
    data: config,
    error: configError,
    isLoading: configLoading,
  } = useSWR<AllergenPlannerConfig>(
    isAuthenticated ? API_ENDPOINTS.ALLERGEN_PLANNER_CONFIG : null,
    getAllergenPlannerConfig,
  );

  // ─── Allergen toggle ────────────────────────────────────────────────────────

  const selectAllergen = (id: string) => {
    setSelectedAllergenId((prev) => (prev === id ? null : id));
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedAllergenId) {
      Toast.show({
        type: 'error',
        text1: 'Alerjen seçin',
        text2: 'Lütfen bir alerjen seçin.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await generateAllergenPlan({
        allergen_id: selectedAllergenId,
        child_id: activeChild?.id,
      });
      setPlan(result);
      setStage('result');
    } catch (error) {
      if (__DEV__) {
        console.error(
          '[AlerjenPlanlayici] generateAllergenPlan error:',
          error instanceof Error ? error.message : error,
        );
      }
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
    setPlan(null);
    setSelectedAllergenId(null);
    setStage('form');
  };

  // ─── Auth loading ────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Alerjen Deneme Planlayıcı" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // ─── Config loading ──────────────────────────────────────────────────────────

  if (configLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Alerjen Deneme Planlayıcı" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="mt-3 text-gray-500 text-sm">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (configError || !config) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Alerjen Deneme Planlayıcı" />
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="exclamation-circle" size={40} color="#DC2626" />
          <Text className="text-lg font-bold text-dark mt-4 mb-2 text-center">Yüklenemedi</Text>
          <Text className="text-sm text-gray-500 text-center">
            Alerjen planlayıcı yapılandırması yüklenemedi. Lütfen tekrar deneyin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Intro Stage ─────────────────────────────────────────────────────────────

  if (stage === 'intro') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Alerjen Deneme Planlayıcı" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <ToolGradientHero
            iconName="shield"
            iconColor="#ffffff"
            gradientColors={['#DC2626', '#EF4444']}
            title="Alerjen Deneme Planlayıcı"
            subtitle="Alerjen besinleri güvenli şekilde tanıtmak için kişiselleştirilmiş bir plan oluşturun."
          />

          <View className="px-4 pt-6 gap-4">
            {/* Feature list */}
            <View className="bg-white rounded-2xl p-4 border border-gray-100 gap-3">
              {(
                [
                  { icon: 'shield', text: 'Tek bir alerjen seçerek detaylı plan alın' },
                  { icon: 'list-ol', text: 'Gün gün doz ve talimat listesi' },
                  { icon: 'triangle-exclamation', text: 'Acil durum belirtileri ve öneriler' },
                ] as const
              ).map(({ icon, text }) => (
                <View key={text} className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center flex-shrink-0">
                    <Icon name={icon} size={15} color="#DC2626" />
                  </View>
                  <Text className="flex-1 text-sm text-gray-700">{text}</Text>
                </View>
              ))}
            </View>

            {/* No active child warning */}
            {!activeChild ? (
              <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-row items-start gap-3">
                <Icon name="circle-exclamation" size={18} color="#D97706" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-amber-800">
                    Aktif çocuk seçilmedi
                  </Text>
                  <Text className="text-xs text-amber-700 mt-0.5 leading-4">
                    Plan çocuk profiline bağlanmaz; çocuk bilgisi olmadan da plan oluşturabilirsiniz.
                  </Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => setStage('form')}
              activeOpacity={0.85}
              className="bg-red-600 rounded-2xl py-4 items-center"
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
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Alerjen Deneme Planlayıcı" />
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="px-4 pt-5 gap-5">
            {/* Allergen selection */}
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <Text className="text-sm font-semibold text-dark mb-1">Alerjenler</Text>
              <Text className="text-xs text-gray-500 mb-3">
                Plan oluşturmak istediğiniz bir alerjeni seçin.
              </Text>
              <View className="gap-2">
                {config.allergens.map((allergen) => {
                  const isSelected = selectedAllergenId === allergen.id;
                  return (
                    <TouchableOpacity
                      key={allergen.id}
                      onPress={() => selectAllergen(allergen.id)}
                      activeOpacity={0.8}
                      className={`flex-row items-center gap-3 p-3 rounded-xl border ${
                        isSelected
                          ? 'bg-red-50 border-red-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {allergen.icon ? (
                        <Text style={{ fontSize: 22 }}>{allergen.icon}</Text>
                      ) : (
                        <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center flex-shrink-0">
                          <Icon name="shield" size={16} color="#DC2626" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected ? 'text-red-700' : 'text-dark'
                          }`}
                        >
                          {allergen.name}
                        </Text>
                        {allergen.description ? (
                          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                            {allergen.description}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          isSelected ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'
                        }`}
                      >
                        {isSelected ? <Icon name="check" size={11} color="#ffffff" /> : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Active child info */}
            {activeChild ? (
              <View className="bg-red-50 rounded-2xl p-4 border border-red-100 flex-row items-center gap-3">
                <Icon name="info-circle" size={16} color="#DC2626" />
                <Text className="flex-1 text-xs text-red-700 leading-4">
                  Plan <Text className="font-semibold">{activeChild.name}</Text> için oluşturulacak.
                </Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={isSubmitting}
              className="bg-red-600 rounded-2xl py-4 items-center"
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
      </SafeAreaView>
    );
  }

  // ─── Result Stage ─────────────────────────────────────────────────────────────

  if (stage === 'result' && plan) {
    const relatedIngredients = (plan.related_ingredients ?? [])
      .map((item) => {
        if (typeof item === 'string') {
          const name = item.trim();
          return name ? { name } : null;
        }
        if (!item || typeof item !== 'object') return null;
        const name = typeof item.name === 'string' ? item.name.trim() : '';
        if (!name) return null;
        return {
          name,
          warning: typeof item.warning === 'string' ? item.warning.trim() : '',
        };
      })
      .filter((item): item is { name: string; warning?: string } => item !== null);

    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Alerjen Deneme Planlayıcı" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Result header */}
          <View className="bg-red-600 px-4 pt-6 pb-8 items-center">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
              <Icon name="check-circle" size={32} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-white">Planınız Hazır!</Text>
            <Text className="text-white/80 text-sm mt-1 text-center">
              {plan.allergen?.name ?? 'Alerjen'} için deneme planınız oluşturuldu.
            </Text>
          </View>

          <View className="px-4 pt-4 gap-4">
            {/* Schedule */}
            {plan.introduction_plan?.days && plan.introduction_plan.days.length > 0 ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
                    <Icon name="calendar-days" size={15} color="#DC2626" />
                  </View>
                  <Text className="text-sm font-bold text-dark">Günlük Plan</Text>
                </View>
                {plan.introduction_plan.days.map((day, index) => (
                  <View
                    key={index}
                    className={`flex-row items-start gap-3 py-3 ${
                      index < plan.introduction_plan.days.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <View className="w-8 h-8 rounded-full bg-red-600 items-center justify-center flex-shrink-0">
                      <Text className="text-white text-xs font-bold">{day.day}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-dark">{day.amount}</Text>
                      {day.form ? <Text className="text-xs text-red-600 mt-0.5">Form: {day.form}</Text> : null}
                      {day.time ? <Text className="text-xs text-gray-500 mt-0.5">Zaman: {day.time}</Text> : null}
                      {day.notes ? <Text className="text-xs text-gray-600 leading-4 mt-1">{day.notes}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Warning signs */}
            {plan.warning_signs && plan.warning_signs.length > 0 ? (
              <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <View className="flex-row items-center gap-2 mb-3">
                  <Icon name="exclamation-circle" size={18} color="#D97706" />
                  <Text className="text-sm font-bold text-amber-700">Uyarı Belirtileri</Text>
                </View>
                {plan.warning_signs.map((sign, index) => (
                  <View key={index} className="flex-row items-start gap-2 mb-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                    <Text className="flex-1 text-xs text-amber-700 leading-4">{sign}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Emergency signs */}
            {plan.emergency_signs && plan.emergency_signs.length > 0 ? (
              <View className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <View className="flex-row items-center gap-2 mb-3">
                  <Icon name="triangle-exclamation" size={18} color="#DC2626" />
                  <Text className="text-sm font-bold text-red-700">
                    Acil Durum Belirtileri
                  </Text>
                </View>
                <Text className="text-xs text-red-600 mb-3 leading-4">
                  Aşağıdaki belirtileri gözlemlerseniz hemen bir sağlık kuruluşuna başvurun:
                </Text>
                {plan.emergency_signs.map((sign, index) => (
                  <View key={index} className="flex-row items-start gap-2 mb-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    <Text className="flex-1 text-xs text-red-700 leading-4">{sign}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Stop conditions */}
            {plan.when_to_stop && plan.when_to_stop.length > 0 ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-sm font-bold text-dark mb-3">Planı Durdurma Durumları</Text>
                {plan.when_to_stop.map((item, index) => (
                  <View key={index} className="flex-row items-start gap-2 mb-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" />
                    <Text className="flex-1 text-xs text-gray-700 leading-4">{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {plan.success_criteria ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-sm font-bold text-dark mb-2">Başarı Kriteri</Text>
                <Text className="text-xs text-gray-700 leading-4">{plan.success_criteria}</Text>
              </View>
            ) : null}

            {relatedIngredients.length > 0 ? (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-sm font-bold text-dark mb-3">İlişkili Besinler</Text>
                <View className="gap-2">
                  {relatedIngredients.map((ingredient, index) => (
                    <View
                      key={`${ingredient.name}-${index}`}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                    >
                      <View
                        className="flex-row items-center gap-2"
                        accessible
                        accessibilityLabel="Uyarı"
                      >
                        <Icon
                          name="triangle-exclamation"
                          size={14}
                          color="#6B7280"
                        />
                        <Text className="text-sm font-semibold text-dark flex-1">
                          {ingredient.name}
                        </Text>
                      </View>
                      {ingredient.warning ? (
                        <Text className="text-xs text-gray-600 mt-1 leading-4">
                          {ingredient.warning}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Action buttons */}
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.85}
              className="bg-red-600 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-bold text-base">Farklı Alerjen Seç</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStage('intro')}
              activeOpacity={0.85}
              className="bg-white rounded-2xl py-4 items-center border border-gray-200"
            >
              <Text className="text-gray-700 font-bold text-base">Başa Dön</Text>
            </TouchableOpacity>

            <View className="h-6" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}
