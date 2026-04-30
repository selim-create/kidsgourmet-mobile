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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ToolHeader } from '../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../src/components/tools/ToolGradientHero';
import { Icon } from '../../src/components/ui/Icon';
import { analyzeAirQuality } from '../../src/services/tool-service';
import type { AirQualityResult, AirQualityInput } from '../../src/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

type Season = 'winter' | 'spring' | 'summer' | 'autumn';
type VentilationFrequency = 'multiple_daily' | 'daily' | 'rarely';
type CookingFrequency = 'high' | 'medium' | 'low';
type Stage = 'intro' | 'form' | 'result';

const HOME_TYPES = [
  { value: 'apartment', label: 'Apartman' },
  { value: 'detached', label: 'Müstakil' },
  { value: 'duplex', label: 'Dubleks' },
  { value: 'studio', label: 'Stüdyo' },
];

const HEATING_TYPES = [
  { value: 'kombi', label: 'Kombi' },
  { value: 'soba', label: 'Soba' },
  { value: 'electric', label: 'Elektrikli' },
  { value: 'central', label: 'Merkezi' },
  { value: 'floor', label: 'Yerden Isıtma' },
];

const SEASONS: { value: Season; label: string }[] = [
  { value: 'winter', label: 'Kış' },
  { value: 'spring', label: 'İlkbahar' },
  { value: 'summer', label: 'Yaz' },
  { value: 'autumn', label: 'Sonbahar' },
];

const VENTILATION_OPTIONS: { value: VentilationFrequency; label: string }[] = [
  { value: 'multiple_daily', label: 'Günde Birkaç Kez' },
  { value: 'daily', label: 'Günde Bir Kez' },
  { value: 'rarely', label: 'Nadiren' },
];

const COOKING_OPTIONS: { value: CookingFrequency; label: string }[] = [
  { value: 'high', label: 'Yüksek' },
  { value: 'medium', label: 'Orta' },
  { value: 'low', label: 'Düşük' },
];

interface FormState {
  home_type: string;
  has_pets: boolean;
  has_smoker: boolean;
  heating_type: string;
  season: Season;
  child_age_months: string;
  respiratory_issues: boolean;
  ventilation_frequency: VentilationFrequency;
  cooking_frequency: CookingFrequency;
}

const DEFAULT_FORM: FormState = {
  home_type: 'apartment',
  has_pets: false,
  has_smoker: false,
  heating_type: 'kombi',
  season: 'winter',
  child_age_months: '',
  respiratory_issues: false,
  ventilation_frequency: 'daily',
  cooking_frequency: 'medium',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '500' }}>
      {children}
    </Text>
  );
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  wrap = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  wrap?: boolean;
}) {
  const ACTIVE = '#0284C7';
  return (
    <View style={{ marginBottom: 16 }}>
      <SectionTitle>{label}</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: wrap ? 'wrap' : 'nowrap', gap: 8 }}>
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
              style={{
                flex: wrap ? undefined : 1,
                paddingVertical: 10,
                paddingHorizontal: wrap ? 14 : 8,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: isActive ? ACTIVE : '#E5E7EB',
                backgroundColor: isActive ? '#E0F2FE' : '#fff',
                alignItems: 'center',
                marginBottom: wrap ? 4 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? ACTIVE : '#6B7280',
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

function BooleanToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const ACTIVE = '#0284C7';
  return (
    <View style={{ marginBottom: 16 }}>
      {description ? (
        <View style={{ marginBottom: 8 }}>
          <SectionTitle>{label}</SectionTitle>
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: -4 }}>{description}</Text>
        </View>
      ) : (
        <SectionTitle>{label}</SectionTitle>
      )}
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
                borderColor: isActive ? ACTIVE : '#E5E7EB',
                backgroundColor: isActive ? '#E0F2FE' : '#fff',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? ACTIVE : '#6B7280',
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

function getRiskStyle(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'low':
      return { bg: '#DCFCE7', text: '#15803D', label: 'Düşük Risk' };
    case 'medium':
      return { bg: '#FEF3C7', text: '#D97706', label: 'Orta Risk' };
    case 'high':
      return { bg: '#FEE2E2', text: '#DC2626', label: 'Yüksek Risk' };
  }
}

function getSeverityStyle(severity?: string) {
  switch (severity) {
    case 'high':
      return { bg: '#FEE2E2', text: '#DC2626' };
    case 'medium':
      return { bg: '#FEF3C7', text: '#D97706' };
    default:
      return { bg: '#DCFCE7', text: '#15803D' };
  }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HavaKalitesiScreen() {
  const [stage, setStage] = useState<Stage>('intro');
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AirQualityResult | null>(null);

  const setField =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const input: AirQualityInput = {
        home_type: form.home_type,
        has_pets: form.has_pets,
        has_smoker: form.has_smoker,
        heating_type: form.heating_type,
        season: form.season,
        respiratory_issues: form.respiratory_issues,
        ventilation_frequency: form.ventilation_frequency,
        cooking_frequency: form.cooking_frequency,
      };

      if (form.child_age_months.trim() !== '') {
        const parsed = parseInt(form.child_age_months, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          input.child_age_months = parsed;
        }
      }

      const res = await analyzeAirQuality(input);
      setResult(res);
      setStage('result');
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Analiz başarısız',
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['bottom']}>
      <ToolHeader title="Hava Kalitesi Rehberi" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <ToolGradientHero
            iconName="wind"
            iconColor="#ffffff"
            gradientColors={['#0284C7', '#38BDF8']}
            title="Hava Kalitesi Rehberi"
            subtitle="Evinizin iç hava kalitesini analiz edin, riskleri öğrenin ve çocuğunuz için sağlıklı bir ortam oluşturun."
          />

          {/* ─── INTRO STAGE ─── */}
          {stage === 'intro' ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 }}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>
                  Bu araç ne yapar?
                </Text>
                {(
                  [
                    { icon: 'house', text: 'Ev tipi ve ısıtma sistemine göre risk analizi' },
                    { icon: 'wind', text: 'Mevsimsel hava kalitesi uyarıları' },
                    { icon: 'lightbulb', text: 'Kişiselleştirilmiş iç mekan önerileri' },
                    { icon: 'shield', text: 'Solunum sağlığını etkileyen risk faktörleri' },
                  ] as const
                ).map(({ icon, text }) => (
                  <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#E0F2FE',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={icon} size={15} color="#0284C7" />
                    </View>
                    <Text style={{ flex: 1, fontSize: 13, color: '#4B5563' }}>{text}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setStage('form')}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#0284C7',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  Analize Başla
                </Text>
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </View>
          ) : null}

          {/* ─── FORM STAGE ─── */}
          {stage === 'form' ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 16 }}>
                  Ev Bilgileri
                </Text>

                <OptionGroup
                  label="Ev Tipi"
                  value={form.home_type}
                  options={HOME_TYPES}
                  onChange={setField('home_type')}
                  wrap
                />

                <OptionGroup
                  label="Isıtma Sistemi"
                  value={form.heating_type}
                  options={HEATING_TYPES}
                  onChange={setField('heating_type')}
                  wrap
                />

                <BooleanToggle
                  label="Evcil hayvan var mı?"
                  value={form.has_pets}
                  onChange={setField('has_pets')}
                />

                <BooleanToggle
                  label="Evde sigara içiliyor mu?"
                  value={form.has_smoker}
                  onChange={setField('has_smoker')}
                />
              </View>

              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 16 }}>
                  Mevsim & Havalandırma
                </Text>

                <OptionGroup
                  label="Mevsim"
                  value={form.season}
                  options={SEASONS}
                  onChange={setField('season')}
                />

                <OptionGroup
                  label="Havalandırma Sıklığı"
                  value={form.ventilation_frequency}
                  options={VENTILATION_OPTIONS}
                  onChange={setField('ventilation_frequency')}
                  wrap
                />

                <OptionGroup
                  label="Pişirme Yoğunluğu"
                  value={form.cooking_frequency}
                  options={COOKING_OPTIONS}
                  onChange={setField('cooking_frequency')}
                />
              </View>

              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 16 }}>
                  Çocuk Bilgileri (Opsiyonel)
                </Text>

                <View style={{ marginBottom: 16 }}>
                  <SectionTitle>Çocuğun Yaşı (ay)</SectionTitle>
                  <TextInput
                    value={form.child_age_months}
                    onChangeText={setField('child_age_months')}
                    placeholder="Örn: 12"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="number-pad"
                    maxLength={3}
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

                <BooleanToggle
                  label="Solunum problemi var mı?"
                  description="Astım, alerji vb."
                  value={form.respiratory_issues}
                  onChange={setField('respiratory_issues')}
                />
              </View>

              <TouchableOpacity
                onPress={handleAnalyze}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#0284C7',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Analiz Et</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStage('intro')}
                activeOpacity={0.7}
                style={{ paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Geri</Text>
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </View>
          ) : null}

          {/* ─── RESULT STAGE ─── */}
          {stage === 'result' && result ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
              {/* Risk Level Card */}
              {(() => {
                const riskStyle = getRiskStyle(result.risk_level);
                return (
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#F3F4F6',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: riskStyle.bg,
                        marginBottom: 12,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: riskStyle.text }}>
                        {riskStyle.label}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>
                      Risk Skoru
                    </Text>
                    <Text style={{ fontSize: 48, fontWeight: '800', color: riskStyle.text }}>
                      {result.risk_score}
                    </Text>
                    {/* Progress bar */}
                    <View
                      style={{
                        width: '100%',
                        height: 8,
                        backgroundColor: '#F3F4F6',
                        borderRadius: 4,
                        marginTop: 12,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.min(result.risk_score, 100)}%`,
                          height: '100%',
                          backgroundColor: riskStyle.text,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </View>
                );
              })()}

              {/* Risk Factors */}
              {result.risk_factors && result.risk_factors.length > 0 ? (
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon name="exclamation-triangle" size={17} color="#0284C7" />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                      Risk Faktörleri
                    </Text>
                  </View>
                  {result.risk_factors.map((rf, idx) => {
                    const sevStyle = getSeverityStyle(rf.severity);
                    return (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: '#F9FAFB',
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: '#F3F4F6',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', flex: 1 }}>
                            {rf.factor}
                          </Text>
                          {rf.severity ? (
                            <View
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 8,
                                backgroundColor: sevStyle.bg,
                                marginLeft: 8,
                              }}
                            >
                              <Text style={{ fontSize: 11, fontWeight: '600', color: sevStyle.text }}>
                                {rf.severity === 'high' ? 'Yüksek' : rf.severity === 'medium' ? 'Orta' : 'Düşük'}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: rf.category ? 4 : 0 }}>
                          {rf.impact}
                        </Text>
                        {rf.category ? (
                          <View
                            style={{
                              alignSelf: 'flex-start',
                              backgroundColor: '#E0F2FE',
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: '#0284C7', fontWeight: '500' }}>
                              {rf.category}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 ? (
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon name="lightbulb" size={17} color="#0284C7" />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>Öneriler</Text>
                  </View>
                  {result.recommendations.map((rec, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: '#E0F2FE',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                          flexShrink: 0,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7' }}>{idx + 1}</Text>
                      </View>
                      <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20, flex: 1 }}>{rec}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Seasonal Alerts */}
              {result.seasonal_alerts && result.seasonal_alerts.length > 0 ? (
                <View
                  style={{
                    backgroundColor: '#FFF7ED',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#FED7AA',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon name="bell" size={17} color="#EA580C" />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#9A3412' }}>
                      Mevsimsel Uyarılar
                    </Text>
                  </View>
                  {result.seasonal_alerts.map((alert, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <Icon name="exclamation-circle" size={14} color="#EA580C" />
                      <Text style={{ fontSize: 13, color: '#9A3412', lineHeight: 19, flex: 1 }}>{alert}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Indoor Tips */}
              {result.indoor_tips && result.indoor_tips.length > 0 ? (
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon name="house" size={17} color="#0284C7" />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                      İç Mekan İpuçları
                    </Text>
                  </View>
                  {result.indoor_tips.map((tip, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <Icon name="check-circle" size={14} color="#0284C7" />
                      <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 19, flex: 1 }}>{tip}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* External AQI */}
              {result.external_aqi ? (
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon name="cloud" size={17} color="#0284C7" />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                      Dış Hava Kalitesi (AQI)
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <Text
                      style={{
                        fontSize: 40,
                        fontWeight: '800',
                        color: result.external_aqi.quality_level.color || '#0284C7',
                      }}
                    >
                      {result.external_aqi.aqi}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: result.external_aqi.quality_level.color || '#0284C7',
                          marginBottom: 2,
                        }}
                      >
                        {result.external_aqi.quality_level.level}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {result.external_aqi.quality_level.description}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: result.external_aqi.is_safe_for_outdoor ? '#DCFCE7' : '#FEE2E2',
                    }}
                  >
                    <Icon
                      name={result.external_aqi.is_safe_for_outdoor ? 'check-circle' : 'times-circle'}
                      size={16}
                      color={result.external_aqi.is_safe_for_outdoor ? '#15803D' : '#DC2626'}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: result.external_aqi.is_safe_for_outdoor ? '#15803D' : '#DC2626',
                      }}
                    >
                      {result.external_aqi.is_safe_for_outdoor
                        ? 'Dışarı çıkmak güvenli'
                        : 'Dışarı çıkmak önerilmez'}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Sponsor */}
              {result.sponsor ? (
                <View
                  style={{
                    backgroundColor: '#EFF6FF',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#BFDBFE',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#3B82F6', fontWeight: '600', marginBottom: 2 }}>
                    Sponsorlu İçerik
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E3A8A' }}>
                    {result.sponsor.name}
                  </Text>
                  {result.sponsor.cta ? (
                    <Text style={{ fontSize: 12, color: '#3B82F6', marginTop: 2 }}>
                      {result.sponsor.cta}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {/* Reset Button */}
              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#0284C7',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  Yeniden Analiz Et
                </Text>
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
