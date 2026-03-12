import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { COLORS } from '../../lib/constants';
import type { Child } from '../../lib/types';

interface ChildSwitcherProps {
  children: Child[];
  activeChild: Child | null;
  onSelect: (child: Child) => void;
}

export function ChildSwitcher({ children, activeChild, onSelect }: ChildSwitcherProps) {
  if (children.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 10 }}
    >
      {children.map((child) => {
        const isActive = activeChild?.id === child.id;
        return (
          <TouchableOpacity
            key={child.id}
            activeOpacity={0.8}
            onPress={() => onSelect(child)}
            style={{
              alignItems: 'center',
              gap: 4,
            }}
          >
            <View
              style={{
                borderWidth: 2,
                borderColor: isActive ? COLORS.primary : 'transparent',
                borderRadius: 999,
                padding: 2,
              }}
            >
              <Avatar uri={child.avatar_url} name={child.name} size={44} />
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: isActive ? '700' : '500',
                color: isActive ? COLORS.primary : COLORS.dark,
                maxWidth: 64,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {child.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
