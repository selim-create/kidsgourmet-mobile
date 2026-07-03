import React, { useState, useEffect } from 'react';
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

function isValidHttpUrl(value?: string | null): value is string {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

export function Avatar({ uri, name, size = 40, className }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const style = { width: size, height: size, borderRadius: size / 2 };
  const fontSize = Math.floor(size * 0.4);

  // Only treat http/https URIs as valid to prevent native crashes from corrupt
  // or file-scheme cache entries on physical iOS devices.
  const validUri = isValidHttpUrl(uri) ? uri : null;

  // Reset error state when uri changes (e.g. signed URL refresh)
  useEffect(() => {
    setErrored(false);
  }, [uri]);

  if (validUri && !errored) {
    return (
      <Image
        source={{ uri: validUri }}
        style={style}
        className={`bg-gray-200 ${className ?? ''}`}
        contentFit="cover"
        onError={() => setErrored(true)}
        // Use memory-only cache to avoid corrupt disk-cached PNG entries that
        // trigger native XMP-metadata parsing crashes on physical iOS devices.
        cachePolicy="memory"
        // recyclingKey forces expo-image to discard stale image instances when
        // the source URI changes (e.g. signed-URL refresh), preventing
        // use-after-free / SIGSEGV on the TurboModules thread.
        recyclingKey={validUri}
        transition={150}
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
