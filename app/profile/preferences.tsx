import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [newsletter, setNewsletter] = useState(true);
  const [recipeNotifications, setRecipeNotifications] = useState(false);

  const handleToggle = (key: string, value: boolean) => {
    Toast.show({
      type: 'info',
      text1: 'Yakında',
      text2: 'Bu özellik yakında aktif olacak.',
    });
    if (key === 'newsletter') setNewsletter(value);
    if (key === 'recipeNotifications') setRecipeNotifications(value);
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
          <Text className="text-dark font-bold text-lg flex-1">Tercihler</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Notification settings */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <View className="px-4 py-3 border-b border-gray-50">
            <Text className="text-dark font-bold text-base">Bildirimler</Text>
          </View>

          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-50">
            <View className="flex-1 mr-4">
              <Text className="text-dark font-medium text-sm">
                Periyodik Bülten (E-Posta)
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Haftalık tarifler ve içerikler
              </Text>
            </View>
            <Switch
              value={newsletter}
              onValueChange={(v) => handleToggle('newsletter', v)}
              trackColor={{ false: '#E5E7EB', true: '#FF8A65' }}
              thumbColor="#fff"
            />
          </View>

          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-1 mr-4">
              <Text className="text-dark font-medium text-sm">
                Yeni Tarif Bildirimleri
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Yaşa uygun yeni tarifler eklendiğinde
              </Text>
            </View>
            <Switch
              value={recipeNotifications}
              onValueChange={(v) => handleToggle('recipeNotifications', v)}
              trackColor={{ false: '#E5E7EB', true: '#FF8A65' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
