import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendContactForm } from '../../src/services/contact-service';
import { COLORS } from '../../src/lib/constants';
import Toast from 'react-native-toast-message';

// ─── Request Types ─────────────────────────────────────────────────────────────

const REQUEST_TYPES = [
  { value: 'access', label: 'Kişisel verilerime erişim talep ediyorum' },
  { value: 'correction', label: 'Verilerimin düzeltilmesini talep ediyorum' },
  { value: 'deletion', label: 'Verilerimin silinmesini talep ediyorum' },
  { value: 'restriction', label: 'Veri işlemeyi kısıtlama talep ediyorum' },
  { value: 'portability', label: 'Veri taşıma hakkımı kullanmak istiyorum' },
  { value: 'objection', label: 'Veri işlemeye itiraz ediyorum' },
  { value: 'other', label: 'Diğer' },
] as const;

type RequestType = typeof REQUEST_TYPES[number]['value'];

// ─── Input Component ─────────────────────────────────────────────────────────

interface InputRowProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  required?: boolean;
  multiline?: boolean;
}

function InputRow({ label, value, onChangeText, placeholder, keyboardType = 'default', required, multiline }: InputRowProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
        {label}{required && <Text style={{ color: '#EF4444' }}> *</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={{
          backgroundColor: '#F9FAFB',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 11,
          fontSize: 14,
          color: '#1F2937',
          minHeight: multiline ? 96 : undefined,
          textAlignVertical: multiline ? 'top' : 'auto',
        }}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BasvuruFormuScreen() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    email: '',
    phone: '',
    requestType: '' as RequestType | '',
    details: '',
    kvkkAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const setField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedType = REQUEST_TYPES.find((t) => t.value === form.requestType);

  const handleSubmit = async () => {
    const required: (keyof typeof form)[] = ['firstName', 'lastName', 'email', 'requestType', 'details'];
    for (const field of required) {
      if (!form[field]) {
        Toast.show({ type: 'error', text1: 'Lütfen zorunlu alanları doldurun.' });
        return;
      }
    }
    if (!form.kvkkAccepted) {
      Toast.show({ type: 'error', text1: 'KVKK Aydınlatma Metnini kabul etmeniz gerekmektedir.' });
      return;
    }

    setSubmitting(true);
    try {
      await sendContactForm({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        subject: `KVKK Başvurusu: ${selectedType?.label ?? form.requestType}`,
        message: `T.C. No: ${form.tcNo || '(belirtilmedi)'}\nTelefon: ${form.phone || '(belirtilmedi)'}\nTalep Türü: ${selectedType?.label ?? form.requestType}\n\nDetay:\n${form.details}`,
      });
      setSubmitted(true);
      Toast.show({ type: 'success', text1: 'Başvurunuz alındı!', text2: 'En geç 30 gün içinde yanıt verilecektir.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Başvuru gönderilemedi. Lütfen tekrar deneyin.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.primary }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Başvuru Formu</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 10, textAlign: 'center' }}>
            Başvurunuz Alındı!
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
            KVKK başvurunuz tarafımıza iletilmiştir. Yasal süre olan 30 gün içinde size dönüş yapılacaktır.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>KVKK Başvuru Formu</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 1 }}>
              Ana Sayfa · Başvuru Formu
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Info */}
        <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <Ionicons name="information-circle-outline" size={18} color="#2563EB" style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 13, color: '#1E40AF', lineHeight: 19, flex: 1 }}>
            6698 sayılı KVKK kapsamındaki haklarınızı kullanmak için bu formu doldurun. Başvurunuz 30 gün içinde yanıtlanacaktır.
          </Text>
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 }}>
          <InputRow label="Ad" value={form.firstName} onChangeText={(v) => setField('firstName', v)} placeholder="Adınız" required />
          <InputRow label="Soyad" value={form.lastName} onChangeText={(v) => setField('lastName', v)} placeholder="Soyadınız" required />
          <InputRow label="T.C. Kimlik No" value={form.tcNo} onChangeText={(v) => setField('tcNo', v)} placeholder="11 haneli T.C. Kimlik No" keyboardType="phone-pad" />
          <InputRow label="E-posta" value={form.email} onChangeText={(v) => setField('email', v)} placeholder="ornek@email.com" keyboardType="email-address" required />
          <InputRow label="Telefon" value={form.phone} onChangeText={(v) => setField('phone', v)} placeholder="+90 5XX XXX XX XX" keyboardType="phone-pad" />

          {/* Request Type */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
              Talep Türü <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowTypeSelector((v) => !v)}
              style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ flex: 1, fontSize: 14, color: selectedType ? '#1F2937' : '#9CA3AF' }} numberOfLines={1}>
                {selectedType?.label ?? 'Talep türünü seçin...'}
              </Text>
              <Ionicons name={showTypeSelector ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
            </TouchableOpacity>
            {showTypeSelector && (
              <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, marginTop: 4, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 }}>
                {REQUEST_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    activeOpacity={0.8}
                    onPress={() => { setField('requestType', type.value); setShowTypeSelector(false); }}
                    style={{ paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: form.requestType === type.value ? '#FFF3EE' : '#fff' }}
                  >
                    <Text style={{ fontSize: 13, color: form.requestType === type.value ? COLORS.primary : '#374151', fontWeight: form.requestType === type.value ? '600' : '400' }}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <InputRow
            label="Talep Detayı"
            value={form.details}
            onChangeText={(v) => setField('details', v)}
            placeholder="Talebinizi açıklayın..."
            multiline
            required
          />

          {/* KVKK Checkbox */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10 }}>
            <Switch
              value={form.kvkkAccepted}
              onValueChange={(v) => setField('kvkkAccepted', v)}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor="#fff"
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#4B5563', lineHeight: 18 }}>
                <TouchableOpacity onPress={() => router.push('/aydinlatma-metni')}>
                  <Text style={{ color: COLORS.primary, fontWeight: '600' }}>KVKK Aydınlatma Metni</Text>
                </TouchableOpacity>
                {" "}kapsamında kişisel verilerimin işlenmesini ve bu form aracılığıyla iletişime geçilmesini kabul ediyorum.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Başvuruyu Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
