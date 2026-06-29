import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../lib/constants';

import { AppIcon } from '../ui/AppIcon';
interface FaqItem {
  question?: string;
  q?: string;
  answer?: string;
  a?: string;
}

interface IngredientFAQProps {
  items: FaqItem[] | any[];
}

function FAQRow({ item, index }: { item: FaqItem; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const question = item.question ?? item.q ?? '';
  const answer = item.answer ?? item.a ?? '';

  if (!question) return null;

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}
    >
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.75}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 2,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: COLORS.primary + '18',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>
            {index + 1}
          </Text>
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.dark, lineHeight: 20 }}>
          {question}
        </Text>
        <AppIcon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#9CA3AF"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      {expanded && answer ? (
        <View style={{ paddingBottom: 14, paddingLeft: 34 }}>
          <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20 }}>
            {answer}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function IngredientFAQ({ items }: IngredientFAQProps) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <View>
      {items.map((item, idx) => (
        <FAQRow key={idx} item={item as FaqItem} index={idx} />
      ))}
    </View>
  );
}
