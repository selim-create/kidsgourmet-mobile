import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ShoppingItem } from '../../lib/types';

interface ShoppingListWidgetProps {
  items: ShoppingItem[];
  isLoading?: boolean;
}

export function ShoppingListWidget({ items, isLoading }: ShoppingListWidgetProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const uncheckedCount = safeItems.filter((i) => !i.is_checked).length;
  const totalCount = safeItems.length;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/shopping-list')}
      style={{
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#DCFCE7',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name="cart-outline" size={22} color="#16A34A" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#14532D' }}>
          Alışveriş Listesi
        </Text>
        {isLoading ? (
          <Text style={{ fontSize: 12, color: '#86EFAC' }}>Yükleniyor...</Text>
        ) : totalCount > 0 ? (
          <Text style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
            {uncheckedCount} ürün bekliyor ({totalCount} toplam)
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: '#4ADE80', marginTop: 2 }}>
            Liste boş, ürün ekle
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#16A34A" />
    </TouchableOpacity>
  );
}
