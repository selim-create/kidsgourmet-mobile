import React, { useState, useEffect } from 'react';
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
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { signInWithGoogle, signInWithApple } from '../../src/services/auth-service';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const { login, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [appleAvailable, setAppleAvailable] = useState(false);

  const handleGooglePress = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error('Google id_token alınamadı');
      }

      const authResult = await signInWithGoogle(idToken);
      if (authResult.token) {
        await refreshUser();
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        'code' in err &&
        (err as { code: string }).code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }
      Toast.show({
        type: 'error',
        text1: 'Google ile giriş başarısız',
        text2: err instanceof Error ? err.message : 'Bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => {});
  }, []);

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

  const handleApplePress = async () => {
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple kimlik tokenı alınamadı.');
      }

      const result = await signInWithApple(
        credential.identityToken,
        {
          givenName: credential.fullName?.givenName,
          familyName: credential.fullName?.familyName,
        },
        credential.authorizationCode,
      );

      if (result.token) {
        await refreshUser();
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'ERR_REQUEST_CANCELED') return;
      Toast.show({
        type: 'error',
        text1: 'Apple ile giriş başarısız',
        text2: err instanceof Error ? err.message : 'Bir hata oluştu.',
      });
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
          <View style={{ backgroundColor: '#FFF8E1', paddingTop: 48, paddingBottom: 40, paddingHorizontal: 24, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.8}>
              <Image
                source={require('../../assets/images/kg-logo-full-dark.png')}
                style={{ width: 180, height: 50 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 8 }}>
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

            {/* Social Sign-In */}
            <View className="mt-4">
              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-400 text-sm px-3">veya</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <TouchableOpacity
                className="flex-row items-center justify-center border border-gray-200 rounded-xl py-3 px-4 bg-white mb-3"
                activeOpacity={0.8}
                onPress={handleGooglePress}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text className="text-dark text-sm font-medium ml-2 flex-1">
                  Google ile Giriş Yap
                </Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && appleAvailable && (
                <TouchableOpacity
                  className="flex-row items-center justify-center border border-gray-200 rounded-xl py-3 px-4 bg-black"
                  activeOpacity={0.8}
                  onPress={handleApplePress}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-apple" size={18} color="#fff" />
                  <Text className="text-white text-sm font-medium ml-2 flex-1">
                    Apple ile Giriş Yap
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 8 }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Hesabınız yok mu?</Text>
              <TouchableOpacity
                style={{ backgroundColor: '#F3F4F6', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB' }}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={{ color: '#1F2937', fontWeight: '700', fontSize: 14 }}>
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
