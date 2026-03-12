import React from 'react';
import { Text, View } from 'react-native';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'purple'
  | 'gray';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  primary: { container: 'bg-primary/20', text: 'text-primary' },
  secondary: { container: 'bg-secondary/30', text: 'text-secondary-dark' },
  success: { container: 'bg-success/20', text: 'text-success' },
  warning: { container: 'bg-warning/20', text: 'text-warning' },
  info: { container: 'bg-info/20', text: 'text-info' },
  purple: { container: 'bg-purple/20', text: 'text-purple' },
  gray: { container: 'bg-gray-100', text: 'text-gray-600' },
};

const sizeStyles: Record<BadgeSize, { container: string; text: string }> = {
  sm: { container: 'px-2 py-0.5 rounded-full', text: 'text-xs' },
  md: { container: 'px-3 py-1 rounded-full', text: 'text-sm' },
};

export function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  className,
}: BadgeProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <View className={`${vs.container} ${ss.container} ${className ?? ''}`}>
      <Text className={`${vs.text} ${ss.text} font-medium`}>{children}</Text>
    </View>
  );
}
