import React, { useEffect } from 'react';
import { Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

interface GoogleSignInButtonProps {
  text: string;
  onSuccess: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}

export function GoogleSignInButton({
  text,
  onSuccess,
  disabled = false,
}: GoogleSignInButtonProps) {
  const googleClientId = Platform.select({
    ios: Constants.expoConfig?.extra?.googleIosClientId as string | undefined,
    android: (Constants.expoConfig?.extra?.googleAndroidClientId ?? Constants.expoConfig?.extra?.googleWebClientId) as string | undefined,
    default: Constants.expoConfig?.extra?.googleWebClientId as string | undefined,
  });

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId ?? Constants.expoConfig?.extra?.googleWebClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken =
      (googleResponse.params as Record<string, string> | undefined)?.id_token ??
      googleResponse.authentication?.idToken;

    if (idToken) {
      void onSuccess(idToken);
      return;
    }

    Toast.show({
      type: 'error',
      text1: 'Google ile giriş başarısız',
      text2: 'Kimlik doğrulama tamamlanamadı.',
    });
  }, [googleResponse, onSuccess]);

  if (!googleClientId) {
    return null;
  }

  return (
    <TouchableOpacity
      className="flex-row items-center justify-center border border-gray-200 rounded-xl py-3 px-4 bg-white mb-3"
      activeOpacity={0.8}
      onPress={() => promptGoogleAsync()}
      disabled={!googleRequest || disabled}
    >
      <Ionicons name="logo-google" size={18} color="#EA4335" />
      <Text className="text-dark text-sm font-medium ml-2 flex-1">
        {text}
      </Text>
    </TouchableOpacity>
  );
}
