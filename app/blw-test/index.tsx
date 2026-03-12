import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBLWResults } from '../../src/hooks/useBLWResults';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { submitBLWTest } from '../../src/services/blw-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { COLORS } from '../../src/lib/constants';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';

const BLW_QUESTIONS = [
  { id: 'sits_unsupported', question: 'Desteksiz oturabilir mi?' },
  { id: 'head_control', question: 'Baş kontrolü tam mı?' },
  { id: 'shows_interest', question: 'Yetişkinlerin yemesini izliyor mu?' },
  { id: 'tongue_thrust_gone', question: 'Dil itme refleksi geçti mi?' },
  { id: 'reaches_for_food', question: 'Yiyeceğe uzanıp tutabiliyor mu?' },
  { id: 'brings_to_mouth', question: 'Elindeki şeyi ağzına götürebiliyor mu?' },
] as const;

const READINESS_COLORS = {
  ready: { bg: '#ECFDF5', text: '#065F46', border: '#059669', emoji: '✅' },
  almost_ready: { bg: '#FFFBEB', text: '#92400E', border: '#D97706', emoji: '🔶' },
  not_ready: { bg: '#FEF2F2', text: '#991B1B', border: '#DC2626', emoji: '⏳' },
};

export default function BLWTestScreen() {
  const { activeChild } = useActiveChild();
  const { blwResult, isLoading, error } = useBLWResults();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localResult, setLocalResult] = useState<{
    readiness_level: keyof typeof READINESS_COLORS;
    score: number;
    recommendations?: string[];
  } | null>(null);

  const ageMonths = activeChild ? getAgeInMonths(activeChild.birth_date) : 0;
  const isEligible = ageMonths >= 4 && ageMonths <= 12;

  const toggleAnswer = (id: string) => {
    setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === BLW_QUESTIONS.length;
  const score = Object.values(answers).filter(Boolean).length;

  const handleSubmit = async () => {
    if (!activeChild) return;
    if (!allAnswered) {
      Alert.alert('Eksik', 'Lütfen tüm soruları cevaplayın.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitBLWTest({ child_id: activeChild.id, answers });
      setLocalResult({
        readiness_level: (res.readiness_level as keyof typeof READINESS_COLORS) ?? (score >= 5 ? 'ready' : score >= 3 ? 'almost_ready' : 'not_ready'),
        score: res.score ?? score,
        recommendations: res.recommendations,
      });
    } catch {
      // Use local calculation if API fails
      const level: keyof typeof READINESS_COLORS = score >= 5 ? 'ready' : score >= 3 ? 'almost_ready' : 'not_ready';
      setLocalResult({ readiness_level: level, score });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayResult = localResult ?? (blwResult
    ? {
        readiness_level: (blwResult.readiness_level as keyof typeof READINESS_COLORS) ?? 'not_ready',
        score: blwResult.score ?? 0,
        recommendations: blwResult.recommendations,
      }
    : null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7ED' }}>
      <View
        style={{
          backgroundColor: '#EA580C',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            BLW Hazırlık Testi 🥣
          </Text>
        </View>
        {activeChild && (
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
            {activeChild.name} · {ageMonths} aylık
          </Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {!activeChild ? (
          <View
            style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="information-circle-outline" size={20} color="#D97706" />
            <Text style={{ fontSize: 13, color: '#92400E', marginLeft: 10, flex: 1 }}>
              Test için profil sekmesinden çocuk ekleyin.
            </Text>
          </View>
        ) : !isEligible ? (
          <View
            style={{
              backgroundColor: '#F3F4F6',
              borderRadius: 14,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32, marginBottom: 10 }}>⏰</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151', textAlign: 'center' }}>
              BLW testi 4-12 aylık bebekler içindir
            </Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
              {ageMonths < 4 ? `${activeChild.name} henüz ${ageMonths} aylık.` : `${activeChild.name} ${ageMonths} aylık — katı gıdaya geçiş dönemini tamamladı.`}
            </Text>
          </View>
        ) : isLoading ? (
          <LoadingSpinner label="Yükleniyor..." />
        ) : (
          <View>
            {/* Previous result banner */}
            {displayResult && !localResult && (
              <View
                style={{
                  backgroundColor: READINESS_COLORS[displayResult.readiness_level]?.bg ?? '#F9FAFB',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: READINESS_COLORS[displayResult.readiness_level]?.border ?? '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>
                  {READINESS_COLORS[displayResult.readiness_level]?.emoji}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: READINESS_COLORS[displayResult.readiness_level]?.text }}>
                    Son test sonucu
                  </Text>
                  <Text style={{ fontSize: 12, color: READINESS_COLORS[displayResult.readiness_level]?.text }}>
                    Skor: {displayResult.score} / {BLW_QUESTIONS.length}
                  </Text>
                </View>
              </View>
            )}

            {/* Result after answering */}
            {localResult && (
              <View
                style={{
                  backgroundColor: READINESS_COLORS[localResult.readiness_level].bg,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: READINESS_COLORS[localResult.readiness_level].border,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: READINESS_COLORS[localResult.readiness_level].text, marginBottom: 4 }}>
                  {READINESS_COLORS[localResult.readiness_level].emoji}{' '}
                  {localResult.readiness_level === 'ready' ? 'Hazır!' : localResult.readiness_level === 'almost_ready' ? 'Neredeyse Hazır' : 'Henüz Değil'}
                </Text>
                <Text style={{ fontSize: 13, color: READINESS_COLORS[localResult.readiness_level].text }}>
                  Skor: {localResult.score} / {BLW_QUESTIONS.length}
                </Text>
                {localResult.recommendations?.map((rec, i) => (
                  <Text key={i} style={{ fontSize: 12, color: READINESS_COLORS[localResult.readiness_level].text, marginTop: 6 }}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}

            {/* Questions */}
            {!localResult && (
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 14 }}>
                  Aşağıdaki soruları yanıtlayın
                </Text>
                <View style={{ gap: 10, marginBottom: 20 }}>
                  {BLW_QUESTIONS.map((q) => {
                    const val = answers[q.id];
                    return (
                      <View
                        key={q.id}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 12,
                          padding: 14,
                          elevation: 1,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 3,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: '#374151', marginBottom: 10 }}>
                          {q.question}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: true }))}
                            style={{
                              flex: 1,
                              paddingVertical: 8,
                              borderRadius: 8,
                              alignItems: 'center',
                              backgroundColor: val === true ? '#DCFCE7' : '#F3F4F6',
                              borderWidth: 1,
                              borderColor: val === true ? '#22C55E' : '#E5E7EB',
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: val === true ? '#16A34A' : '#9CA3AF' }}>
                              ✅ Evet
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: false }))}
                            style={{
                              flex: 1,
                              paddingVertical: 8,
                              borderRadius: 8,
                              alignItems: 'center',
                              backgroundColor: val === false ? '#FEE2E2' : '#F3F4F6',
                              borderWidth: 1,
                              borderColor: val === false ? '#EF4444' : '#E5E7EB',
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: val === false ? '#DC2626' : '#9CA3AF' }}>
                              ❌ Hayır
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  style={{
                    backgroundColor: allAnswered ? '#EA580C' : '#E5E7EB',
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  {isSubmitting ? (
                    <Ionicons name="hourglass-outline" size={18} color="#fff" />
                  ) : (
                    <Text style={{ color: allAnswered ? '#fff' : '#9CA3AF', fontSize: 15, fontWeight: '700' }}>
                      Sonucu Gör ({answeredCount}/{BLW_QUESTIONS.length})
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {localResult && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { setLocalResult(null); setAnswers({}); }}
                style={{
                  backgroundColor: '#FFF7ED',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#FED7AA',
                  marginTop: 12,
                }}
              >
                <Text style={{ color: '#EA580C', fontSize: 14, fontWeight: '600' }}>
                  Testi Tekrarla
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View
          style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 14,
            padding: 14,
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
            💡 BLW Hakkında
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 18 }}>
            Baby-Led Weaning (BLW), bebeğin kendi hızında katı gıdalara geçişini destekleyen bir yöntemdir. Bu test genel bir rehber sunmaktadır; pediatristinize danışmayı unutmayın.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
