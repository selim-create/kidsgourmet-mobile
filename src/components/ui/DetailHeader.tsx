import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../lib/constants';

interface DetailHeaderProps {
  onShare?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  transparent?: boolean;
}

export function DetailHeader({
  onShare,
  onFavorite,
  isFavorited = false,
  transparent = false,
}: DetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const buttonBg = transparent ? 'rgba(0,0,0,0.4)' : '#FFFFFF';
  const iconColor = transparent ? '#FFFFFF' : COLORS.dark;

  return (
    <View
      style={[
        styles.container,
        { top: insets.top + 8 },
      ]}
    >
      {/* Back button */}
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.button, { backgroundColor: buttonBg }]}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={22} color={iconColor} />
      </TouchableOpacity>

      {/* Right buttons */}
      {(onShare || onFavorite) && (
        <View style={styles.rightGroup}>
          {onFavorite && (
            <TouchableOpacity
              onPress={onFavorite}
              style={[styles.button, { backgroundColor: buttonBg }]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorited ? '#EF4444' : iconColor}
              />
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              onPress={onShare}
              style={[styles.button, { backgroundColor: buttonBg }]}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={22} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rightGroup: {
    flexDirection: 'row',
    gap: 8,
  },
});
