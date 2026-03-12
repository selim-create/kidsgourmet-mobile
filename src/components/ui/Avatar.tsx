import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ uri, name, size = 40, className }: AvatarProps) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  const fontSize = Math.floor(size * 0.4);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={style}
        className={`bg-gray-200 ${className ?? ''}`}
        contentFit="cover"
      />
    );
  }

  if (name) {
    return (
      <View
        style={style}
        className={`bg-primary items-center justify-center ${className ?? ''}`}
      >
        <Text style={{ fontSize, color: '#fff', fontWeight: '600' }}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={style}
      className={`bg-gray-200 items-center justify-center ${className ?? ''}`}
    >
      <Ionicons name="person" size={size * 0.5} color="#9CA3AF" />
    </View>
  );
}
