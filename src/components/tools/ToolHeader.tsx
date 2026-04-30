import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon } from '../ui/Icon';

interface ToolHeaderProps {
  title: string;
  onBack?: () => void;
}

export function ToolHeader({ title, onBack }: ToolHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-white border-b border-gray-100"
    >
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
        >
          <Icon name="arrow-left" size={16} color="#475569" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-dark" numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}
