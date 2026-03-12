import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    username: '',
    childName: '',
    childBirthDate: '',
    skipChild: false,
  });
  const [consents, setConsents] = useState({
    terms: false,
    marketing: false,
    sensitiveData: false,
    guardian: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Ad Soyad gerekli';
    if (!form.email.trim()) e.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli e-posta girin';
    if (!form.password) e.password = 'Şifre gerekli';
    else if (form.password.length < 6) e.password = 'En az 6 karakter olmalı';
    if (!consents.terms) e.terms = 'Kullanım koşullarını kabul etmelisiniz';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const now = () => new Date().toISOString();

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        username: form.username.trim() || undefined,
        child:
          !form.skipChild && form.childName.trim()
            ? { name: form.childName.trim(), birth_date: form.childBirthDate }
            : undefined,
        consents: {
          terms_accepted: consents.terms,
          terms_accepted_at: consents.terms ? now() : null,
          marketing_consent: consents.marketing,
          marketing_consent_at: consents.marketing ? now() : null,
          sensitive_data_consent: consents.sensitiveData,
          sensitive_data_consent_at: consents.sensitiveData ? now() : null,
          guardian_declaration: consents.guardian,
          guardian_declaration_at: consents.guardian ? now() : null,
        },
      });
      router.replace('/(tabs)');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Kayıt oluşturulamadı.';
      Toast.show({ type: 'error', text1: 'Hata', text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-light">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="bg-primary pt-12 pb-10 px-6 items-center">
            <Text className="text-white text-4xl font-bold mb-1">🥗</Text>
            <Text className="text-white text-2xl font-bold">KidsGourmet</Text>
            <Text className="text-white/80 text-sm mt-1">
              Hesap oluşturun, sağlıklı tarifler keşfedin
            </Text>
          </View>

          {/* Form */}
          <View className="flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 pb-6">
            <Text className="text-dark text-2xl font-bold mb-1">Kayıt Ol</Text>
            <Text className="text-gray-400 text-sm mb-6">
              Yeni bir hesap oluşturun
            </Text>

            <Input
              label="Ad Soyad"
              placeholder="Adınız ve soyadınız"
              value={form.name}
              onChangeText={update('name')}
              autoCapitalize="words"
              error={errors.name}
              leftIcon={<Ionicons name="person-outline" size={18} color="#9CA3AF" />}
            />

            <Input
              label="E-posta"
              placeholder="ornek@email.com"
              value={form.email}
              onChangeText={update('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={18} color="#9CA3AF" />}
            />

            <Input
              label="Şifre"
              placeholder="En az 6 karakter"
              value={form.password}
              onChangeText={update('password')}
              secureTextEntry={!showPassword}
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              }
            />

            <Input
              label="Kullanıcı Adı (opsiyonel)"
              placeholder="kullanici_adi"
              value={form.username}
              onChangeText={update('username')}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="at-outline" size={18} color="#9CA3AF" />}
            />

            {/* Child Info */}
            <View className="mb-4">
              <Text className="text-dark font-semibold text-sm mb-3">
                Çocuk Bilgileri (opsiyonel)
              </Text>

              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-500 text-sm">Daha sonra ekleyeceğim</Text>
                <Switch
                  value={form.skipChild}
                  onValueChange={(val) => update('skipChild')(val)}
                  trackColor={{ true: '#FF8A65' }}
                />
              </View>

              {!form.skipChild && (
                <>
                  <Input
                    label="Çocuk Adı"
                    placeholder="Çocuğunuzun adı"
                    value={form.childName}
                    onChangeText={update('childName')}
                    autoCapitalize="words"
                    leftIcon={<Ionicons name="happy-outline" size={18} color="#9CA3AF" />}
                  />
                  <Input
                    label="Doğum Tarihi"
                    placeholder="YYYY-MM-DD"
                    value={form.childBirthDate}
                    onChangeText={update('childBirthDate')}
                    leftIcon={<Ionicons name="calendar-outline" size={18} color="#9CA3AF" />}
                  />
                </>
              )}
            </View>

            {/* Consents */}
            <View className="mb-6 gap-3">
              <Text className="text-dark font-semibold text-sm mb-1">Onaylar</Text>

              <TouchableOpacity
                className="flex-row items-start gap-3"
                onPress={() => setConsents((c) => ({ ...c, terms: !c.terms }))}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={consents.terms ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={consents.terms ? '#FF8A65' : '#9CA3AF'}
                />
                <View className="flex-1">
                  <Text className="text-dark text-sm">
                    Kullanım Koşulları ve Gizlilik Politikası'nı kabul ediyorum{' '}
                    <Text className="text-primary">*</Text>
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.terms ? (
                <Text className="text-red-500 text-xs ml-8">{errors.terms}</Text>
              ) : null}

              <TouchableOpacity
                className="flex-row items-start gap-3"
                onPress={() => setConsents((c) => ({ ...c, marketing: !c.marketing }))}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={consents.marketing ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={consents.marketing ? '#FF8A65' : '#9CA3AF'}
                />
                <Text className="flex-1 text-dark text-sm">
                  Pazarlama amaçlı iletişim almak istiyorum (opsiyonel)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3"
                onPress={() => setConsents((c) => ({ ...c, sensitiveData: !c.sensitiveData }))}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={consents.sensitiveData ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={consents.sensitiveData ? '#FF8A65' : '#9CA3AF'}
                />
                <Text className="flex-1 text-dark text-sm">
                  Hassas veri işlenmesine onay veriyorum (opsiyonel)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3"
                onPress={() => setConsents((c) => ({ ...c, guardian: !c.guardian }))}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={consents.guardian ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={consents.guardian ? '#FF8A65' : '#9CA3AF'}
                />
                <Text className="flex-1 text-dark text-sm">
                  18 yaşından küçük bir çocuk adına veli/vasi sıfatıyla kayıt yaptırıyorum (opsiyonel)
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              onPress={handleRegister}
              isLoading={isLoading}
            >
              Kayıt Ol
            </Button>

            {/* Google Sign-In Placeholder */}
            <TouchableOpacity
              className="mt-3 flex-row items-center justify-center border border-gray-200 rounded-xl py-3 px-4 bg-white"
              onPress={() => Toast.show({ type: 'info', text1: 'Yakında', text2: 'Google ile kayıt özelliği yakında eklenecek.' })}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text className="text-dark text-sm font-medium ml-2">Google ile Kayıt Ol</Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-gray-500 text-sm">Zaten hesabınız var mı? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-primary font-semibold text-sm">
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
