import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type ParentRole = 'Anne' | 'Baba' | 'Bakıcı' | 'Diğer';

interface ParentRolePickerProps {
  value?: string;
  onChange: (role: ParentRole) => void;
}

const ROLES: ParentRole[] = ['Anne', 'Baba', 'Bakıcı', 'Diğer'];

export function ParentRolePicker({ value, onChange }: ParentRolePickerProps) {
  return (
    <View className="mb-4">
      <Text className="text-dark font-medium mb-1.5 text-sm">Ebeveyn Rolü</Text>
      <View className="flex-row gap-2 flex-wrap">
        {ROLES.map((role) => {
          const isSelected = value === role;
          return (
            <TouchableOpacity
              key={role}
              onPress={() => onChange(role)}
              className={`px-4 py-2 rounded-xl border ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-white' : 'text-dark'
                }`}
              >
                {role}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
