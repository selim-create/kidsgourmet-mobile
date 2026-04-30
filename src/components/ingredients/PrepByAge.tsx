import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';

interface PrepAgeItem {
  age?: string;
  age_range?: string;
  texture?: string;
  consistency?: string;
  method?: string;
  preparation?: string;
  portion?: string;
  notes?: string;
  cautions?: string;
  tip?: string;
}

interface PrepByAgeProps {
  items: PrepAgeItem[] | any[];
}

function AgeCard({ item, index }: { item: PrepAgeItem; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const ageLabel = item.age ?? item.age_range ?? `${index + 1}. Dönem`;
  const texture = item.texture ?? item.consistency;
  const method = item.method ?? item.preparation;
  const notes = item.notes ?? item.cautions ?? item.tip;

  // Pastel background colors cycling through green shades
  const bgColors = ['#F0FDF4', '#ECFDF5', '#F0FFF4'];
  const borderColors = ['#86EFAC', '#6EE7B7', '#A7F3D0'];
  const bg = bgColors[index % bgColors.length];
  const border = borderColors[index % borderColors.length];

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      {/* Accordion header */}
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.75}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.dark }}>
          {ageLabel}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded ? (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8 }}>
          {texture ? (
            <Row icon="layers-outline" label="Doku / Kıvam" value={texture} />
          ) : null}
          {method ? (
            <Row icon="construct-outline" label="Hazırlama" value={method} />
          ) : null}
          {item.portion ? (
            <Row icon="scale-outline" label="Porsiyon" value={item.portion} />
          ) : null}
          {notes ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Ionicons name="information-circle-outline" size={16} color="#D97706" style={{ marginRight: 6, marginTop: 1 }} />
              <Text style={{ flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 }}>
                {notes}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Row({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <Ionicons name={icon} size={14} color={COLORS.primary} style={{ marginRight: 6, marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: 1 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.dark, lineHeight: 18 }}>{value}</Text>
      </View>
    </View>
  );
}

export function PrepByAge({ items }: PrepByAgeProps) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <View>
      {items.map((item, idx) => (
        <AgeCard key={idx} item={item as PrepAgeItem} index={idx} />
      ))}
    </View>
  );
}
