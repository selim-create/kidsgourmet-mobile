import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'search-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name={icon} size={36} color="#9CA3AF" />
      </View>
      <Text className="text-dark text-xl font-semibold text-center mb-2">
        {title}
      </Text>
      {description ? (
        <Text className="text-gray-400 text-base text-center mb-6">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button onPress={onAction}>{actionLabel}</Button>
      ) : null}
    </View>
  );
}
