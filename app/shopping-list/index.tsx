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
import { Ionicons } from '@expo/vector-icons';
import { useShoppingList } from '../../src/hooks/useShoppingList';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
} from '../../src/services/shopping-list-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { COLORS } from '../../src/lib/constants';

export default function ShoppingListScreen() {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, mutate } = useShoppingList();
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    const name = newItem.trim();
    if (!name) return;
    setIsAdding(true);
    try {
      await addShoppingItem({ name });
      setNewItem('');
      await mutate();
    } catch {
      Alert.alert('Hata', 'Ürün eklenemedi.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleShoppingItem(id);
      await mutate();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteShoppingItem(id);
      await mutate();
    } catch {
      // ignore
    }
  };

  const unchecked = items.filter((i) => !i.is_checked);
  const checked = items.filter((i) => i.is_checked);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.primary }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <View
        style={{
          backgroundColor: COLORS.primary,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            Alışveriş Listesi 🛒
          </Text>
        </View>
        {items.length > 0 && (
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
            {unchecked.length} ürün bekliyor
          </Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add item input */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 20,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.07,
            shadowRadius: 4,
          }}
        >
          <TextInput
            value={newItem}
            onChangeText={setNewItem}
            placeholder="Yeni ürün ekle..."
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              color: '#1F2937',
            }}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAdd}
            disabled={isAdding || !newItem.trim()}
            style={{
              paddingHorizontal: 16,
              backgroundColor: newItem.trim() ? COLORS.primary : '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="add" size={22} color={newItem.trim() ? '#fff' : '#9CA3AF'} />
            )}
          </TouchableOpacity>
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
            {/* Pending items */}
            {unchecked.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 }}>
                  Bekleyen ({unchecked.length})
                </Text>
                <View style={{ gap: 8 }}>
                  {unchecked.map((item) => (
                    <View
                      key={item.id}
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
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleToggle(item.id)}
                        style={{ marginRight: 12 }}
                      >
                        <Ionicons name="ellipse-outline" size={22} color={COLORS.primary} />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, color: '#1F2937', fontWeight: '500' }}>
                          {item.name}
                        </Text>
                        {item.quantity && (
                          <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                            {item.quantity}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDelete(item.id)}
                        style={{ padding: 4 }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Checked items */}
            {checked.length > 0 && (
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#9CA3AF', marginBottom: 8 }}>
                  Tamamlanan ({checked.length})
                </Text>
                <View style={{ gap: 8 }}>
                  {checked.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        backgroundColor: '#F9FAFB',
                        borderRadius: 12,
                        padding: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleToggle(item.id)}
                        style={{ marginRight: 12 }}
                      >
                        <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                      </TouchableOpacity>
                      <Text style={{ flex: 1, fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' }}>
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDelete(item.id)}
                        style={{ padding: 4 }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#D1D5DB" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
