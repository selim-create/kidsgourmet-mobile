import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { useFoodIntroduction } from '../../src/hooks/useFoodIntroduction';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Badge } from '../../src/components/ui/Badge';
import { COLORS } from '../../src/lib/constants';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';

export default function FoodGuideScreen() {
  const { activeChild } = useActiveChild();
  const { items, isLoading, error } = useFoodIntroduction();

  const ageMonths = activeChild ? getAgeInMonths(activeChild.birth_date) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.primary,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            Ek Gıda Rehberi 🥣
          </Text>
        </View>
        {activeChild && (
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            {activeChild.name} için · {ageMonths} aylık
          </Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {!activeChild && (
          <View
            style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="information-circle-outline" size={20} color="#D97706" />
            <Text style={{ fontSize: 13, color: '#92400E', marginLeft: 10, flex: 1 }}>
              Kişiselleştirilmiş öneriler için profil sekmesinden çocuk ekleyin.
            </Text>
          </View>
        )}

        {isLoading ? (
          <LoadingSpinner label="Gıdalar yükleniyor..." />
        ) : error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Yüklenemedi"
            description="Gıda listesi yüklenirken hata oluştu."
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="leaf-outline"
            title="Henüz gıda yok"
            description="Yaşa uygun gıdalar yakında gösterilecek."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/ingredient/${item.id}`)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.07,
                  shadowRadius: 4,
                }}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 52, height: 52, borderRadius: 26 }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: '#D1FAE5',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>🥦</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>
                    {item.food_name}
                  </Text>
                  {item.category && (
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
                      {item.category}
                    </Text>
                  )}
                  {item.introduction_method && (
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>
                      {item.introduction_method}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {item.allergen_risk && (
                    <Badge
                      variant={item.allergen_risk === 'low' ? 'success' : item.allergen_risk === 'medium' ? 'warning' : 'warning'}
                      size="sm"
                    >
                      {item.allergen_risk === 'low' ? 'Düşük' : item.allergen_risk === 'medium' ? 'Orta' : 'Yüksek'}
                    </Badge>
                  )}
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
