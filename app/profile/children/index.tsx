import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useSWR from 'swr';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { getChildren, deleteChild } from '../../../src/services/user-service';
import { useActiveChild } from '../../../src/contexts/ActiveChildContext';
import { Avatar } from '../../../src/components/ui/Avatar';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { formatAge } from '../../../src/utils/ageFormatter';
import { API_ENDPOINTS } from '../../../src/lib/constants';

export default function ChildrenListScreen() {
  const insets = useSafeAreaInsets();
  const { activeChild, setActiveChild, reloadChildren } = useActiveChild();

  const {
    data: children,
    isLoading,
    mutate,
  } = useSWR(API_ENDPOINTS.CHILDREN, () => getChildren());

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Çocuğu Sil',
      `${name} profilini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChild(id);
              await reloadChildren();
              await mutate();
              Toast.show({ type: 'success', text1: `${name} silindi` });
            } catch {
              Toast.show({ type: 'error', text1: 'Silme işlemi başarısız' });
            }
          },
        },
      ],
    );
  };

  const handleSetActive = (child: NonNullable<typeof children>[number]) => {
    setActiveChild(child);
    Toast.show({
      type: 'success',
      text1: `${child.name} aktif çocuk seçildi`,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-100"
      >
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#455A64" />
          </TouchableOpacity>
          <Text className="text-dark font-bold text-lg flex-1">Çocuklarım</Text>
          <TouchableOpacity
            onPress={() => router.push('/profile/children/new')}
            className="bg-primary/10 rounded-xl px-3 py-1.5 flex-row items-center gap-1"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color="#FF8A65" />
            <Text className="text-primary text-sm font-medium">Yeni Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          {children && children.length > 0 ? (
            <>
              {children.map((child) => {
                const isActive = activeChild?.id === child.id;
                const allergens = child.allergens ?? child.allergies ?? [];
                return (
                  <TouchableOpacity
                    key={child.id}
                    onPress={() => handleSetActive(child)}
                    activeOpacity={0.8}
                    style={{
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? '#FF8A65' : '#F3F4F6',
                      borderRadius: 16,
                      backgroundColor: '#fff',
                      marginBottom: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <View className="flex-row items-center px-4 py-3">
                      <Avatar
                        uri={child.avatar_url}
                        name={child.name}
                        size={44}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-dark font-semibold text-base">
                          {child.name}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {formatAge(child.birth_date)}
                        </Text>
                      </View>
                      {isActive && (
                        <View className="mr-3 bg-primary/10 rounded-full px-2 py-0.5">
                          <Text className="text-primary text-xs font-medium">
                            Aktif
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/profile/children/${child.id}/edit`)
                        }
                        className="p-2 mr-1"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(child.id, child.name)}
                        className="p-2"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                    {allergens.length > 0 && (
                      <View className="px-4 pb-3 flex-row flex-wrap gap-1">
                        {allergens.map((a) => (
                          <View
                            key={a}
                            className="bg-warning/10 rounded-full px-2 py-0.5"
                          >
                            <Text className="text-warning text-xs">{a}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          ) : (
            <View className="items-center py-12">
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text className="text-dark font-bold text-lg mt-4 mb-2">
                Henüz çocuk eklenmedi
              </Text>
              <Text className="text-gray-400 text-sm text-center mb-6">
                İlk çocuğunuzun profilini oluşturun
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/profile/children/new')}
                className="bg-primary px-6 py-3 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">
                  İlk Çocuğu Ekle
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add new child card */}
          {children && children.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/profile/children/new')}
              style={{
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: '#D1D5DB',
                borderRadius: 16,
                backgroundColor: '#fff',
                padding: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={22} color="#9CA3AF" />
              <Text className="text-gray-400 font-medium">
                + Yeni Çocuk Ekle
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
