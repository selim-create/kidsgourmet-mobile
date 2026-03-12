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

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçerli bir e-posta girin';
    if (!password) newErrors.password = 'Şifre gerekli';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Giriş yapılamadı. Tekrar deneyin.';
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
            Çocuğunuz için en sağlıklı tarifler
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 pb-6">
          <Text className="text-dark text-2xl font-bold mb-1">Giriş Yap</Text>
          <Text className="text-gray-400 text-sm mb-6">
            Hesabınıza giriş yaparak devam edin
          </Text>

          <Input
            label="E-posta"
            placeholder="ornek@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={18} color="#9CA3AF" />}
          />

          <Input
            label="Şifre"
            placeholder="Şifrenizi girin"
            value={password}
            onChangeText={setPassword}
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

          <Button
            onPress={handleLogin}
            isLoading={isLoading}
            className="mt-2"
          >
            Giriş Yap
          </Button>

          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-gray-500 text-sm">Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-primary font-semibold text-sm">
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
