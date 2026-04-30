import React from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { uploadChildAvatar } from '../../services/user-service';
import Toast from 'react-native-toast-message';

interface ChildAvatarPickerProps {
  childId?: number;
  currentUrl?: string | null;
  name: string;
  size?: number;
  onChange: (url: string) => void;
}

export function ChildAvatarPicker({
  childId,
  currentUrl,
  name,
  size = 80,
  onChange,
}: ChildAvatarPickerProps) {
  const [uploading, setUploading] = React.useState(false);
  const [localUri, setLocalUri] = React.useState<string | null>(null);

  const displayUri = localUri ?? currentUrl;

  const pickImage = async (useCamera: boolean) => {
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

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const uri = asset.uri;

      if (!childId) {
        // No child ID yet — return local URI to parent
        setLocalUri(uri);
        onChange(uri);
        return;
      }

      // Upload immediately
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'avatar.jpg',
      } as unknown as Blob);

      const updated = await uploadChildAvatar(childId, formData);
      const newUrl = updated.avatar_url ?? uri;
      setLocalUri(newUrl);
      onChange(newUrl);
      Toast.show({ type: 'success', text1: 'Avatar güncellendi' });
    } catch {
      Toast.show({ type: 'error', text1: 'Avatar yüklenemedi' });
    } finally {
      setUploading(false);
    }
  };

  const showOptions = () => {
    Alert.alert('Fotoğraf Seç', undefined, [
      { text: 'Galeri\'den Seç', onPress: () => pickImage(false) },
      { text: 'Fotoğraf Çek', onPress: () => pickImage(true) },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity onPress={showOptions} activeOpacity={0.8}>
      <View style={{ position: 'relative', width: size, height: size }}>
        <Avatar uri={displayUri} name={name} size={size} />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: '#FF8A65',
            borderRadius: 12,
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="camera" size={14} color="#fff" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
