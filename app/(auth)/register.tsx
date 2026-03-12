import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Ad gerekli';
    if (!form.email.trim()) e.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli e-posta girin';
    if (!form.password) e.password = 'Şifre gerekli';
    else if (form.password.length < 6) e.password = 'En az 6 karakter olmalı';
    if (form.password !== form.passwordConfirm)
      e.passwordConfirm = 'Şifreler eşleşmiyor';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.passwordConfirm,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-light"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="bg-primary pt-16 pb-10 px-6 items-center">
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
            label="Şifre Tekrar"
            placeholder="Şifrenizi tekrar girin"
            value={form.passwordConfirm}
            onChangeText={update('passwordConfirm')}
            secureTextEntry={!showPassword}
            error={errors.passwordConfirm}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />}
          />

          <Button
            onPress={handleRegister}
            isLoading={isLoading}
            className="mt-2"
          >
            Kayıt Ol
          </Button>

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
  );
}
