import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useShoppingList } from '../../src/hooks/useShoppingList';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { COLORS } from '../../src/lib/constants';
import type { ShoppingListItem, ShoppingCategory } from '../../src/lib/types';
import Toast from 'react-native-toast-message';

import { AppIcon } from '../../src/components/ui/AppIcon';
// ─── Category Metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  dairy: { label: 'Süt & Süt Ürünleri', emoji: '🥛', color: '#DBEAFE' },
  meat_protein: { label: 'Et & Protein', emoji: '🥩', color: '#FCE7F3' },
  fruits_vegetables: { label: 'Meyve & Sebze', emoji: '🥦', color: '#DCFCE7' },
  grains: { label: 'Tahıllar & Kuru Gıda', emoji: '🌾', color: '#FEF9C3' },
  other: { label: 'Diğer', emoji: '🛒', color: '#F3F4F6' },
  uncategorized: { label: 'Kategorisiz', emoji: '📦', color: '#F3F4F6' },
};

const CATEGORIES: ShoppingCategory[] = [
  'dairy',
  'meat_protein',
  'fruits_vegetables',
  'grains',
  'other',
];

function getCategoryKey(item: ShoppingListItem): string {
  if (!item.category) return 'uncategorized';
  return CATEGORIES.includes(item.category as ShoppingCategory) ? item.category : 'uncategorized';
}

// ─── Item Component ───────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ShoppingListItem;
  onToggle: (id: string | number, checked: boolean) => Promise<void>;
  onRemove: (id: string | number) => Promise<void>;
}

function ItemRow({ item, onToggle, onRemove }: ItemRowProps) {
  const isChecked = item.checked ?? item.is_checked ?? false;

  return (
    <View
      style={{
        backgroundColor: isChecked ? '#F9FAFB' : '#fff',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: isChecked ? 0 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isChecked ? 0 : 0.05,
        shadowRadius: 3,
        marginBottom: 6,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onToggle(item.id, !isChecked)}
        style={{ marginRight: 12 }}
      >
        <AppIcon
          name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={isChecked ? '#22C55E' : COLORS.primary}
        />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            color: isChecked ? '#9CA3AF' : '#1F2937',
            fontWeight: '500',
            textDecorationLine: isChecked ? 'line-through' : 'none',
          }}
          numberOfLines={1}
        >
          {item.ingredient ?? item.name ?? ''}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 1 }}>
          {(item.amount || item.quantity) && (
            <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
              {item.amount ?? item.quantity}
            </Text>
          )}
          {item.recipe_title && (
            <Text style={{ fontSize: 11, color: '#C084FC' }} numberOfLines={1}>
              {item.recipe_title}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onRemove(item.id)}
        style={{ padding: 4 }}
      >
        <AppIcon name="trash-outline" size={18} color={isChecked ? '#D1D5DB' : '#EF4444'} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ShoppingListScreen() {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, addItem, removeItem, toggleItem, refresh } = useShoppingList();
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory>('other');
  const [isAdding, setIsAdding] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleAdd = async () => {
    const ingredient = newItemText.trim();
    if (!ingredient) return;
    setIsAdding(true);
    try {
      await addItem({ ingredient, category: selectedCategory });
      setNewItemText('');
    } catch {
      Toast.show({ type: 'error', text1: 'Ürün eklenemedi.' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (id: string | number, checked: boolean) => {
    try {
      await toggleItem(id, checked);
    } catch {
      Toast.show({ type: 'error', text1: 'Güncelleme başarısız.' });
    }
  };

  const handleRemove = async (id: string | number) => {
    try {
      await removeItem(id);
    } catch {
      Toast.show({ type: 'error', text1: 'Silme başarısız.' });
    }
  };

  const handleClearChecked = () => {
    const checkedItems = items.filter((i) => i.checked ?? i.is_checked);
    if (checkedItems.length === 0) return;
    Alert.alert(
      'İşaretlileri Sil',
      `${checkedItems.length} tamamlanan ürün silinecek. Devam edilsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await Promise.allSettled(checkedItems.map((item) => removeItem(item.id)));
            await refresh();
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Tümünü Temizle',
      'Tüm ürünler silinecek. Devam edilsin mi?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            await Promise.allSettled(items.map((item) => removeItem(item.id)));
            await refresh();
          },
        },
      ],
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.primary }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} style={{ marginRight: 12 }}>
            <AppIcon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Alışveriş Listesi 🛒</Text>
        </View>
        <EmptyState
          icon="lock-closed-outline"
          title="Giriş gerekli"
          description="Alışveriş listesine erişmek için giriş yapın."
          actionLabel="Giriş Yap"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  // Group by category
  const checkedItems = items.filter((i) => i.checked ?? i.is_checked);
  const uncheckedItems = items.filter((i) => !(i.checked ?? i.is_checked));

  const grouped: Record<string, ShoppingListItem[]> = {};
  for (const item of uncheckedItems) {
    const cat = getCategoryKey(item);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const orderedCategories = [...CATEGORIES, 'uncategorized'].filter((cat) => grouped[cat]?.length > 0);

  const selectedCatMeta = CATEGORY_META[selectedCategory];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} style={{ marginRight: 12 }}>
            <AppIcon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Alışveriş Listesi 🛒</Text>
            {items.length > 0 && (
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 }}>
                {uncheckedItems.length} bekliyor · {checkedItems.length} tamamlandı
              </Text>
            )}
          </View>
          {items.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  'İşlemler',
                  undefined,
                  [
                    checkedItems.length > 0
                      ? { text: 'İşaretlileri Sil', onPress: handleClearChecked }
                      : null,
                    { text: 'Tümünü Temizle', style: 'destructive', onPress: handleClearAll },
                    { text: 'İptal', style: 'cancel' },
                  ].filter(Boolean) as object[],
                );
              }}
              style={{ padding: 4 }}
            >
              <AppIcon name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add Item Input */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 }}>
            <TextInput
              value={newItemText}
              onChangeText={setNewItemText}
              placeholder="Yeni ürün ekle..."
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1F2937' }}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAdd}
              disabled={isAdding || !newItemText.trim()}
              style={{ paddingHorizontal: 16, backgroundColor: newItemText.trim() ? COLORS.primary : '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}
            >
              {isAdding ? <ActivityIndicator size="small" color="#fff" /> : <AppIcon name="add" size={22} color={newItemText.trim() ? '#fff' : '#9CA3AF'} />}
            </TouchableOpacity>
          </View>

          {/* Category Selector */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowCategoryPicker((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6, paddingHorizontal: 4 }}
          >
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Kategori:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: selectedCatMeta.color, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 4 }}>
              <Text style={{ fontSize: 12 }}>{selectedCatMeta.emoji}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>{selectedCatMeta.label}</Text>
              <AppIcon name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} size={12} color="#6B7280" />
            </View>
          </TouchableOpacity>

          {showCategoryPicker && (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 8, marginTop: 6, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 }}>
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.8}
                    onPress={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, backgroundColor: isSelected ? meta.color : 'transparent', gap: 8, marginBottom: 2 }}
                  >
                    <Text style={{ fontSize: 16 }}>{meta.emoji}</Text>
                    <Text style={{ fontSize: 13, fontWeight: isSelected ? '700' : '400', color: '#374151' }}>{meta.label}</Text>
                    {isSelected && <AppIcon name="checkmark" size={16} color={COLORS.primary} style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {isLoading ? (
          <LoadingSpinner label="Liste yükleniyor..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="Liste boş"
            description="Yukarıdan ürün ekleyerek alışveriş listenizi oluşturun."
          />
        ) : (
          <View>
            {/* Categorized Items */}
            {orderedCategories.map((cat) => {
              const meta = CATEGORY_META[cat] ?? CATEGORY_META.other;
              const catItems = grouped[cat] ?? [];
              return (
                <View key={cat} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Text style={{ fontSize: 15 }}>{meta.emoji}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>{meta.label}</Text>
                    <View style={{ backgroundColor: meta.color, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 11, color: '#374151', fontWeight: '600' }}>{catItems.length}</Text>
                    </View>
                  </View>
                  {catItems.map((item) => (
                    <ItemRow key={String(item.id)} item={item} onToggle={handleToggle} onRemove={handleRemove} />
                  ))}
                </View>
              );
            })}

            {/* Checked Items */}
            {checkedItems.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#9CA3AF' }}>
                    Tamamlanan ({checkedItems.length})
                  </Text>
                  <TouchableOpacity onPress={handleClearChecked} activeOpacity={0.8}>
                    <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '600' }}>Tümünü Sil</Text>
                  </TouchableOpacity>
                </View>
                {checkedItems.map((item) => (
                  <ItemRow key={String(item.id)} item={item} onToggle={handleToggle} onRemove={handleRemove} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
