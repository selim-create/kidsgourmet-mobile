import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/contexts/AuthContext';
import { Avatar } from '../../src/components/ui/Avatar';
import { ParentRolePicker } from '../../src/components/profile/ParentRolePicker';
import {
  updateUserProfile,
  uploadUserAvatar,
} from '../../src/services/user-service';
import type { ComponentProps } from 'react';
import type { SocialLinks } from '../../src/lib/types';

type Gender = 'male' | 'female' | 'other';
type IoniconName = ComponentProps<typeof Ionicons>['name'];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Kadın' },
  { value: 'male', label: 'Erkek' },
  { value: 'other', label: 'Diğer' },
];

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string; icon: IoniconName; isUrl?: boolean }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: '@kullanici_adi', icon: 'logo-instagram' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: '@kullanici_adi', icon: 'logo-twitter' },
  { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/sayfaniz', icon: 'logo-facebook' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/adsoyadiniz', icon: 'logo-linkedin' },
  { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@kanaliniz', icon: 'logo-youtube' },
  { key: 'website', label: 'Web Sitesi', placeholder: 'https://siteniz.com', icon: 'globe-outline', isUrl: true },
];

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [parentRole, setParentRole] = useState(user?.parent_role ?? '');
  const [gender, setGender] = useState<Gender | undefined>(user?.gender);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    user?.birth_date ? new Date(user.birth_date) : undefined,
  );
  const [biography, setBiography] = useState(user?.biography ?? '');
  const [showEmail, setShowEmail] = useState(user?.show_email ?? false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(user?.social_links ?? {});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar_url ?? null,
  );

  const handlePickAvatar = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({ type: 'error', text1: 'Kamera erişimi reddedildi' });
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({ type: 'error', text1: 'Galeri erişimi reddedildi' });
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setUploadingAvatar(true);
      const response = await uploadUserAvatar({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
      });
      setAvatarUrl(response.url);
      await refreshUser();
      Toast.show({ type: 'success', text1: 'Avatar güncellendi' });
    } catch {
      Toast.show({ type: 'error', text1: 'Avatar yüklenemedi' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const showAvatarOptions = () => {
    Alert.alert('Fotoğraf Seç', undefined, [
      { text: "Galeri'den Seç", onPress: () => handlePickAvatar(false) },
      { text: 'Fotoğraf Çek', onPress: () => handlePickAvatar(true) },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Ad zorunludur' });
      return;
    }
    setSaving(true);
    try {
      const cleanedSocialLinks: SocialLinks = Object.fromEntries(
        Object.entries(socialLinks)
          .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
          .filter(([, v]) => typeof v === 'string' && v !== ''),
      ) as SocialLinks;
      const payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        parent_role: parentRole || undefined,
        gender,
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
        biography: biography.trim() || undefined,
        show_email: showEmail,
        social_links: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : undefined,
      };
      if (password.trim()) {
        payload.password = password.trim();
      }
      await updateUserProfile(payload as Parameters<typeof updateUserProfile>[0]);
      await refreshUser();
      Toast.show({ type: 'success', text1: 'Profil güncellendi' });
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
            Profil Düzenle
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={showAvatarOptions}
            activeOpacity={0.8}
            disabled={uploadingAvatar}
          >
            <View style={{ position: 'relative' }}>
              <Avatar uri={avatarUrl} name={name} size={88} />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#FF8A65',
                  borderRadius: 14,
                  width: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
          {user?.username ? (
            <Text className="text-gray-400 text-sm mt-2">@{user.username}</Text>
          ) : null}
        </View>

        {/* Ad Soyad */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-1.5 text-sm">Ad Soyad</Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Adınız Soyadınız"
              placeholderTextColor="#9CA3AF"
              className="text-dark text-base"
            />
          </View>
        </View>

        {/* E-posta */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-1.5 text-sm">E-posta</Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e-posta@ornek.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="text-dark text-base"
            />
          </View>
        </View>

        {/* Ebeveyn Rolü */}
        <ParentRolePicker
          value={parentRole}
          onChange={(role) => setParentRole(role)}
        />

        {/* Cinsiyet */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-1.5 text-sm">Cinsiyet</Text>
          <View className="flex-row gap-2 flex-wrap">
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setGender(opt.value)}
                className={`px-4 py-2 rounded-xl border ${
                  gender === opt.value
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-200'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-medium ${
                    gender === opt.value ? 'text-white' : 'text-dark'
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Doğum Tarihi */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-1.5 text-sm">Doğum Tarihi</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={birthDate ?? new Date()}
              mode="date"
              display="spinner"
              locale="tr-TR"
              themeVariant="light"
              maximumDate={new Date()}
              onChange={(_, date) => date && setBirthDate(date)}
            />
          ) : (
            <>
              <TouchableOpacity
                className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-dark text-base">
                  {birthDate
                    ? birthDate.toLocaleDateString('tr-TR')
                    : 'Seçmek için tıklayın'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate ?? new Date()}
                  mode="date"
                  display="default"
                  locale="tr-TR"
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) setBirthDate(date);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Şifre Değiştir */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-1.5 text-sm">
            Yeni Şifre (opsiyonel)
          </Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Boş bırakırsanız değişmez"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              className="flex-1 text-dark text-base"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9CA3AF"
              />
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
              placeholder="Kendinizden kısaca bahsedin..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="text-dark text-base"
              style={{ minHeight: 80 }}
            />
          </View>
        </View>

        {/* E-posta Görünürlüğü */}
        <View className="mb-4 bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-dark font-medium text-sm">E-postamı göster</Text>
            <Text className="text-gray-400 text-xs mt-0.5">Profilinizde e-posta adresiniz görünsün</Text>
          </View>
          <Switch
            value={showEmail}
            onValueChange={setShowEmail}
            trackColor={{ false: '#E5E7EB', true: '#FF8A65' }}
            thumbColor="#fff"
          />
        </View>

        {/* Sosyal Linkler */}
        <View className="mb-4">
          <Text className="text-dark font-medium mb-2 text-sm">Sosyal Linkler</Text>
          <View className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {SOCIAL_FIELDS.map((field, index) => (
              <View
                key={field.key}
                className={`flex-row items-center px-4 py-3 ${
                  index < SOCIAL_FIELDS.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <Ionicons name={field.icon} size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                <TextInput
                  value={socialLinks[field.key] ?? ''}
                  onChangeText={(val) => {
                    setSocialLinks((prev) => {
                      const next = { ...prev };
                      if (val.trim()) {
                        next[field.key] = val;
                      } else {
                        delete next[field.key];
                      }
                      return next;
                    });
                  }}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType={field.isUrl ? 'url' : 'default'}
                  className="flex-1 text-dark text-sm"
                />
              </View>
            ))}
          </View>
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
            {saving ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
