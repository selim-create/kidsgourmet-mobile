import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ToolHeader } from '../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../src/components/tools/ToolGradientHero';
import { Icon } from '../../src/components/ui/Icon';
import { calculateDiapers, calculateRashRisk } from '../../src/services/tool-service';
import type { DiaperCalculatorResult, RashRiskResult } from '../../src/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'diaper' | 'rash';
type HumidityLevel = 'low' | 'medium' | 'high';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRiskLevelStyle(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'low':
      return { bg: '#DCFCE7', text: '#15803D', label: 'Düşük Risk' };
    case 'medium':
      return { bg: '#FEF3C7', text: '#D97706', label: 'Orta Risk' };
    case 'high':
      return { bg: '#FEE2E2', text: '#DC2626', label: 'Yüksek Risk' };
  }
}

// ─── FormField ────────────────────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'numeric',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: '500' }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? '0'}
        placeholderTextColor="#D1D5DB"
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: '#1F2937',
          backgroundColor: '#fff',
          minHeight: 48,
        }}
      />
    </View>
  );
}

// ─── OptionGroup ──────────────────────────────────────────────────────────────

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  activeColor,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  activeColor: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '500' }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: isActive ? activeColor : '#E5E7EB',
                backgroundColor: isActive ? activeColor + '18' : '#fff',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? activeColor : '#6B7280',
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── BooleanToggle ────────────────────────────────────────────────────────────

function BooleanToggle({
  label,
  value,
  onChange,
  activeColor,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  activeColor: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '500' }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          { value: true, label: 'Evet' },
          { value: false, label: 'Hayır' },
        ].map((opt) => {
          const isActive = opt.value === value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: isActive ? activeColor : '#E5E7EB',
                backgroundColor: isActive ? activeColor + '18' : '#fff',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? activeColor : '#6B7280',
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── DiaperResultCard ─────────────────────────────────────────────────────────

function DiaperResultCard({
  result,
  onReset,
}: {
  result: DiaperCalculatorResult;
  onReset: () => void;
}) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
      {/* Main size card */}
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 20,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#FCE7F3',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Icon name="calculator" size={28} color="#EC4899" />
        </View>
        <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Önerilen Beden</Text>
        <Text style={{ fontSize: 36, fontWeight: '800', color: '#EC4899', marginBottom: 4 }}>
          {result.recommended_size}
        </Text>
        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>{result.size_range}</Text>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1F2937' }}>
            {result.daily_count}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Günlük bez</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1F2937' }}>
            {result.monthly_count}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Aylık bez</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1F2937' }}>
            {result.monthly_packs}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            {result.pack_type ?? 'Paket'}
          </Text>
        </View>
      </View>

      {/* Size change alert */}
      {result.size_change_alert ? (
        <View
          style={{
            backgroundColor: '#FEF3C7',
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <Icon name="triangle-exclamation" size={16} color="#D97706" />
          <Text style={{ flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 }}>
            {result.size_change_alert}
          </Text>
        </View>
      ) : null}

      {/* Tips */}
      {result.tips && result.tips.length > 0 ? (
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="lightbulb" size={16} color="#EC4899" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>İpuçları</Text>
          </View>
          {result.tips.map((tip, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: idx < result.tips.length - 1 ? 8 : 0,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FCE7F3',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#EC4899' }}>
                  {idx + 1}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 }}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Reset button */}
      <TouchableOpacity
        onPress={onReset}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 12,
          paddingVertical: 14,
          borderWidth: 1.5,
          borderColor: '#EC4899',
          marginBottom: 20,
        }}
      >
        <Icon name="rotate-left" size={15} color="#EC4899" />
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#EC4899' }}>
          Yeniden Hesapla
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── RashRiskResultCard ───────────────────────────────────────────────────────

function RashRiskResultCard({
  result,
  onReset,
}: {
  result: RashRiskResult;
  onReset: () => void;
}) {
  const riskStyle = getRiskLevelStyle(result.risk_level);

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
      {/* Risk level card */}
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 20,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: riskStyle.bg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Icon name="shield" size={28} color={riskStyle.text} />
        </View>
        <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
          Pişik Risk Seviyesi
        </Text>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: riskStyle.bg,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: riskStyle.text }}>
            {riskStyle.label}
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
          Risk skoru: {result.risk_score} / 100
        </Text>
      </View>

      {/* Risk factors */}
      {result.risk_factors && result.risk_factors.length > 0 ? (
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="triangle-exclamation" size={16} color="#D97706" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
              Risk Faktörleri
            </Text>
          </View>
          {result.risk_factors.map((factor, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: idx < result.risk_factors.length - 1 ? 8 : 0,
              }}
            >
              <Icon name="exclamation-circle" size={14} color="#D97706" />
              <Text style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 }}>
                {factor}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Prevention tips */}
      {result.prevention_tips && result.prevention_tips.length > 0 ? (
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="lightbulb" size={16} color="#EC4899" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
              Önleyici İpuçları
            </Text>
          </View>
          {result.prevention_tips.map((tip, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: idx < result.prevention_tips.length - 1 ? 8 : 0,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FCE7F3',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#EC4899' }}>
                  {idx + 1}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 }}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Reset button */}
      <TouchableOpacity
        onPress={onReset}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 12,
          paddingVertical: 14,
          borderWidth: 1.5,
          borderColor: '#EC4899',
          marginBottom: 20,
        }}
      >
        <Icon name="rotate-left" size={15} color="#EC4899" />
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#EC4899' }}>
          Yeniden Değerlendir
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DiaperCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('diaper');

  // Diaper calculator form state
  const [babyAgeMonths, setBabyAgeMonths] = useState('');
  const [babyWeightKg, setBabyWeightKg] = useState('');
  const [dailyChanges, setDailyChanges] = useState('');
  const [diaperResult, setDiaperResult] = useState<DiaperCalculatorResult | null>(null);
  const [isDiaperLoading, setIsDiaperLoading] = useState(false);

  // Rash risk form state
  const [changeFrequency, setChangeFrequency] = useState('');
  const [nightDiaperHours, setNightDiaperHours] = useState('');
  const [humidityLevel, setHumidityLevel] = useState<HumidityLevel>('medium');
  const [hasDiarrhea, setHasDiarrhea] = useState(false);
  const [rashResult, setRashResult] = useState<RashRiskResult | null>(null);
  const [isRashLoading, setIsRashLoading] = useState(false);

  // ─── Diaper Calculator ───────────────────────────────────────────────────────

  const handleDiaperCalculate = async () => {
    const ageMonths = parseFloat(babyAgeMonths);
    const weightKg = parseFloat(babyWeightKg);
    const changes = parseFloat(dailyChanges);

    if (!babyAgeMonths.trim() || isNaN(ageMonths) || ageMonths <= 0) {
      Toast.show({ type: 'error', text1: 'Lütfen bebek yaşını girin' });
      return;
    }
    if (!babyWeightKg.trim() || isNaN(weightKg) || weightKg <= 0) {
      Toast.show({ type: 'error', text1: 'Lütfen bebek kilosunu girin' });
      return;
    }
    if (!dailyChanges.trim() || isNaN(changes) || changes <= 0) {
      Toast.show({ type: 'error', text1: 'Lütfen günlük bez değişim sayısını girin' });
      return;
    }

    setIsDiaperLoading(true);
    try {
      const result = await calculateDiapers({
        baby_age_months: ageMonths,
        baby_weight_kg: weightKg,
        daily_changes: changes,
      });
      setDiaperResult(result);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Hesaplama sırasında hata oluştu',
        text2: 'Lütfen tekrar deneyin.',
      });
    } finally {
      setIsDiaperLoading(false);
    }
  };

  const resetDiaper = () => {
    setDiaperResult(null);
    setBabyAgeMonths('');
    setBabyWeightKg('');
    setDailyChanges('');
  };

  // ─── Rash Risk ───────────────────────────────────────────────────────────────

  const handleRashCalculate = async () => {
    const freq = parseFloat(changeFrequency);
    const hours = parseFloat(nightDiaperHours);

    if (!changeFrequency.trim() || isNaN(freq) || freq <= 0) {
      Toast.show({ type: 'error', text1: 'Lütfen günlük değiştirme sıklığını girin' });
      return;
    }
    if (!nightDiaperHours.trim() || isNaN(hours) || hours < 0) {
      Toast.show({ type: 'error', text1: 'Lütfen gece bez süresini girin' });
      return;
    }

    setIsRashLoading(true);
    try {
      const result = await calculateRashRisk({
        change_frequency: freq,
        night_diaper_hours: hours,
        humidity_level: humidityLevel,
        has_diarrhea: hasDiarrhea,
      });
      setRashResult(result);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Değerlendirme sırasında hata oluştu',
        text2: 'Lütfen tekrar deneyin.',
      });
    } finally {
      setIsRashLoading(false);
    }
  };

  const resetRash = () => {
    setRashResult(null);
    setChangeFrequency('');
    setNightDiaperHours('');
    setHumidityLevel('medium');
    setHasDiarrhea(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['bottom']}>
      <ToolHeader title="Akıllı Bez Hesaplayıcı" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <ToolGradientHero
            iconName="calculator"
            iconColor="#ffffff"
            gradientColors={['#EC4899', '#BE185D']}
            title="Akıllı Bez Hesaplayıcı"
            subtitle="Bebeğinizin yaş ve kilosuna göre bez ihtiyacını hesaplayın ve pişik riskini değerlendirin."
          />

          {/* Tab Bar */}
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 16,
              marginTop: 16,
              marginBottom: 4,
              backgroundColor: '#F3F4F6',
              borderRadius: 12,
              padding: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('diaper')}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: activeTab === 'diaper' ? '#fff' : 'transparent',
                alignItems: 'center',
                shadowColor: activeTab === 'diaper' ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: activeTab === 'diaper' ? 0.06 : 0,
                shadowRadius: 2,
                elevation: activeTab === 'diaper' ? 1 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === 'diaper' ? '600' : '400',
                  color: activeTab === 'diaper' ? '#EC4899' : '#6B7280',
                }}
              >
                Bez Hesaplayıcı
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('rash')}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: activeTab === 'rash' ? '#fff' : 'transparent',
                alignItems: 'center',
                shadowColor: activeTab === 'rash' ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: activeTab === 'rash' ? 0.06 : 0,
                shadowRadius: 2,
                elevation: activeTab === 'rash' ? 1 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === 'rash' ? '600' : '400',
                  color: activeTab === 'rash' ? '#EC4899' : '#6B7280',
                }}
              >
                Pişik Risk
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Diaper Calculator Tab ── */}
          {activeTab === 'diaper' ? (
            diaperResult ? (
              <DiaperResultCard result={diaperResult} onReset={resetDiaper} />
            ) : (
              <View
                style={{
                  margin: 16,
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <FormField
                  label="Bebek Yaşı (ay)"
                  value={babyAgeMonths}
                  onChangeText={setBabyAgeMonths}
                  placeholder="Örn: 6"
                />
                <FormField
                  label="Bebek Kilosu (kg)"
                  value={babyWeightKg}
                  onChangeText={setBabyWeightKg}
                  placeholder="Örn: 7.5"
                  keyboardType="decimal-pad"
                />
                <FormField
                  label="Günlük Bez Değişim Sayısı"
                  value={dailyChanges}
                  onChangeText={setDailyChanges}
                  placeholder="Örn: 8"
                />

                <TouchableOpacity
                  onPress={handleDiaperCalculate}
                  activeOpacity={0.8}
                  disabled={isDiaperLoading}
                  style={{
                    backgroundColor: isDiaperLoading ? '#F9A8D4' : '#EC4899',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    marginTop: 4,
                    minHeight: 52,
                  }}
                >
                  {isDiaperLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                      Hesapla
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          ) : null}

          {/* ── Rash Risk Tab ── */}
          {activeTab === 'rash' ? (
            rashResult ? (
              <RashRiskResultCard result={rashResult} onReset={resetRash} />
            ) : (
              <View
                style={{
                  margin: 16,
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <FormField
                  label="Günlük Değiştirme Sıklığı (kez/gün)"
                  value={changeFrequency}
                  onChangeText={setChangeFrequency}
                  placeholder="Örn: 6"
                />
                <FormField
                  label="Gece Bez Süresi (saat)"
                  value={nightDiaperHours}
                  onChangeText={setNightDiaperHours}
                  placeholder="Örn: 8"
                />

                <OptionGroup
                  label="Ortam Nem Seviyesi"
                  value={humidityLevel}
                  onChange={setHumidityLevel}
                  activeColor="#EC4899"
                  options={[
                    { value: 'low', label: 'Düşük' },
                    { value: 'medium', label: 'Orta' },
                    { value: 'high', label: 'Yüksek' },
                  ]}
                />

                <BooleanToggle
                  label="İshal Var mı?"
                  value={hasDiarrhea}
                  onChange={setHasDiarrhea}
                  activeColor="#EC4899"
                />

                <TouchableOpacity
                  onPress={handleRashCalculate}
                  activeOpacity={0.8}
                  disabled={isRashLoading}
                  style={{
                    backgroundColor: isRashLoading ? '#F9A8D4' : '#EC4899',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    marginTop: 4,
                    minHeight: 52,
                  }}
                >
                  {isRashLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                      Değerlendir
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          ) : null}

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
