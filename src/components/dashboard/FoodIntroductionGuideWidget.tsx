import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';

interface FoodIntroductionGuideWidgetProps {
  ageMonths?: number;
}

interface AgeGuidanceItem {
  range: string;
  title: string;
  tips: string[];
  emoji: string;
}

const AGE_GUIDANCE: AgeGuidanceItem[] = [
  {
    range: '0-4',
    title: 'Sadece Anne Sütü',
    tips: ['Anne sütü en iyi besin', 'Ek gıdaya henüz hazır değil', '0-6 ay yalnız anne sütü önerilir'],
    emoji: '🍼',
  },
  {
    range: '4-6',
    title: 'Ek Gıdaya Hazırlık',
    tips: ['Kıvam takibi başlayabilir', 'BLW değerlendirmesi yapın', 'Hekimle görüşün'],
    emoji: '🥄',
  },
  {
    range: '6-8',
    title: 'İlk Ek Gıdalar',
    tips: ['Püreler ile başlayın', 'Tek malzemeli deneyin', 'Alerjen takibini yapın'],
    emoji: '🥦',
  },
  {
    range: '8-12',
    title: 'Daha Kalın Kıvamlar',
    tips: ['Ezilmiş/doğranmış yiyecekler', 'Aile sofrasına katılım', 'Parmak besinler deneyin'],
    emoji: '🍎',
  },
  {
    range: '12-24',
    title: 'Aile Yemekleri',
    tips: ['Tüm gıdalar (bal hariç)', 'Sofra alışkanlığı oluşturun', 'Renk çeşitliliğine dikkat edin'],
    emoji: '🍽️',
  },
  {
    range: '24+',
    title: 'Tam Diyet',
    tips: ['Dengeli tabak ilkesi', 'Porsiyon miktarlarına dikkat', 'Tatlı/tuzlu dengeyi koru'],
    emoji: '🌈',
  },
];

function getGuidanceForAge(ageMonths?: number): AgeGuidanceItem {
  if (ageMonths === undefined) return AGE_GUIDANCE[0];
  if (ageMonths < 4) return AGE_GUIDANCE[0];
  if (ageMonths < 6) return AGE_GUIDANCE[1];
  if (ageMonths < 8) return AGE_GUIDANCE[2];
  if (ageMonths < 12) return AGE_GUIDANCE[3];
  if (ageMonths < 24) return AGE_GUIDANCE[4];
  return AGE_GUIDANCE[5];
}

export function FoodIntroductionGuideWidget({ ageMonths }: FoodIntroductionGuideWidgetProps) {
  const guidance = getGuidanceForAge(ageMonths);

  return (
    <View
      style={{
        backgroundColor: '#FFF7ED',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FED7AA',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginRight: 8 }}>{guidance.emoji}</Text>
          {ageMonths !== undefined && (
            <Text style={{ fontSize: 11, color: '#C2410C', marginTop: 1 }}>
              {ageMonths} ay için öneri
            </Text>
          )}
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/guide')}
        >
          <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>
            Rehber →
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 12,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1C1917', marginBottom: 6 }}>
          {guidance.title}
        </Text>
        {guidance.tips.map((tip, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
            <Text style={{ color: COLORS.primary, marginRight: 6, fontSize: 13 }}>•</Text>
            <Text style={{ fontSize: 13, color: '#44403C', lineHeight: 18, flex: 1 }}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Age range chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6 }}
      >
        {AGE_GUIDANCE.map((g) => {
          const isActive = g.range === guidance.range;
          return (
            <View
              key={g.range}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
                backgroundColor: isActive ? COLORS.primary : '#F3F4F6',
                borderWidth: isActive ? 0 : 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isActive ? '#fff' : '#6B7280',
                }}
              >
                {g.range} ay
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
