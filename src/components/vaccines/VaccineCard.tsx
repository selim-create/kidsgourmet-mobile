import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatAgeMonths } from '../../utils/ageFormatter';
import type { Vaccine } from '../../lib/types';

interface VaccineCardProps {
  vaccine: Vaccine;
  /** ISO date string when this vaccine was administered, if any */
  administeredAt?: string;
  /** Whether the vaccine is overdue */
  overdue?: boolean;
  onMarkDone?: (vaccineId: number) => void;
}

export function VaccineCard({
  vaccine,
  administeredAt,
  overdue = false,
  onMarkDone,
}: VaccineCardProps) {
  const isDone = Boolean(administeredAt);

  const statusColor = isDone ? '#16A34A' : overdue ? '#DC2626' : '#6B7280';
  const statusBg = isDone ? '#DCFCE7' : overdue ? '#FEE2E2' : '#F3F4F6';
  const statusLabel = isDone ? 'Yapıldı' : overdue ? 'Gecikmiş' : 'Bekliyor';
  const statusIcon: 'checkmark-circle' | 'alert-circle' | 'time' = isDone
    ? 'checkmark-circle'
    : overdue
    ? 'alert-circle'
    : 'time';

  const handleMarkDone = () => {
    Alert.alert(
      'Aşıyı Onayla',
      `"${vaccine.name}" aşısını yapıldı olarak işaretlemek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Yapıldı',
          onPress: () => onMarkDone?.(vaccine.id),
        },
      ],
    );
  };

  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row items-start">
        {/* Status icon */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5"
          style={{ backgroundColor: statusBg }}
        >
          <Ionicons name={statusIcon} size={20} color={statusColor} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-dark font-bold text-base flex-1 mr-2" numberOfLines={2}>
              {vaccine.name}
            </Text>
            {/* Status badge */}
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: statusBg }}
            >
              <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Meta info */}
          <View className="flex-row flex-wrap gap-2 mt-2">
            {vaccine.recommended_age_months !== undefined && (
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs ml-1">
                  Önerilen: {formatAgeMonths(vaccine.recommended_age_months)}
                </Text>
              </View>
            )}

            {vaccine.doses && vaccine.doses > 1 && (
              <View className="flex-row items-center">
                <Ionicons name="layers-outline" size={12} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs ml-1">{vaccine.doses} doz</Text>
              </View>
            )}

            {vaccine.is_mandatory && (
              <View className="bg-red-50 rounded-full px-2 py-0.5">
                <Text className="text-red-500 text-xs font-medium">Zorunlu</Text>
              </View>
            )}
          </View>

          {vaccine.description ? (
            <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>
              {vaccine.description}
            </Text>
          ) : null}

          {administeredAt ? (
            <Text className="text-green-600 text-xs mt-1">
              ✅ {new Date(administeredAt).toLocaleDateString('tr-TR')} tarihinde yapıldı
            </Text>
          ) : null}
        </View>
      </View>

      {/* Mark Done button */}
      {!isDone && onMarkDone && (
        <TouchableOpacity
          onPress={handleMarkDone}
          activeOpacity={0.8}
          className="mt-3 border border-primary rounded-xl py-2 items-center"
        >
          <Text className="text-primary text-sm font-semibold">✓ Yapıldı Olarak İşaretle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
