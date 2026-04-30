import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import useSWR from 'swr';
import { ToolHeader } from '../../src/components/tools/ToolHeader';
import { ToolGradientHero } from '../../src/components/tools/ToolGradientHero';
import { Icon } from '../../src/components/ui/Icon';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import {
  getFoodTrials,
  createFoodTrial,
  updateFoodTrial,
  deleteFoodTrial,
  getFoodTrialSummary,
} from '../../src/services/tool-service';
import type { FoodTrial, FoodTrialInput, FoodTrialSummary } from '../../src/lib/types';
import { API_ENDPOINTS } from '../../src/lib/constants';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function displayDate(isoDate?: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts;
  return `${d}.${m}.${y}`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  FoodTrial['status'],
  { label: string; bg: string; text: string }
> = {
  planned: { label: 'Planlandı', bg: '#EFF6FF', text: '#1D4ED8' },
  in_progress: { label: 'Devam Ediyor', bg: '#FEF3C7', text: '#D97706' },
  completed: { label: 'Tamamlandı', bg: '#DCFCE7', text: '#15803D' },
  reaction: { label: 'Reaksiyon', bg: '#FEE2E2', text: '#DC2626' },
};

function StatusBadge({ status }: { status: FoodTrial['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.planned;
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '600', color: cfg.text }}>{cfg.label}</Text>
    </View>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: FoodTrialSummary }) {
  const cards = [
    { label: 'Toplam', value: summary.total, color: '#16A34A' },
    { label: 'Tamamlanan', value: summary.completed, color: '#15803D' },
    { label: 'Devam Eden', value: summary.in_progress, color: '#D97706' },
    { label: 'Reaksiyon', value: summary.reactions, color: '#DC2626' },
  ];
  return (
    <View className="flex-row flex-wrap px-4 pt-4 gap-3">
      {cards.map((card) => (
        <View
          key={card.label}
          className="flex-1 bg-white rounded-2xl p-3 border border-gray-100 items-center"
          style={{ minWidth: '40%' }}
        >
          <Text style={{ fontSize: 22, fontWeight: '700', color: card.color }}>{card.value}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">{card.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Food Trial Card ──────────────────────────────────────────────────────────

function FoodTrialCard({
  trial,
  onEdit,
  onDelete,
}: {
  trial: FoodTrial;
  onEdit: (trial: FoodTrial) => void;
  onDelete: (trial: FoodTrial) => void;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100 mx-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-2">
          <Text className="text-base font-bold text-dark" numberOfLines={1}>
            {trial.food_name}
          </Text>
          {trial.start_date ? (
            <View className="flex-row items-center gap-1 mt-0.5">
              <Icon name="calendar-days" size={12} color="#9CA3AF" />
              <Text className="text-xs text-gray-500">{displayDate(trial.start_date)}</Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => onEdit(trial)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-8 h-8 rounded-full bg-green-50 items-center justify-center"
          >
            <Icon name="pen" size={13} color="#16A34A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(trial)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
          >
            <Icon name="trash" size={13} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <StatusBadge status={trial.status} />

      {trial.reaction_type ? (
        <View className="flex-row items-center gap-1.5 mt-2">
          <Icon name="circle-exclamation" size={13} color="#DC2626" />
          <Text className="text-xs text-red-600">{trial.reaction_type}</Text>
        </View>
      ) : null}

      {trial.notes ? (
        <Text className="text-xs text-gray-500 mt-2 leading-4" numberOfLines={2}>
          {trial.notes}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  visible: boolean;
  trial: FoodTrial | null; // null = create mode
  childId?: number;
  onClose: () => void;
  onSaved: () => void;
}

function FormModal({ visible, trial, childId, onClose, onSaved }: FormModalProps) {
  const isEdit = !!trial;

  const [foodName, setFoodName] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Prefill when editing
  useEffect(() => {
    if (visible) {
      if (trial) {
        setFoodName(trial.food_name);
        setStartDate(trial.start_date ? new Date(trial.start_date) : new Date());
        setNotes(trial.notes ?? '');
      } else {
        setFoodName('');
        setStartDate(new Date());
        setNotes('');
      }
    }
  }, [visible, trial]);

  const handleSave = async () => {
    if (!foodName.trim()) {
      Toast.show({ type: 'error', text1: 'Besin adı zorunlu', text2: 'Lütfen bir besin adı girin.' });
      return;
    }
    if (!childId) {
      Toast.show({ type: 'error', text1: 'Çocuk seçilmedi', text2: 'Lütfen önce bir çocuk profili seçin.' });
      return;
    }

    const input: FoodTrialInput = {
      food_name: foodName.trim(),
      start_date: formatDateISO(startDate),
      notes: notes.trim() || undefined,
      child_id: childId,
    };

    setSubmitting(true);
    try {
      if (isEdit && trial) {
        await updateFoodTrial(trial.id, input);
        Toast.show({ type: 'success', text1: 'Güncellendi', text2: 'Besin denemesi güncellendi.' });
      } else {
        await createFoodTrial(input);
        Toast.show({ type: 'success', text1: 'Eklendi', text2: 'Yeni besin denemesi eklendi.' });
      }
      onSaved();
      onClose();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-5 pb-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="times" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-dark">
            {isEdit ? 'Denemeyi Düzenle' : 'Yeni Besin Ekle'}
          </Text>
          <View style={{ width: 20 }} />
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" className="px-4 pt-5">
          {/* Food name */}
          <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
            <Text className="text-sm font-semibold text-dark mb-2">Besin Adı *</Text>
            <TextInput
              value={foodName}
              onChangeText={setFoodName}
              placeholder="Örn: Havuç, Elma, Yoğurt..."
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 rounded-xl px-4 py-3 text-dark text-base border border-gray-200"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Start date */}
          <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
            <Text className="text-sm font-semibold text-dark mb-2">Başlangıç Tarihi</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
              className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex-row items-center"
            >
              <Icon name="calendar-days" size={16} color="#6B7280" />
              <Text className="text-base text-dark ml-2">{displayDate(formatDateISO(startDate))}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_event, selected) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                    if (selected) setStartDate(selected);
                  }}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    activeOpacity={0.8}
                    className="mt-2 bg-green-600 rounded-xl py-2 items-center"
                  >
                    <Text className="text-white font-semibold text-sm">Tamam</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Notes */}
          <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
            <Text className="text-sm font-semibold text-dark mb-2">Notlar</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Reaksiyon, gözlem veya notlarınızı yazın..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-gray-50 rounded-xl px-4 py-3 text-dark text-base border border-gray-200"
              style={{ minHeight: 100 }}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={submitting}
            activeOpacity={0.85}
            className="bg-green-600 rounded-2xl py-4 items-center mb-8"
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">
                {isEdit ? 'Değişiklikleri Kaydet' : 'Besin Ekle'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BesinTakvimiScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeChild } = useActiveChild();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrial, setEditingTrial] = useState<FoodTrial | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [authLoading, isAuthenticated]);

  // SWR for list and summary
  const {
    data: trials,
    error: trialsError,
    isLoading: trialsLoading,
    mutate: mutateTrials,
  } = useSWR<FoodTrial[]>(
    isAuthenticated ? API_ENDPOINTS.FOOD_TRIALS : null,
    getFoodTrials,
  );

  const {
    data: summary,
    mutate: mutateSummary,
  } = useSWR<FoodTrialSummary>(
    isAuthenticated ? API_ENDPOINTS.FOOD_TRIAL_SUMMARY : null,
    getFoodTrialSummary,
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([mutateTrials(), mutateSummary()]);
    setRefreshing(false);
  }, [mutateTrials, mutateSummary]);

  const handleSaved = useCallback(() => {
    mutateTrials();
    mutateSummary();
  }, [mutateTrials, mutateSummary]);

  const handleEdit = useCallback((trial: FoodTrial) => {
    setEditingTrial(trial);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    (trial: FoodTrial) => {
      Alert.alert(
        'Denemeyi Sil',
        `"${trial.food_name}" deneme kaydını silmek istediğinize emin misiniz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteFoodTrial(trial.id);
                Toast.show({ type: 'success', text1: 'Silindi', text2: 'Deneme kaydı silindi.' });
                mutateTrials();
                mutateSummary();
              } catch {
                Toast.show({
                  type: 'error',
                  text1: 'Hata',
                  text2: 'Silme işlemi başarısız. Lütfen tekrar deneyin.',
                });
              }
            },
          },
        ],
      );
    },
    [mutateTrials, mutateSummary],
  );

  const handleAdd = useCallback(() => {
    setEditingTrial(null);
    setModalVisible(true);
  }, []);

  // Auth loading
  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ToolHeader title="Besin Deneme Takvimi" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ToolHeader title="Besin Deneme Takvimi" />

      {trialsLoading && !trials ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16A34A" />
          <Text className="mt-3 text-gray-500 text-sm">Yükleniyor...</Text>
        </View>
      ) : trialsError ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <ToolGradientHero
            iconName="calendar-days"
            iconColor="#ffffff"
            gradientColors={['#16A34A', '#15803D']}
            title="Besin Deneme Takvimi"
            subtitle="Yeni besinleri tanıtırken takip edin ve kayıt tutun."
          />
          <View className="flex-1 items-center justify-center px-8 pt-12">
            <Icon name="exclamation-circle" size={40} color="#DC2626" />
            <Text className="text-lg font-bold text-dark mt-4 mb-2 text-center">Yüklenemedi</Text>
            <Text className="text-sm text-gray-500 text-center">
              Besin denemeleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
            </Text>
            <TouchableOpacity
              onPress={() => mutateTrials()}
              activeOpacity={0.85}
              className="mt-6 bg-green-600 rounded-2xl px-6 py-3"
            >
              <Text className="text-white font-bold">Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={trials ?? []}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />}
          ListHeaderComponent={
            <>
              <ToolGradientHero
                iconName="calendar-days"
                iconColor="#ffffff"
                gradientColors={['#16A34A', '#15803D']}
                title="Besin Deneme Takvimi"
                subtitle="Yeni besinleri tanıtırken takip edin ve kayıt tutun."
              />

              {/* No active child state */}
              {!activeChild ? (
                <View className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-5 items-center">
                  <Icon name="circle-exclamation" size={28} color="#D97706" />
                  <Text className="text-base font-bold text-amber-800 mt-3 mb-1 text-center">
                    Aktif çocuk seçilmedi
                  </Text>
                  <Text className="text-sm text-amber-700 text-center leading-5">
                    Besin denemelerini takip etmek için lütfen bir çocuk profili seçin veya ekleyin.
                  </Text>
                </View>
              ) : null}

              {/* Summary cards */}
              {summary ? <SummaryCards summary={summary} /> : null}

              {/* Section title + add button */}
              <View className="flex-row items-center justify-between px-4 pt-5 pb-2">
                <Text className="text-base font-bold text-dark">Denemeler</Text>
                <TouchableOpacity
                  onPress={handleAdd}
                  activeOpacity={0.85}
                  className="flex-row items-center gap-2 bg-green-600 rounded-full px-4 py-2"
                >
                  <Icon name="plus" size={13} color="#ffffff" />
                  <Text className="text-white text-sm font-semibold">Yeni Besin Ekle</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <FoodTrialCard trial={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center px-8 pt-8 pb-4">
              <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
                <Icon name="flask" size={28} color="#16A34A" />
              </View>
              <Text className="text-lg font-bold text-dark text-center mb-2">
                Henüz deneme yok
              </Text>
              <Text className="text-sm text-gray-500 text-center leading-5 mb-6">
                Bebeğinize yeni bir besin tanıtmaya başlayın ve denemeleri buradan takip edin.
              </Text>
              <TouchableOpacity
                onPress={handleAdd}
                activeOpacity={0.85}
                className="bg-green-600 rounded-2xl px-6 py-3 flex-row items-center gap-2"
              >
                <Icon name="plus" size={14} color="#ffffff" />
                <Text className="text-white font-bold">İlk Denemeyi Ekle</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={<View className="h-8" />}
        />
      )}

      {/* Add / Edit Modal */}
      <FormModal
        visible={modalVisible}
        trial={editingTrial}
        childId={activeChild?.id}
        onClose={() => setModalVisible(false)}
        onSaved={handleSaved}
      />
    </SafeAreaView>
  );
}
