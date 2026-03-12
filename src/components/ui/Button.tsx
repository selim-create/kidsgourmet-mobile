import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-secondary',
    text: 'text-dark font-semibold',
  },
  outline: {
    container: 'bg-transparent border border-primary',
    text: 'text-primary font-semibold',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary font-semibold',
  },
  danger: {
    container: 'bg-warning',
    text: 'text-white font-semibold',
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: {
    container: 'px-3 py-1.5 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-5 py-3 rounded-xl',
    text: 'text-base',
  },
  lg: {
    container: 'px-7 py-4 rounded-2xl',
    text: 'text-lg',
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const disabledStyle = disabled || isLoading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${vs.container} ${ss.container} ${disabledStyle} ${className ?? ''}`}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#FF8A65' : '#fff'}
        />
      ) : (
        <Text className={`${vs.text} ${ss.text}`}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}
