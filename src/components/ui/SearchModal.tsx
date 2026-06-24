import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  'Avokado',
  'BLW tarifleri',
  'Kahvaltı',
  'Çorba',
  '+6 ay',
  'Parmak yiyecekler',
];

const QUICK_LINKS = [
  {
    label: 'Tarifler',
    route: '/(tabs)/recipes' as const,
    icon: 'restaurant-outline' as const,
    color: COLORS.primary,
    bg: '#FFF0E8',
  },
  {
    label: 'Beslenme Rehberi',
    route: '/(tabs)/guide' as const,
    icon: 'leaf-outline' as const,
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  {
    label: 'Keşfet',
    route: '/(tabs)/discover' as const,
    icon: 'compass-outline' as const,
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    label: 'Topluluk',
    route: '/(tabs)/topluluk' as const,
    icon: 'people-outline' as const,
    color: '#DB2777',
    bg: '#FCE7F3',
  },
] as const;

export function SearchModal({ visible, onClose }: SearchModalProps) {
  const [term, setTerm] = useState('');

  const handleSubmit = () => {
    const q = term.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setTerm('');
    onClose();
  };

  const handlePopularPress = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setTerm('');
    onClose();
  };

  const handleQuickLink = (route: string) => {
    router.push(route as any);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
        activeOpacity={1}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
      >
        <View className="bg-white rounded-t-3xl pt-4 pb-8 px-5">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-dark text-lg font-bold">Arama</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4 mb-5">
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              value={term}
              onChangeText={setTerm}
              onSubmitEditing={handleSubmit}
              placeholder="Tarif, malzeme veya blog yazısı arayın..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 py-3 text-dark"
              returnKeyType="search"
              autoFocus
            />
            {term.length > 0 && (
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
                className="bg-primary rounded-xl px-3 py-1.5"
              >
                <Text className="text-white text-sm font-semibold">Ara</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Popular Searches */}
          <Text className="text-dark font-bold text-sm mb-3">Popüler Aramalar</Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {POPULAR_SEARCHES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => handlePopularPress(s)}
                activeOpacity={0.8}
                className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2"
              >
                <Text className="text-dark text-sm">{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Access */}
          <Text className="text-dark font-bold text-sm mb-3">Hızlı Erişim</Text>
          <View className="flex-row flex-wrap gap-3">
            {QUICK_LINKS.map((link) => (
              <TouchableOpacity
                key={link.label}
                onPress={() => handleQuickLink(link.route)}
                activeOpacity={0.8}
                className="flex-1 items-center rounded-2xl py-3 px-2"
                style={{ backgroundColor: link.bg, minWidth: '44%' }}
              >
                <Ionicons name={link.icon} size={22} color={link.color} />
                <Text className="text-sm font-semibold mt-1" style={{ color: link.color }}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
