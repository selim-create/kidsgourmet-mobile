import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';

import { AppIcon } from '../ui/AppIcon';
type IoniconName = string;

interface QuickTool {
  icon: IoniconName;
  label: string;
  description: string;
  route: string;
  color: string;
  bg: string;
}

const QUICK_TOOLS: QuickTool[] = [
  {
    icon: 'chatbubble-ellipses-outline',
    label: 'Akıllı Asistan',
    description: 'Beslenme sorularını sor',
    route: '/(tabs)/assistant',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    icon: 'book-outline',
    label: 'Beslenme Rehberi',
    description: 'Yaşa göre rehber',
    route: '/(tabs)/guide',
    color: '#EA580C',
    bg: '#FFF7ED',
  },
  {
    icon: 'nutrition-outline',
    label: 'BLW Hazırlık',
    description: 'Katı gıdaya hazır mı?',
    route: '/blw-test',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: 'trending-up-outline',
    label: 'Büyüme Takibi',
    description: 'Persentil hesapla',
    route: '/growth',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: 'medical-outline',
    label: 'Aşı Takvimi',
    description: 'Aşı planınızı görün',
    route: '/vaccines',
    color: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    icon: 'cart-outline',
    label: 'Alışveriş Listesi',
    description: 'Market listenizi hazırlayın',
    route: '/shopping-list',
    color: '#16A34A',
    bg: '#F0FDF4',
  },
];

export function QuickToolsWidget() {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
          Hızlı Araçlar ⚡
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/assistant')}>
          <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>
            Tümü →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {QUICK_TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.label}
            activeOpacity={0.8}
            onPress={() => router.push(tool.route as Parameters<typeof router.push>[0])}
            style={{
              width: '47%',
              backgroundColor: tool.bg,
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(0,0,0,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name={tool.icon} size={18} color={tool.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2937' }} numberOfLines={1}>
                {tool.label}
              </Text>
              <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 1 }} numberOfLines={1}>
                {tool.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
