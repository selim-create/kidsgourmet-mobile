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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = 'E-posta veya kullanıcı adı gerekli';
    if (!password) newErrors.password = 'Şifre gerekli';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ username: username.trim(), password });
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
              label="E-posta veya Kullanıcı Adı"
              placeholder="E-posta veya Kullanıcı Adı"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.username}
              leftIcon={<Ionicons name="person-outline" size={18} color="#9CA3AF" />}
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

            {/* Forgot Password */}
            <TouchableOpacity
              className="self-end mb-4 -mt-2"
              onPress={() => Toast.show({ type: 'info', text1: 'Yakında', text2: 'Şifre sıfırlama özelliği yakında eklenecek.' })}
            >
              <Text className="text-primary text-sm font-medium">Şifremi Unuttum</Text>
            </TouchableOpacity>

            <Button
              onPress={handleLogin}
              isLoading={isLoading}
            >
              Giriş Yap
            </Button>

            {/* Google Sign-In Placeholder */}
            <TouchableOpacity
              className="mt-3 flex-row items-center justify-center border border-gray-200 rounded-xl py-3 px-4 bg-white"
              onPress={() => Toast.show({ type: 'info', text1: 'Yakında', text2: 'Google ile giriş özelliği yakında eklenecek.' })}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text className="text-dark text-sm font-medium ml-2">Google ile Giriş Yap</Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-gray-500 text-sm">Hesabınız yok mu? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-primary font-semibold text-sm">
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
            </View>

            {/* Guest access */}
            <TouchableOpacity
              className="mt-3 items-center"
              onPress={() => router.replace('/(tabs)')}
            >
              <Text className="text-gray-400 text-sm">Misafir olarak devam et →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
