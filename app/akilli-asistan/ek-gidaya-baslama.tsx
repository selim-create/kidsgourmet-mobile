import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ToolHeader } from '../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../src/components/tools/ToolGradientHero';
import { Icon } from '../../src/components/ui/Icon';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import {
  getSolidFoodReadinessConfig,
  submitSolidFoodReadiness,
  getSolidFoodReadiness,
} from '../../src/services/tool-service';
import type {
  SolidFoodReadinessConfig,
  SolidFoodReadinessResult,
} from '../../src/lib/types';

type Stage = 'intro' | 'test' | 'result';

const READINESS_CONFIG = {
  ready: {
    emoji: '✅',
    label: 'Hazır!',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-800',
    badgeBg: '#DCFCE7',
    badgeBorder: '#86EFAC',
    badgeText: '#166534',
  },
  almost_ready: {
    emoji: '⌛',
    label: 'Neredeyse Hazır',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
    badgeBg: '#FEF3C7',
    badgeBorder: '#FCD34D',
    badgeText: '#92400E',
  },
  not_yet: {
    emoji: '⏸',
    label: 'Biraz Daha Zaman',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-800',
    badgeBg: '#FFEDD5',
    badgeBorder: '#FDBA74',
    badgeText: '#9A3412',
  },
} as const;

const FALLBACK_DISCLAIMER =
  'Bu test genel bir rehber sunmaktadır. Kesin karar için çocuk doktorunuza danışın.';

const styles = StyleSheet.create({
  questionCard: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
});

export default function SolidFoodReadinessScreen() {
  const { activeChild } = useActiveChild();
  const [stage, setStage] = useState<Stage>('intro');
  const [config, setConfig] = useState<SolidFoodReadinessConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [previousResult, setPreviousResult] = useState<SolidFoodReadinessResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SolidFoodReadinessResult | null>(null);

  // Fetch previous result when child is available
  useEffect(() => {
    if (!activeChild) return;
    getSolidFoodReadiness(activeChild.id)
      .then((res) => {
        if (res) setPreviousResult(res);
      })
      .catch(() => {
        // silently ignore – no previous result
      });
  }, [activeChild]);

  const handleStart = async () => {
    setConfigLoading(true);
    try {
      const cfg = await getSolidFoodReadinessConfig();
      setConfig(cfg);
      setStage('test');
    } catch (err) {
      console.error('[SolidFoodReadiness] config fetch error:', err);
      Toast.show({
        type: 'error',
        text1: 'Yüklenemedi',
        text2: 'Sorular yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setConfigLoading(false);
    }
  };

  const setAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const totalQuestions = config?.questions?.length ?? 0;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const progress = totalQuestions > 0 ? answeredCount / totalQuestions : 0;

  const handleSubmit = async () => {
    if (!allAnswered) {
      Toast.show({
        type: 'error',
        text1: 'Eksik cevap',
        text2: 'Lütfen tüm soruları yanıtlayın.',
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitSolidFoodReadiness(answers, activeChild?.id);
      setResult(res);
      setStage('result');
    } catch (err) {
      console.error('[SolidFoodReadiness] submit error:', err);
      Toast.show({
        type: 'error',
        text1: 'Gönderilemedi',
        text2: 'Sonuç hesaplanırken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStage('intro');
    setAnswers({});
    setResult(null);
    setConfig(null);
  };

  const bucketId =
    result?.result?.id ??
    (result?.is_ready === true ? 'ready' : result?.is_ready === false ? 'not_yet' : undefined);
  const readinessCfg =
    bucketId && READINESS_CONFIG[bucketId as keyof typeof READINESS_CONFIG]
      ? READINESS_CONFIG[bucketId as keyof typeof READINESS_CONFIG]
      : null;
  const resultScore = result?.score ?? result?.readiness_score;
  const resultNotes = result?.result?.description ?? result?.notes;
  const resultRecommendations = result?.result?.recommendations ?? result?.recommendations;
  const resultDisclaimer = result?.disclaimer ?? config?.disclaimer ?? FALLBACK_DISCLAIMER;
  const previousScore = previousResult?.score ?? previousResult?.readiness_score;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ToolHeader title="Ek Gıdaya Başlama Kontrolü" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ToolGradientHero
          iconName="utensils"
          iconColor="#ffffff"
          gradientColors={['#F97316', '#EA580C']}
          title="Ek Gıdaya Başlama Kontrolü"
          subtitle="Bebeğinizin ek gıdaya başlamaya hazır olup olmadığını birkaç soruyla öğrenin."
        />

        {/* ── INTRO ──────────────────────────────────────────────────── */}
        {stage === 'intro' && (
          <View className="px-4 pt-6 pb-8">
            {/* Previous result banner */}
            {previousResult && (
              <View
                className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 flex-row items-start gap-3"
              >
                <Icon name="clock" size={18} color="#C2410C" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-orange-800 mb-1">
                    Önceki sonucunuz
                  </Text>
                  <Text className="text-sm text-orange-700">
                    {previousResult.result?.title ??
                      (previousResult.is_ready ? 'Hazır' : 'Değerlendirildi')}
                  </Text>
                  {previousScore !== undefined && (
                    <Text className="text-xs text-orange-600 mt-1">
                      Skor: {previousScore}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Info cards */}
            <View className="gap-3 mb-6">
              <View className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-start gap-3">
                <Icon name="circle-check" size={20} color="#F97316" />
                <Text className="flex-1 text-sm text-dark leading-5">
                  Bebeğinizin fiziksel ve davranışsal hazırlık işaretlerini değerlendirin.
                </Text>
              </View>
              <View className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-start gap-3">
                <Icon name="clock" size={20} color="#F97316" />
                <Text className="flex-1 text-sm text-dark leading-5">
                  Test yaklaşık 2 dakika sürer. Sorular bilimsel kriterlere dayanmaktadır.
                </Text>
              </View>
              <View className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-start gap-3">
                <Icon name="info-circle" size={20} color="#F97316" />
                <Text className="flex-1 text-sm text-dark leading-5">
                  Sonuç rehber niteliğindedir. Kesin karar için pediatristinize danışın.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleStart}
              disabled={configLoading}
              activeOpacity={0.85}
              className="bg-orange-500 rounded-2xl py-4 items-center justify-center"
            >
              {configLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Teste Başla</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── TEST ───────────────────────────────────────────────────── */}
        {stage === 'test' && config && (
          <View className="px-4 pt-6 pb-8">
            {/* Progress bar */}
            <View className="mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs font-medium text-gray-500">
                  {answeredCount} / {totalQuestions} soru yanıtlandı
                </Text>
                <Text className="text-xs font-medium text-orange-600">
                  %{Math.round(progress * 100)}
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-2 bg-orange-500 rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
            </View>

            {/* Questions */}
            <View className="gap-3 mb-6">
              {config.questions.map((question, index) => {
                const selectedOptionId = answers[question.id];
                const promptText = question.question ?? question.text ?? '';
                return (
                  <View
                    key={question.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4"
                    style={styles.questionCard}
                  >
                    <Text className="text-xs font-medium text-orange-500 mb-1">
                      Soru {index + 1}
                    </Text>
                    <Text className="text-sm font-medium text-dark mb-3 leading-5">
                      {promptText}
                    </Text>
                    {question.description ? (
                      <Text className="text-xs text-gray-500 mb-3 leading-4">
                        {question.description}
                      </Text>
                    ) : null}
                    <View className="gap-2">
                      {(question.options ?? []).map((option) => {
                        const isSelected = selectedOptionId === option.id;
                        return (
                          <TouchableOpacity
                            key={option.id}
                            onPress={() => setAnswer(question.id, option.id)}
                            activeOpacity={0.8}
                            className={`w-full px-4 py-3 rounded-xl border ${
                              isSelected
                                ? 'bg-orange-50 border-orange-400'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <Text
                              className={`text-sm font-medium ${
                                isSelected ? 'text-orange-700' : 'text-gray-600'
                              }`}
                            >
                              {option.text}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!allAnswered || submitting}
              activeOpacity={0.85}
              className={`rounded-2xl py-4 items-center justify-center ${
                allAnswered ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className={`text-base font-bold ${
                    allAnswered ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  Sonucu Gör ({answeredCount}/{totalQuestions})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── RESULT ─────────────────────────────────────────────────── */}
        {stage === 'result' && result && readinessCfg && (
          <View className="px-4 pt-6 pb-8">
            {/* Readiness badge */}
            <View
              className="rounded-2xl p-5 mb-4 items-center"
              style={{
                backgroundColor: readinessCfg.badgeBg,
                borderWidth: 1,
                borderColor: readinessCfg.badgeBorder,
              }}
            >
              <Text className="text-5xl mb-3">{readinessCfg.emoji}</Text>
              <Text
                className="text-2xl font-bold mb-2 text-center"
                style={{ color: readinessCfg.badgeText }}
              >
                {result.result?.title ?? readinessCfg.label}
              </Text>
              {resultScore !== undefined && (
                <View className="bg-white/60 rounded-xl px-4 py-2 mt-1">
                  <Text
                    className="text-sm font-medium text-center"
                    style={{ color: readinessCfg.badgeText }}
                  >
                    Hazırlık Skoru: {resultScore}
                  </Text>
                </View>
              )}
            </View>

            {/* Notes */}
            {resultNotes ? (
              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex-row gap-3">
                <Icon name="info-circle" size={18} color="#F97316" />
                <Text className="flex-1 text-sm text-dark leading-5">{resultNotes}</Text>
              </View>
            ) : null}

            {/* Recommendations */}
            {resultRecommendations && resultRecommendations.length > 0 ? (
              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
                <Text className="text-sm font-semibold text-dark mb-3">Öneriler</Text>
                {resultRecommendations.map((rec, i) => (
                  <View key={rec || String(i)} className="flex-row gap-2 mb-2">
                    <Icon name="circle-check" size={14} color="#F97316" />
                    <Text className="flex-1 text-sm text-gray-700 leading-5">{rec}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Disclaimer */}
            <View className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4 flex-row gap-3">
              <Icon name="triangle-exclamation" size={16} color="#D97706" />
              <Text className="flex-1 text-xs text-amber-800 leading-5">
                {resultDisclaimer}
              </Text>
            </View>

            {/* Sponsor */}
            {result.sponsor ? (
              <View className="bg-gray-50 border border-gray-100 rounded-2xl p-3 mb-4">
                <Text className="text-xs text-gray-400 text-center">{result.sponsor}</Text>
              </View>
            ) : null}

            {/* Reset button */}
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.85}
              className="bg-gray-100 rounded-2xl py-4 items-center justify-center flex-row gap-2"
            >
              <Icon name="rotate-left" size={16} color="#475569" />
              <Text className="text-dark text-base font-semibold">Testi Tekrarla</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
