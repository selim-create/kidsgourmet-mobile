import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGrowthData } from '../../src/hooks/useGrowthData';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { addGrowthRecord } from '../../src/services/growth-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { COLORS } from '../../src/lib/constants';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';

export default function GrowthScreen() {
  const { activeChild } = useActiveChild();
  const { growthData, isLoading, mutate } = useGrowthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const ageMonths = activeChild ? getAgeInMonths(activeChild.birth_date) : 0;
  const records = growthData?.records ?? [];
  const latest = growthData?.latest;
  const percentile = growthData?.percentile;

  const handleSave = async () => {
    if (!activeChild) return;
    const weightVal = parseFloat(weight);
    const heightVal = parseFloat(height);
    if (!weightVal && !heightVal) {
      Alert.alert('Hata', 'Lütfen en az bir ölçüm girin.');
      return;
    }
    setIsSaving(true);
    try {
      await addGrowthRecord({
        child_id: activeChild.id,
        date: new Date().toISOString().split('T')[0],
        weight_kg: weightVal || undefined,
        height_cm: heightVal || undefined,
      });
      setWeight('');
      setHeight('');
      setShowAddModal(false);
      await mutate();
    } catch {
      Alert.alert('Hata', 'Ölçüm kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EFF6FF' }}>
      <View
        style={{
          backgroundColor: '#2563EB',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
              Büyüme Takibi 📏
            </Text>
          </View>
          {activeChild && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowAddModal(true)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                Ölçüm Ekle
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {activeChild && (
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
            {activeChild.name} · {ageMonths} aylık
          </Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {!activeChild ? (
          <EmptyState
            icon="person-outline"
            title="Çocuk profili gerekli"
            description="Büyüme takibi için profil sekmesinden çocuk ekleyin."
            actionLabel="Profil Ekle"
            onAction={() => router.push('/(tabs)/profile')}
          />
        ) : isLoading ? (
          <LoadingSpinner label="Veriler yükleniyor..." />
        ) : (
          <View>
            {/* Summary cards */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  padding: 14,
                  alignItems: 'center',
                  elevation: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                }}
              >
                <Text style={{ fontSize: 22 }}>⚖️</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E3A8A', marginTop: 4 }}>
                  {latest?.weight_kg ? `${latest.weight_kg}` : '—'}
                </Text>
                <Text style={{ fontSize: 11, color: '#6B7280' }}>kg</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  padding: 14,
                  alignItems: 'center',
                  elevation: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                }}
              >
                <Text style={{ fontSize: 22 }}>📏</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E3A8A', marginTop: 4 }}>
                  {latest?.height_cm ? `${latest.height_cm}` : '—'}
                </Text>
                <Text style={{ fontSize: 11, color: '#6B7280' }}>cm</Text>
              </View>
              {percentile?.weight_percentile !== undefined && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: '#DBEAFE',
                    borderRadius: 14,
                    padding: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>📊</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E3A8A', marginTop: 4 }}>
                    %{percentile.weight_percentile}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#3B82F6' }}>persentil</Text>
                </View>
              )}
            </View>

            {/* Records list */}
            {records.length > 0 ? (
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E3A8A', marginBottom: 10 }}>
                  Ölçüm Geçmişi
                </Text>
                <View style={{ gap: 8 }}>
                  {records.slice().reverse().map((record, idx) => (
                    <View
                      key={record.id ?? idx}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        elevation: 1,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: '#DBEAFE',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="analytics-outline" size={18} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{record.date}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', marginTop: 1 }}>
                          {record.weight_kg ? `${record.weight_kg} kg` : ''}
                          {record.weight_kg && record.height_cm ? ' · ' : ''}
                          {record.height_cm ? `${record.height_cm} cm` : ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <EmptyState
                icon="analytics-outline"
                title="Henüz ölçüm yok"
                description="Sağ üstteki 'Ölçüm Ekle' butonuyla ilk kaydı girin."
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Add measurement modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 36,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
                Yeni Ölçüm Ekle
              </Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>Kilo (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="Örn: 7.5"
              placeholderTextColor="#9CA3AF"
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: '#1F2937',
                marginBottom: 14,
              }}
            />
            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>Boy (cm)</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="Örn: 65.0"
              placeholderTextColor="#9CA3AF"
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: '#1F2937',
                marginBottom: 20,
              }}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: '#2563EB',
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              {isSaving ? (
                <Ionicons name="hourglass-outline" size={18} color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
