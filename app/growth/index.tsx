import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import {
  calculatePercentile,
  savePercentileResult,
} from '../../src/services/tool-service';
import { setToken } from '../../src/lib/api';
import type { PercentileResult } from '../../src/lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function displayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}

function getAgeYears(birthDate: string, measurementDate: string): number {
  const birth = new Date(birthDate);
  const meas = new Date(measurementDate);
  const diffMs = meas.getTime() - birth.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

// ─── Percentile Color Coding ──────────────────────────────────────────────────

function getPercentileColor(p: number): { bg: string; text: string; label: string } {
  if (p < 3) return { bg: '#FEE2E2', text: '#DC2626', label: 'Çok Düşük' };
  if (p < 15) return { bg: '#FEF3C7', text: '#D97706', label: 'Düşük' };
  if (p <= 85) return { bg: '#DCFCE7', text: '#15803D', label: 'Normal' };
  if (p <= 97) return { bg: '#FEF3C7', text: '#D97706', label: 'Yüksek' };
  return { bg: '#FEE2E2', text: '#DC2626', label: 'Çok Yüksek' };
}

// ─── DateField Component ──────────────────────────────────────────────────────

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: '500' }}>
        {label}
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShow(true)}
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          minHeight: 44,
        }}
      >
        <Ionicons name="calendar-outline" size={16} color="#6B7280" style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 14, color: '#1F2937', flex: 1 }}>
          {displayDate(formatDate(value))}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_event, selected) => {
            setShow(false);
            if (selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
}

// ─── PercentileBar Component ──────────────────────────────────────────────────

function PercentileBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = getPercentileColor(pct);
  return (
    <View>
      <View
        style={{
          height: 8,
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
          overflow: 'hidden',
          marginTop: 6,
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color.text,
            borderRadius: 4,
          }}
        />
      </View>
      {/* Reference marks */}
      <View style={{ flexDirection: 'row', position: 'absolute', top: 6, left: 0, right: 0, height: 8 }}>
        {[3, 15, 50, 85, 97].map((ref) => (
          <View
            key={ref}
            style={{
              position: 'absolute',
          left: `${ref}%`,
              width: 1,
              height: 8,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── ResultCard Component ─────────────────────────────────────────────────────

function PercentileMetric({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number;
  unit: string;
}) {
  if (value === undefined || value === null) return null;
  const color = getPercentileColor(value);
  return (
    <View
      style={{
        backgroundColor: color.bg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: color.text }}>{label}</Text>
        <View
          style={{
            backgroundColor: color.text,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{color.label}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: color.text }}>
          {Math.round(value)}
        </Text>
        <Text style={{ fontSize: 14, color: color.text, marginLeft: 4 }}>{unit}</Text>
      </View>
      <PercentileBar value={value} />
      <Text style={{ fontSize: 11, color: color.text, marginTop: 4, opacity: 0.8 }}>
        Referans çizgileri: P3 · P15 · P50 · P85 · P97
      </Text>
    </View>
  );
}

// ─── RegistrationModal ────────────────────────────────────────────────────────

interface RegForm {
  email: string;
  password: string;
  name: string;
  childName: string;
  childBirthDate: Date;
  kvkk: boolean;
  sensitiveData: boolean;
  guardianDeclaration: boolean;
}

function RegistrationModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}) {
  const [form, setForm] = useState<RegForm>({
    email: '',
    password: '',
    name: '',
    childName: '',
    childBirthDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    kvkk: false,
    sensitiveData: false,
    guardianDeclaration: false,
  });
  const [showChildDatePicker, setShowChildDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.name || !form.childName) {
      Toast.show({ type: 'error', text1: 'Lütfen tüm alanları doldurun' });
      return;
    }
    if (!form.kvkk || !form.sensitiveData || !form.guardianDeclaration) {
      Toast.show({ type: 'error', text1: 'Lütfen tüm onayları işaretleyin' });
      return;
    }
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const response = await register({
        email: form.email,
        password: form.password,
        name: form.name,
        child: {
          name: form.childName,
          birth_date: formatDate(form.childBirthDate),
        },
        consents: {
          terms_accepted: form.kvkk,
          terms_accepted_at: now,
          marketing_consent: false,
          marketing_consent_at: null,
          sensitive_data_consent: form.sensitiveData,
          sensitive_data_consent_at: now,
          guardian_declaration: form.guardianDeclaration,
          guardian_declaration_at: now,
        },
      });
      if (response.token) {
        await setToken(response.token);
        onSuccess(response.token);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu';
      Toast.show({ type: 'error', text1: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 36,
            maxHeight: '92%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
                Hesap Oluştur &amp; Kaydet
              </Text>
              <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 18 }}>
              Sonucu kaydetmek için ücretsiz hesap oluşturun. Gelecekteki büyüme takibinizi kolaylaştırmak için çocuğunuzun bilgilerini girin.
            </Text>

            {/* Ad Soyad */}
            <Text style={fieldLabel}>Ad Soyad</Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="Adınız Soyadınız"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
              autoCapitalize="words"
            />

            {/* E-posta */}
            <Text style={fieldLabel}>E-posta</Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
              placeholder="ornek@email.com"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Şifre */}
            <Text style={fieldLabel}>Şifre</Text>
            <TextInput
              value={form.password}
              onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
              placeholder="En az 8 karakter"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
              secureTextEntry
            />

            {/* Çocuk Adı */}
            <Text style={fieldLabel}>Çocuğunuzun Adı</Text>
            <TextInput
              value={form.childName}
              onChangeText={(v) => setForm((p) => ({ ...p, childName: v }))}
              placeholder="Çocuğunuzun adı"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
              autoCapitalize="words"
            />

            {/* Çocuk Doğum Tarihi */}
            <Text style={fieldLabel}>Çocuğun Doğum Tarihi</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowChildDatePicker(true)}
              style={[inputStyle, { flexDirection: 'row', alignItems: 'center' }]}
            >
              <Ionicons name="calendar-outline" size={16} color="#6B7280" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: '#1F2937', flex: 1 }}>
                {displayDate(formatDate(form.childBirthDate))}
              </Text>
            </TouchableOpacity>
            {showChildDatePicker && (
              <DateTimePicker
                value={form.childBirthDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(_event, selected) => {
                  setShowChildDatePicker(false);
                  if (selected) setForm((p) => ({ ...p, childBirthDate: selected }));
                }}
              />
            )}

            {/* Onaylar */}
            <View style={{ marginTop: 8 }}>
              <CheckboxRow
                checked={form.kvkk}
                onToggle={() => setForm((p) => ({ ...p, kvkk: !p.kvkk }))}
                label="KVKK Aydınlatma Metni'ni okudum, kişisel verilerimin işlenmesini onaylıyorum."
              />
              <CheckboxRow
                checked={form.sensitiveData}
                onToggle={() => setForm((p) => ({ ...p, sensitiveData: !p.sensitiveData }))}
                label="Sağlık verilerimin işlenmesine açık rıza veriyorum."
              />
              <CheckboxRow
                checked={form.guardianDeclaration}
                onToggle={() =>
                  setForm((p) => ({ ...p, guardianDeclaration: !p.guardianDeclaration }))
                }
                label="Veli/vasi sıfatıyla çocuğum adına bu beyanı verdiğimi onaylıyorum."
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={isLoading}
              style={{
                backgroundColor: '#2563EB',
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 16,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                  Hesap Oluştur &amp; Kaydet
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ChildSelectorModal ───────────────────────────────────────────────────────

function ChildSelectorModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (childId: number) => void;
}) {
  const { children } = useActiveChild();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 36,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
              Çocuk Seçin
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            Sonucu hangi çocuğun profiline kaydetmek istiyorsunuz?
          </Text>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              activeOpacity={0.8}
              onPress={() => onSelect(child.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#DBEAFE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="person-outline" size={20} color="#2563EB" />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937' }}>
                {child.name}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#9CA3AF"
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
          ))}
          {/* Save without linking to a child */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onSelect(-1)}
            style={{
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              Çocuk profili bağlamadan kaydet
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Small Helpers ────────────────────────────────────────────────────────────

function CheckboxRow({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: checked ? '#2563EB' : '#D1D5DB',
          backgroundColor: checked ? '#2563EB' : '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
          marginTop: 1,
          flexShrink: 0,
        }}
      >
        {checked && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>
      <Text style={{ fontSize: 12, color: '#374151', flex: 1, lineHeight: 18 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const fieldLabel = {
  fontSize: 13,
  color: '#6B7280',
  marginBottom: 6,
  fontWeight: '500' as const,
};

const inputStyle = {
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: '#1F2937',
  marginBottom: 14,
  backgroundColor: '#fff',
  minHeight: 44,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

/** Stable default birth date placeholder (1 year ago) — computed once at module load */
const DEFAULT_BIRTH_DATE_PLACEHOLDER = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
})();

export default function PercentileCalculatorScreen() {
  const { isAuthenticated, refreshUser } = useAuth();
  const { children, reloadChildren } = useActiveChild();

  // Form state
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [measurementDate, setMeasurementDate] = useState<Date>(new Date());
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [headCm, setHeadCm] = useState('');

  // Calculation state
  const [result, setResult] = useState<PercentileResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showChildSelector, setShowChildSelector] = useState(false);

  const handleCalculate = useCallback(async () => {
    if (!gender) {
      Toast.show({ type: 'error', text1: 'Lütfen cinsiyet seçin' });
      return;
    }
    if (!birthDate) {
      Toast.show({ type: 'error', text1: 'Lütfen tüm alanları doldurun' });
      return;
    }

    const w = weightKg ? parseFloat(weightKg) : undefined;
    const h = heightCm ? parseFloat(heightCm) : undefined;
    const hc = headCm ? parseFloat(headCm) : undefined;

    if (!w && !h && !hc) {
      Toast.show({ type: 'error', text1: 'Lütfen en az bir ölçüm değeri girin' });
      return;
    }

    const birthStr = formatDate(birthDate);
    const measStr = formatDate(measurementDate);
    const ageYears = getAgeYears(birthStr, measStr);

    if (ageYears < 0 || ageYears > 5) {
      Toast.show({
        type: 'info',
        text1: 'WHO büyüme standartları 0-5 yaş için geçerlidir',
      });
      return;
    }

    setIsCalculating(true);
    try {
      const res = await calculatePercentile({
        gender,
        birth_date: birthStr,
        measurement_date: measStr,
        weight_kg: w,
        height_cm: h,
        head_circumference_cm: hc,
      });
      setResult(res);
      Toast.show({
        type: 'info',
        text1: 'WHO büyüme standartları 0-5 yaş için geçerlidir',
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Hesaplama sırasında bir hata oluştu' });
    } finally {
      setIsCalculating(false);
    }
  }, [gender, birthDate, measurementDate, weightKg, heightCm, headCm]);

  const doSave = useCallback(
    async (childId: number | undefined) => {
      if (!result) return;
      setIsSaving(true);
      try {
        await savePercentileResult(result, childId);
        Toast.show({ type: 'success', text1: 'Sonuç kaydedildi' });
      } catch {
        Toast.show({ type: 'error', text1: 'Kayıt sırasında bir hata oluştu' });
      } finally {
        setIsSaving(false);
      }
    },
    [result],
  );

  const handleSave = useCallback(async () => {
    if (!result) return;

    if (!isAuthenticated) {
      setShowRegistrationModal(true);
      return;
    }

    if (children.length > 0) {
      setShowChildSelector(true);
      return;
    }

    // Auth, no children — save without child link
    await doSave(undefined);
  }, [result, isAuthenticated, children, doSave]);

  const handleChildSelected = useCallback(
    async (childId: number) => {
      setShowChildSelector(false);
      await doSave(childId > 0 ? childId : undefined);
    },
    [doSave],
  );

  const handleRegistrationSuccess = useCallback(
    async (token: string) => {
      setShowRegistrationModal(false);
      await setToken(token);
      await refreshUser();
      await reloadChildren();
      // Save after registration — try to save without child link (child created by register)
      if (result) {
        setIsSaving(true);
        try {
          await savePercentileResult(result);
          Toast.show({ type: 'success', text1: 'Hesap oluşturuldu ve sonuç kaydedildi' });
        } catch {
          Toast.show({ type: 'error', text1: 'Kayıt sırasında bir hata oluştu' });
        } finally {
          setIsSaving(false);
        }
      }
    },
    [result, refreshUser, reloadChildren],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EFF6FF' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#2563EB',
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
            accessibilityLabel="Geri git"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            Persentil Hesaplayıcı 📊
          </Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
          WHO büyüme standartları · 0-5 yaş
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info box */}
          <View
            style={{
              backgroundColor: '#DBEAFE',
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Ionicons name="information-circle-outline" size={18} color="#2563EB" style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={{ fontSize: 12, color: '#1E40AF', flex: 1, lineHeight: 18 }}>
              Bu araç WHO büyüme standartlarını kullanır ve 0-5 yaş arası çocuklar için tasarlanmıştır. Sonuçlar tıbbi tavsiye yerine geçmez.
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Gender */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 10 }}>
              Cinsiyet
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setGender('male')}
                accessibilityLabel="Erkek"
                accessibilityRole="radio"
                accessibilityState={{ checked: gender === 'male' }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: gender === 'male' ? '#2563EB' : '#F3F4F6',
                  borderWidth: 1,
                  borderColor: gender === 'male' ? '#2563EB' : '#E5E7EB',
                  minHeight: 44,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>👦</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: gender === 'male' ? '#fff' : '#6B7280',
                  }}
                >
                  Erkek
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setGender('female')}
                accessibilityLabel="Kız"
                accessibilityRole="radio"
                accessibilityState={{ checked: gender === 'female' }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: gender === 'female' ? '#EC4899' : '#F3F4F6',
                  borderWidth: 1,
                  borderColor: gender === 'female' ? '#EC4899' : '#E5E7EB',
                  minHeight: 44,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>👧</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: gender === 'female' ? '#fff' : '#6B7280',
                  }}
                >
                  Kız
                </Text>
              </TouchableOpacity>
            </View>

            {/* Birth Date */}
            <DateField
              label="Doğum Tarihi"
              value={birthDate ?? DEFAULT_BIRTH_DATE_PLACEHOLDER}
              onChange={(d) => setBirthDate(d)}
            />

            {/* Measurement Date */}
            <DateField
              label="Ölçüm Tarihi"
              value={measurementDate}
              onChange={(d) => setMeasurementDate(d)}
            />

            {/* Weight */}
            <Text style={fieldLabel}>Ağırlık (kg) — opsiyonel</Text>
            <TextInput
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
              placeholder="Örn: 7.5"
              placeholderTextColor="#9CA3AF"
              accessibilityLabel="Ağırlık kg"
              style={inputStyle}
            />

            {/* Height */}
            <Text style={fieldLabel}>Boy (cm) — opsiyonel</Text>
            <TextInput
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="decimal-pad"
              placeholder="Örn: 65.0"
              placeholderTextColor="#9CA3AF"
              accessibilityLabel="Boy cm"
              style={inputStyle}
            />

            {/* Head Circumference */}
            <Text style={fieldLabel}>Baş Çevresi (cm) — opsiyonel</Text>
            <TextInput
              value={headCm}
              onChangeText={setHeadCm}
              keyboardType="decimal-pad"
              placeholder="Örn: 42.0"
              placeholderTextColor="#9CA3AF"
              accessibilityLabel="Baş çevresi cm"
              style={[inputStyle, { marginBottom: 0 }]}
            />
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCalculate}
            disabled={isCalculating}
            accessibilityLabel="Hesapla"
            accessibilityRole="button"
            style={{
              backgroundColor: isCalculating ? '#93C5FD' : '#2563EB',
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 20,
              minHeight: 52,
            }}
          >
            {isCalculating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                Persentil Hesapla
              </Text>
            )}
          </TouchableOpacity>

          {/* Result Card */}
          {result && (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#1E3A8A',
                  marginBottom: 4,
                }}
              >
                📊 Persentil Sonuçları
              </Text>
              {result.age_months !== undefined && (
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
                  Yaş: {result.age_months} ay
                </Text>
              )}

              <PercentileMetric
                label="Ağırlık Persentili"
                value={result.weight_percentile}
                unit="persentil"
              />
              <PercentileMetric
                label="Boy Persentili"
                value={result.height_percentile}
                unit="persentil"
              />
              <PercentileMetric
                label="Baş Çevresi Persentili"
                value={result.head_circumference_percentile}
                unit="persentil"
              />
              {result.bmi_percentile !== undefined && (
                <PercentileMetric
                  label="VKİ Persentili"
                  value={result.bmi_percentile}
                  unit="persentil"
                />
              )}

              {/* Interpretation */}
              {result.interpretation && (
                <View
                  style={{
                    backgroundColor: '#F0F9FF',
                    borderRadius: 10,
                    padding: 12,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0369A1', marginBottom: 4 }}>
                    💡 Yorum
                  </Text>
                  <Text style={{ fontSize: 13, color: '#0C4A6E', lineHeight: 20 }}>
                    {result.interpretation}
                  </Text>
                </View>
              )}

              {/* Persentil guide */}
              <View style={{ marginTop: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Persentil Değerlendirme Rehberi
                </Text>
                {[
                  { range: '0–3', label: 'Çok Düşük', bg: '#FEE2E2', text: '#DC2626' },
                  { range: '3–15', label: 'Düşük', bg: '#FEF3C7', text: '#D97706' },
                  { range: '15–85', label: 'Normal', bg: '#DCFCE7', text: '#15803D' },
                  { range: '85–97', label: 'Yüksek', bg: '#FEF3C7', text: '#D97706' },
                  { range: '97–100', label: 'Çok Yüksek', bg: '#FEE2E2', text: '#DC2626' },
                ].map((item) => (
                  <View
                    key={item.range}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: item.bg,
                        borderWidth: 1,
                        borderColor: item.text,
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: '#374151' }}>
                      P{item.range}: {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={isSaving}
                accessibilityLabel="Sonucu kaydet"
                accessibilityRole="button"
                style={{
                  backgroundColor: isSaving ? '#93C5FD' : '#1D4ED8',
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 16,
                  minHeight: 44,
                }}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                    Sonucu Kaydet
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* WHO Disclaimer */}
          <View
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 14,
              padding: 14,
              marginTop: result ? 0 : 8,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
              ℹ️ Hakkında
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 18 }}>
              Bu araç, Dünya Sağlık Örgütü (WHO) büyüme standartlarını kullanarak çocuğunuzun boy, kilo ve baş çevresi ölçümlerini yaşıtlarıyla karşılaştırır. Persentil değerleri, tıbbi bir tanı veya tedavi önerisi niteliği taşımamaktadır. Sonuçları pediatristinizle değerlendirmenizi öneririz.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <RegistrationModal
        visible={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
      />
      <ChildSelectorModal
        visible={showChildSelector}
        onClose={() => setShowChildSelector(false)}
        onSelect={handleChildSelected}
      />
    </SafeAreaView>
  );
}
