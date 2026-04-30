import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/contexts/AuthContext';
import { updateUserProfile } from '../../src/services/user-service';
import type { SocialLinks } from '../../src/lib/types';

const SOCIAL_FIELDS: {
  key: keyof SocialLinks;
  label: string;
  icon: string;
  placeholder: string;
}[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: 'logo-instagram',
    placeholder: 'https://instagram.com/kullanici',
  },
  {
    key: 'twitter',
    label: 'X / Twitter',
    icon: 'logo-twitter',
    placeholder: 'https://x.com/kullanici',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: 'logo-linkedin',
    placeholder: 'https://linkedin.com/in/kullanici',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: 'logo-youtube',
    placeholder: 'https://youtube.com/@kanal',
  },
  {
    key: 'website',
    label: 'Web Sitesi',
    icon: 'globe-outline',
    placeholder: 'https://siteniz.com',
  },
];

export default function ExpertScreen() {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();

  // Access control
  const isExpert =
    user?.is_expert ||
    ['administrator', 'editor', 'kg_expert'].includes(user?.role ?? '');

  useEffect(() => {
    if (user !== undefined && !isExpert) {
      router.replace('/(tabs)/profile');
    }
  }, [user, isExpert]);

  const [biography, setBiography] = useState(user?.biography ?? '');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertise, setExpertise] = useState<string[]>(user?.expertise ?? []);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(
    user?.social_links ?? {},
  );
  const [showEmail, setShowEmail] = useState(user?.show_email ?? false);
  const [saving, setSaving] = useState(false);

  if (!isExpert) {
    return null;
  }

  const addExpertise = () => {
    const tag = expertiseInput.trim();
    if (tag && !expertise.includes(tag)) {
      setExpertise([...expertise, tag]);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (tag: string) => {
    setExpertise(expertise.filter((e) => e !== tag));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        biography: biography.trim() || undefined,
        expertise,
        social_links: socialLinks,
        show_email: showEmail,
      });
      await refreshUser();
      Toast.show({ type: 'success', text1: 'Uzman profili güncellendi' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Güncelleme başarısız' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFBE6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-100"
      >
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#455A64" />
          </TouchableOpacity>
          <Text className="text-dark font-bold text-lg flex-1">
            Uzman Profili
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Uzmanlık Alanları */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-1.5 text-sm">
            Uzmanlık Alanları
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            {expertise.map((tag) => (
              <View
                key={tag}
                className="flex-row items-center bg-primary/10 rounded-full px-3 py-1.5"
              >
                <Text className="text-primary text-xs font-medium mr-1">
                  {tag}
                </Text>
                <TouchableOpacity onPress={() => removeExpertise(tag)}>
                  <Ionicons name="close" size={14} color="#FF8A65" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3">
              <TextInput
                value={expertiseInput}
                onChangeText={setExpertiseInput}
                placeholder="Uzmanlık alanı ekle..."
                placeholderTextColor="#9CA3AF"
                className="text-dark text-base"
                onSubmitEditing={addExpertise}
                returnKeyType="done"
              />
            </View>
            <TouchableOpacity
              onPress={addExpertise}
              className="bg-primary rounded-xl px-4 items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Biyografi */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-1.5 text-sm">Biyografi</Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <TextInput
              value={biography}
              onChangeText={setBiography}
              placeholder="Kendinizi tanıtın..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              className="text-dark text-base"
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </View>
        </View>

        {/* Sosyal Medya */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-2 text-sm">Sosyal Medya</Text>
          {SOCIAL_FIELDS.map((field) => (
            <View key={field.key} className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <Ionicons
                  name={field.icon as 'globe-outline'}
                  size={20}
                  color="#6B7280"
                />
              </View>
              <View className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
                <TextInput
                  value={socialLinks[field.key] ?? ''}
                  onChangeText={(v) =>
                    setSocialLinks({ ...socialLinks, [field.key]: v })
                  }
                  placeholder={field.placeholder}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="url"
                  className="text-dark text-sm"
                />
              </View>
            </View>
          ))}
        </View>

        {/* E-posta görünürlüğü */}
        <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center justify-between mb-4 shadow-sm">
          <View className="flex-1 mr-4">
            <Text className="text-dark font-medium text-sm">
              E-posta Görünürlüğü
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              Profilinizdeki e-posta adresinizi herkese göster
            </Text>
          </View>
          <Switch
            value={showEmail}
            onValueChange={setShowEmail}
            trackColor={{ false: '#E5E7EB', true: '#FF8A65' }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3"
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`py-3.5 rounded-xl items-center ${
            saving ? 'bg-gray-200' : 'bg-primary'
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`font-semibold text-base ${
              saving ? 'text-gray-400' : 'text-white'
            }`}
          >
            {saving ? 'Kaydediliyor...' : 'Uzman Profilini Güncelle'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
