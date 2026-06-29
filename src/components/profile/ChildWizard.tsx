import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import useSWR from 'swr';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllergens } from '../../services/allergen-service';
import { getDietTypes } from '../../services/taxonomy-service';
import {
  createChild,
  updateChild,
  uploadChildAvatar,
  type ChildUpsertPayload,
} from '../../services/user-service';
import { useActiveChild } from '../../contexts/ActiveChildContext';
import { AllergenChips } from './AllergenChips';
import { ChildAvatarPicker } from './ChildAvatarPicker';
import type { Child } from '../../lib/types';
import { API_ENDPOINTS } from '../../lib/constants';

import { AppIcon } from '../ui/AppIcon';
type Gender = 'male' | 'female' | 'other';
type Mode = 'create' | 'edit';

interface ChildWizardProps {
  mode: Mode;
  child?: Child;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Kız' },
  { value: 'male', label: 'Erkek' },
  { value: 'other', label: 'Belirtmek istemiyorum' },
];

const TOTAL_STEPS = 3;
const LEGAL_INFO_ROUTE = '/aydinlatma-metni' as const;

export function ChildWizard({ mode, child }: ChildWizardProps) {
  const insets = useSafeAreaInsets();
  const { reloadChildren } = useActiveChild();

  // Step 1
  const [name, setName] = useState(child?.name ?? '');
  const [birthDate, setBirthDate] = useState<Date>(
    child?.birth_date ? new Date(child.birth_date) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<Gender | undefined>(child?.gender);

  // Step 2
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    child?.allergies ?? child?.allergens ?? [],
  );
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>(
    child?.diet_types ?? [],
  );
  const [notes, setNotes] = useState(child?.notes ?? '');

  // Step 3
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    child?.avatar_url ?? null,
  );
  const [termsAccepted, setTermsAccepted] = useState(
    child?.kvkk_consent ?? false,
  );
  const [sensitiveDataConsent, setSensitiveDataConsent] = useState(
    child?.sensitive_data_consent ?? child?.kvkk_consent ?? false,
  );
  const [guardianDeclaration, setGuardianDeclaration] = useState(
    child?.guardian_declaration ?? false,
  );

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const { data: allergenData } = useSWR(API_ENDPOINTS.ALLERGENS, () =>
    getAllergens(),
  );
  const { data: dietTypeData } = useSWR(API_ENDPOINTS.DIET_TYPES, () =>
    getDietTypes(),
  );

  const allergenNames = (allergenData ?? []).map((a) => a.name);
  const dietTypeNames = (dietTypeData ?? []).map((d) => d.name);

  const birthDateStr = birthDate.toISOString().split('T')[0];

  const step1Valid = name.trim().length > 0;

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Ad zorunludur' });
      return;
    }
    if (!termsAccepted || !sensitiveDataConsent || !guardianDeclaration) {
      Toast.show({
        type: 'error',
        text1: 'Rıza gerekli',
        text2: 'Devam etmek için gerekli veli ve veri işleme onaylarını verin.',
      });
      return;
    }
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const data: ChildUpsertPayload = {
        name: name.trim(),
        birth_date: birthDateStr,
        gender,
        allergies: selectedAllergens,
        diet_types: selectedDietTypes,
        notes: notes.trim() || undefined,
        // Keep both fields aligned: child-profile payloads still use kvkk_consent,
        // while shared consent handling expects terms_accepted semantics.
        kvkk_consent: termsAccepted,
        terms_accepted: termsAccepted,
        terms_accepted_at: termsAccepted ? now : null,
        sensitive_data_consent: sensitiveDataConsent,
        sensitive_data_consent_at: sensitiveDataConsent ? now : null,
        guardian_declaration: guardianDeclaration,
        guardian_declaration_at: guardianDeclaration ? now : null,
      };

      let savedChild: Child;
      if (mode === 'edit' && child?.id) {
        savedChild = await updateChild(child.id, data);
      } else {
        savedChild = await createChild(data);
      }

      // Upload avatar if a pending local URI exists
      if (pendingAvatarUri && savedChild.id) {
        try {
          await uploadChildAvatar(savedChild.id, {
            uri: pendingAvatarUri,
            mimeType: 'image/jpeg',
            fileName: 'avatar.jpg',
          });
        } catch {
          // Avatar upload failure shouldn't block the wizard
          Toast.show({
            type: 'info',
            text1: 'Çocuk kaydedildi',
            text2: 'Avatar yüklenemedi, daha sonra tekrar deneyebilirsiniz.',
          });
        }
      }

      await reloadChildren();
      Toast.show({
        type: 'success',
        text1: mode === 'edit' ? 'Çocuk güncellendi' : 'Çocuk eklendi',
      });
      router.back();
    } catch (err: unknown) {
      // Hata detayını konsola yaz — hangi API hatasının geldiğini görmeye yarar
      console.error('[ChildWizard] Submit error:', err);
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        apiErr?.response?.data?.message ?? apiErr?.message ?? 'İşlem başarısız, tekrar deneyin';
      Toast.show({ type: 'error', text1: 'Hata', text2: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = (uri: string) => {
    if (!child?.id) {
      setPendingAvatarUri(uri);
    } else {
      setCurrentAvatarUrl(uri);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i + 1 === step ? 24 : 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: i + 1 <= step ? '#FF8A65' : '#E5E7EB',
          }}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text className="text-dark font-bold text-lg mb-4">Temel Bilgiler</Text>

      {/* Name */}
      <View className="mb-4">
        <Text className="text-dark font-medium mb-1.5 text-sm">
          Ad <Text className="text-warning">*</Text>
        </Text>
        <View className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Çocuğun adı"
            placeholderTextColor="#9CA3AF"
            className="text-dark text-base"
          />
        </View>
      </View>

      {/* Birth date */}
      <View className="mb-4">
        <Text className="text-dark font-medium mb-1.5 text-sm">
          Doğum Tarihi <Text className="text-warning">*</Text>
        </Text>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="spinner"
            locale="tr-TR"
            themeVariant="light"
            maximumDate={new Date()}
            onChange={(_, date) => date && setBirthDate(date)}
          />
        ) : (
          <>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="text-dark text-base">
                {birthDate.toLocaleDateString('tr-TR')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display="default"
                locale="tr-TR"
                maximumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setBirthDate(date);
                }}
              />
            )}
          </>
        )}
      </View>

      {/* Gender */}
      <View className="mb-4">
        <Text className="text-dark font-medium mb-1.5 text-sm">Cinsiyet</Text>
        <View className="flex-row gap-2 flex-wrap">
          {GENDER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setGender(opt.value)}
              className={`px-4 py-2 rounded-xl border ${
                gender === opt.value
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  gender === opt.value ? 'text-white' : 'text-dark'
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mt-2 rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <Text className="text-dark font-semibold text-sm mb-3">Gerekli Onaylar</Text>

        <TouchableOpacity
          className="flex-row items-start gap-3 mb-3"
          onPress={() => setTermsAccepted((prev) => !prev)}
          activeOpacity={0.7}
        >
          <AppIcon
            name={termsAccepted ? 'checkbox' : 'square-outline'}
            size={20}
            color={termsAccepted ? '#FF8A65' : '#9CA3AF'}
          />
          <Text className="flex-1 text-dark text-sm">
            Çocuğa ait verilerin işlenmesi için KVKK aydınlatma metnini okudum ve kabul ediyorum.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(LEGAL_INFO_ROUTE)}
          activeOpacity={0.7}
          className="mb-3 ml-8"
        >
          <Text className="text-primary text-xs font-medium">
            Aydınlatma metnini görüntüle →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-start gap-3 mb-3"
          onPress={() => setSensitiveDataConsent((prev) => !prev)}
          activeOpacity={0.7}
        >
          <AppIcon
            name={sensitiveDataConsent ? 'checkbox' : 'square-outline'}
            size={20}
            color={sensitiveDataConsent ? '#FF8A65' : '#9CA3AF'}
          />
          <Text className="flex-1 text-dark text-sm">
            Hassas veri işleme iznini veriyorum.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-start gap-3"
          onPress={() => setGuardianDeclaration((prev) => !prev)}
          activeOpacity={0.7}
        >
          <AppIcon
            name={guardianDeclaration ? 'checkbox' : 'square-outline'}
            size={20}
            color={guardianDeclaration ? '#FF8A65' : '#9CA3AF'}
          />
          <Text className="flex-1 text-dark text-sm">
            Çocuk adına işlem yapmaya yetkili veli/yasal temsilci olduğumu beyan ederim.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="text-dark font-bold text-lg mb-4">Sağlık & Alerjenler</Text>

      {/* Allergens */}
      {allergenNames.length > 0 && (
        <View className="mb-4">
          <Text className="text-dark font-medium mb-2 text-sm">Alerjenler</Text>
          <AllergenChips
            value={selectedAllergens}
            onChange={setSelectedAllergens}
            allergens={allergenNames}
          />
        </View>
      )}

      {/* Diet types */}
      {dietTypeNames.length > 0 && (
        <View className="mb-4">
          <Text className="text-dark font-medium mb-2 text-sm">Diyet Tipleri</Text>
          <View className="flex-row flex-wrap gap-2">
            {dietTypeNames.map((dt) => {
              const isSelected = selectedDietTypes.includes(dt);
              return (
                <TouchableOpacity
                  key={dt}
                  onPress={() =>
                    setSelectedDietTypes(
                      isSelected
                        ? selectedDietTypes.filter((d) => d !== dt)
                        : [...selectedDietTypes, dt],
                    )
                  }
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-secondary border-secondary'
                      : 'bg-white border-gray-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-medium text-dark">
                    {dt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Notes */}
      <View className="mb-4">
        <Text className="text-dark font-medium mb-1.5 text-sm">Özel Notlar</Text>
        <View className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Beslenme notları, özel durumlar..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            className="text-dark text-base"
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="text-dark font-bold text-lg mb-4">
        Profil Fotoğrafı (İsteğe Bağlı)
      </Text>
      <View className="items-center py-6">
        <ChildAvatarPicker
          childUuid={child?.id}
          currentUrl={currentAvatarUrl}
          name={name || 'Çocuk'}
          size={100}
          onChange={handleAvatarChange}
        />
        <Text className="text-gray-400 text-sm mt-4 text-center">
          Galeriden seç veya fotoğraf çek
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFBE6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-100"
      >
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={handleBack} className="mr-3">
            <AppIcon name="arrow-back" size={24} color="#455A64" />
          </TouchableOpacity>
          <Text className="text-dark font-bold text-lg flex-1">
            {mode === 'edit' ? 'Çocuğu Düzenle' : 'Yeni Çocuk Ekle'}
          </Text>
          <Text className="text-gray-400 text-sm">
            {step}/{TOTAL_STEPS}
          </Text>
        </View>
        {renderStepIndicator()}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Footer */}
      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3"
      >
        <View className="flex-row gap-3">
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              className="flex-1 border border-gray-200 py-3 rounded-xl items-center"
              activeOpacity={0.7}
            >
              <Text className="text-dark font-semibold">Geri</Text>
            </TouchableOpacity>
          )}
          {step < TOTAL_STEPS ? (
            <TouchableOpacity
              onPress={handleNext}
              disabled={step === 1 && !step1Valid}
              className={`flex-1 py-3 rounded-xl items-center ${
                step === 1 && !step1Valid
                  ? 'bg-gray-200'
                  : 'bg-primary'
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`font-semibold ${
                  step === 1 && !step1Valid ? 'text-gray-400' : 'text-white'
                }`}
              >
                İleri
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`flex-1 py-3 rounded-xl items-center ${
                submitting ? 'bg-gray-200' : 'bg-primary'
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`font-semibold ${
                  submitting ? 'text-gray-400' : 'text-white'
                }`}
              >
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
