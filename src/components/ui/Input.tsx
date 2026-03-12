import React, { forwardRef } from 'react';
import {
  TextInput,
  Text,
  View,
  type TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  function Input(
    { label, error, hint, leftIcon, rightIcon, className, ...props },
    ref,
  ) {
    return (
      <View className="w-full mb-4">
        {label ? (
          <Text className="text-dark font-medium mb-1.5 text-sm">{label}</Text>
        ) : null}

        <View
          className={`flex-row items-center bg-white border rounded-xl px-4 py-3 ${
            error ? 'border-warning' : 'border-gray-200'
          }`}
        >
          {leftIcon ? (
            <View className="mr-2">{leftIcon}</View>
          ) : null}

          <TextInput
            ref={ref}
            className={`flex-1 text-dark text-base ${className ?? ''}`}
            placeholderTextColor="#9CA3AF"
            {...props}
          />

          {rightIcon ? (
            <View className="ml-2">{rightIcon}</View>
          ) : null}
        </View>

        {error ? (
          <Text className="text-warning text-xs mt-1">{error}</Text>
        ) : hint ? (
          <Text className="text-gray-400 text-xs mt-1">{hint}</Text>
        ) : null}
      </View>
    );
  },
);
