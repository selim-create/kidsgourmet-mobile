import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Icon } from '../../src/components/ui/Icon';
import { useAuth } from '../../src/contexts/AuthContext';
import { deleteAccount } from '../../src/services/auth-service';

export default function DeleteAccountScreen() {
  const { user, logout } = useAuth();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appleRefreshToken = useMemo(() => {
    if (user?.registered_via !== 'apple') return undefined;
    if (typeof user.apple_refresh_token === 'string') return user.apple_refresh_token;
    return undefined;
  }, [user]);

  const handleDelete = async () => {
    if (!isConfirmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await deleteAccount(appleRefreshToken);
      await logout();
      Toast.show({ type: 'success', text1: 'Hesabınız başarıyla silindi' });
      router.replace('/(auth)/login');
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Hesap silinirken bir hata oluştu',
        text2: 'Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 14 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="triangle-exclamation" size={20} color="#DC2626" />
            </View>
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#B91C1C',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Hesabınızı silmek üzeresiniz
          </Text>

          {[
            'Tüm kişisel verileriniz silinecektir',
            'Çocuk profilleri ve büyüme kayıtları silinecektir',
            'Favori tarifler ve koleksiyonlar silinecektir',
            'Alışveriş listeleri silinecektir',
            'Bu işlem geri alınamaz',
          ].map((item) => (
            <View key={item} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ color: '#DC2626', marginRight: 8 }}>•</Text>
              <Text style={{ flex: 1, color: '#374151', fontSize: 14, lineHeight: 20 }}>
                {item}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsConfirmed((prev) => !prev)}
            disabled={isSubmitting}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FCA5A5',
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderWidth: 1.5,
                borderColor: isConfirmed ? '#DC2626' : '#9CA3AF',
                backgroundColor: isConfirmed ? '#DC2626' : '#fff',
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              {isConfirmed ? (
                <Icon name="check" size={11} color="#fff" />
              ) : null}
            </View>
            <Text style={{ flex: 1, color: '#374151', fontSize: 13, lineHeight: 18 }}>
              Hesabımı kalıcı olarak silmek istediğimi onaylıyorum
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDelete}
            disabled={!isConfirmed || isSubmitting}
            style={{
              marginTop: 16,
              minHeight: 46,
              borderRadius: 12,
              backgroundColor: !isConfirmed || isSubmitting ? '#FCA5A5' : '#DC2626',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                Hesabı Sil
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            disabled={isSubmitting}
            style={{
              marginTop: 10,
              minHeight: 44,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ color: '#4B5563', fontSize: 14, fontWeight: '600' }}>
              Vazgeç
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
