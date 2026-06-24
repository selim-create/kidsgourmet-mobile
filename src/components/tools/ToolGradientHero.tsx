import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../ui/Icon';
import type { IconProps } from '../ui/Icon';

interface ToolGradientHeroProps {
  iconName: IconProps['name'];
  iconColor: string;
  gradientColors: [string, string, ...string[]];
  title: string;
  subtitle: string;
}

export function ToolGradientHero({
  iconName,
  iconColor,
  gradientColors,
  title,
  subtitle,
}: ToolGradientHeroProps) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-6 pt-8 pb-10"
    >
      <View className="items-center">
        <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
          <Icon name={iconName} size={32} color={iconColor} />
        </View>
        <View className="w-full items-center px-2">
          <Text className="text-2xl font-bold text-white mb-2 text-center" style={{ maxWidth: 320 }}>
            {title}
          </Text>
          <Text className="text-white/80 text-sm leading-5 text-center pb-1" style={{ maxWidth: 320 }}>
            {subtitle}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
