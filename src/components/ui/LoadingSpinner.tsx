import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#FF8A65',
  label,
  fullScreen = false,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-light">
        <ActivityIndicator size={size} color={color} />
        {label ? (
          <Text className="mt-3 text-gray-500 text-sm">{label}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color={color} />
      {label ? (
        <Text className="mt-2 text-gray-500 text-sm">{label}</Text>
      ) : null}
    </View>
  );
}
