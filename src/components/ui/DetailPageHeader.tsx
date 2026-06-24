import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';

interface DetailPageHeaderProps {
  title: string;
  onBack?: () => void;
  backgroundColor?: string;
  textColor?: string;
  showHomeButton?: boolean;
}

export function DetailPageHeader({
  title,
  onBack,
  backgroundColor = '#fff',
  textColor = COLORS.dark,
  showHomeButton = true,
}: DetailPageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>

        {showHomeButton ? (
          // Tab dışı ekranlardan ana sayfaya tek dokunuşla dönüş.
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={22} color={textColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});
