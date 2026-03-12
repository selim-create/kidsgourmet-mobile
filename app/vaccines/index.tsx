import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVaccines } from '../../src/hooks/useVaccines';
import { VaccineCard } from '../../src/components/vaccines/VaccineCard';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { COLORS } from '../../src/lib/constants';
import { useSWRConfig } from 'swr';

export default function VaccineScreen() {
  const { vaccines, isLoading } = useVaccines();
  const safeVaccines = Array.isArray(vaccines) ? vaccines : [];
  const [administered, setAdministered] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const { mutate } = useSWRConfig();

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate(() => true, undefined, { revalidate: true });
    setRefreshing(false);
  };

  const handleMarkDone = (vaccineId: number) => {
    setAdministered((prev) => ({
      ...prev,
      [vaccineId]: new Date().toISOString(),
    }));
  };

  const total = safeVaccines.length;
  const done = safeVaccines.filter((v) => administered[v.id]).length;
  const pending = total - done;
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-light">
      {/* Header */}
      <View className="bg-primary px-4 pt-4 pb-10">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Aşı Takvimi</Text>
        </View>

        {/* Stats */}
        {!isLoading && total > 0 && (
          <View className="bg-white/20 rounded-2xl p-4">
            {/* Progress bar */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-semibold">Tamamlanma</Text>
              <Text className="text-white font-bold">%{completionPct}</Text>
            </View>
            <View className="h-2 bg-white/30 rounded-full overflow-hidden mb-3">
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${completionPct}%` }}
              />
            </View>

            {/* Stat pills */}
            <View className="flex-row gap-2">
              <View className="flex-1 bg-white/20 rounded-xl p-2 items-center">
                <Text className="text-white font-bold text-lg">{total}</Text>
                <Text className="text-white/70 text-xs">Toplam</Text>
              </View>
              <View className="flex-1 bg-white/20 rounded-xl p-2 items-center">
                <Text className="text-white font-bold text-lg">{done}</Text>
                <Text className="text-white/70 text-xs">Yapıldı</Text>
              </View>
              <View className="flex-1 bg-white/20 rounded-xl p-2 items-center">
                <Text className="text-white font-bold text-lg">{pending}</Text>
                <Text className="text-white/70 text-xs">Bekliyor</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 -mt-4"
        contentContainerStyle={{ padding: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {isLoading ? (
          <LoadingSpinner label="Aşı takvimi yükleniyor..." />
        ) : safeVaccines.length === 0 ? (
          <EmptyState
            icon="medical-outline"
            title="Aşı bilgisi bulunamadı"
            description="Aşı takvimi henüz yüklenemedi."
          />
        ) : (
          <>
            {/* Overdue warning */}
            {safeVaccines.some((v) => !administered[v.id]) && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 flex-row items-start">
                <Ionicons name="warning-outline" size={20} color="#CA8A04" />
                <View className="ml-2 flex-1">
                  <Text className="text-yellow-800 font-semibold text-sm">
                    Bekleyen aşılarınız var
                  </Text>
                  <Text className="text-yellow-700 text-xs mt-0.5">
                    Çocuğunuzun aşı takibini yapın ve zamanında yaptırın.
                  </Text>
                </View>
              </View>
            )}

            {safeVaccines.map((vaccine) => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                administeredAt={administered[vaccine.id]}
                onMarkDone={handleMarkDone}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
