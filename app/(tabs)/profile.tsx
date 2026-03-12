import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useSWR from 'swr';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { getChildren } from '../../src/services/user-service';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { formatAge } from '../../src/utils/ageFormatter';
import { API_ENDPOINTS } from '../../src/lib/constants';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const { activeChild, setActiveChild } = useActiveChild();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: children, isLoading: loadingChildren } = useSWR(
    isAuthenticated ? API_ENDPOINTS.CHILDREN : null,
    () => getChildren(),
  );

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch {
              Toast.show({ type: 'error', text1: 'Çıkış yapılamadı' });
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-light">
        <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100">
          <Text className="text-dark text-2xl font-bold">Profil</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            icon="person-outline"
            title="Profil için giriş yapın"
            description="Çocuk profillerinizi yönetin ve hesap ayarlarınıza erişin"
          />
          <Button onPress={() => router.push('/(auth)/login')} className="mt-4 w-full">
            Giriş Yap
          </Button>
          <TouchableOpacity
            className="mt-3"
            onPress={() => router.push('/(auth)/register')}
          >
            <Text className="text-primary text-sm font-medium">
              Hesap Oluştur →
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      icon: 'person-outline' as const,
      label: 'Profil Düzenle',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline' as const,
      label: 'Bildirimler',
      onPress: () => {},
    },
    {
      icon: 'book-outline' as const,
      label: 'Blog & Keşfet',
      onPress: () => router.push('/blog'),
    },
    {
      icon: 'medical-outline' as const,
      label: 'Aşı Takvimi',
      onPress: () => router.push('/vaccines'),
    },
    {
      icon: 'nutrition-outline' as const,
      label: 'Beslenme Rehberi',
      onPress: () => router.push('/ingredient'),
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'Güvenlik Kontrolü',
      onPress: () => {},
    },
    {
      icon: 'information-circle-outline' as const,
      label: 'Hakkında',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline' as const,
      label: 'Yardım & Destek',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-light">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary px-5 pt-6 pb-10">
          <Text className="text-white text-xl font-bold mb-4">Profil</Text>
          <View className="flex-row items-center">
            <Avatar
              uri={user?.avatar_url}
              name={user?.name}
              size={64}
            />
            <View className="ml-4">
              <Text className="text-white text-xl font-bold">
                {user?.name ?? 'Kullanıcı'}
              </Text>
              <Text className="text-white/70 text-sm">{user?.email}</Text>
            </View>
          </View>
        </View>

        <View className="px-4 -mt-4">
          {/* Children Section */}
          <Card className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-dark font-bold text-base">
                Çocuk Profilleri
              </Text>
              <TouchableOpacity className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <Ionicons name="add" size={18} color="#FF8A65" />
              </TouchableOpacity>
            </View>

            {loadingChildren ? (
              <LoadingSpinner size="small" />
            ) : children && children.length > 0 ? (
              children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  onPress={() => setActiveChild(child)}
                  className={`flex-row items-center py-3 border-b border-gray-50 last:border-0 ${
                    activeChild?.id === child.id ? 'opacity-100' : 'opacity-80'
                  }`}
                >
                  <Avatar
                    uri={child.avatar_url}
                    name={child.name}
                    size={40}
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-dark font-medium">{child.name}</Text>
                    <Text className="text-gray-400 text-xs">
                      {formatAge(child.birth_date)}
                    </Text>
                  </View>
                  {activeChild?.id === child.id ? (
                    <Badge variant="secondary" size="sm">Aktif</Badge>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-4 items-center">
                <Text className="text-gray-400 text-sm mb-2">
                  Henüz çocuk profili eklenmedi
                </Text>
                <Button variant="outline" size="sm">
                  + Profil Ekle
                </Button>
              </View>
            )}
          </Card>

          {/* Menu Items */}
          <Card className="mb-4">
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                className={`flex-row items-center py-3.5 ${
                  idx < menuItems.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Ionicons name={item.icon} size={18} color="#FF8A65" />
                </View>
                <Text className="text-dark flex-1 text-sm">{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </Card>

          {/* Logout */}
          <Button
            variant="danger"
            onPress={handleLogout}
            isLoading={isLoggingOut}
            className="mb-8"
          >
            Çıkış Yap
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
