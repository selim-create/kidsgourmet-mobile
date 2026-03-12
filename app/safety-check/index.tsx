import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { checkIngredientSafety } from '../../src/services/safety-service';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';
import { COLORS } from '../../src/lib/constants';
import type { SafetyCheckResult } from '../../src/lib/types';

const SEVERITY_CONFIG = {
  safe: { bg: '#ECFDF5', border: '#059669', text: '#065F46', icon: 'checkmark-circle' as const, label: 'Güvenli ✅' },
  caution: { bg: '#FFFBEB', border: '#D97706', text: '#92400E', icon: 'warning' as const, label: 'Dikkatli Ol ⚠️' },
  avoid: { bg: '#FEF2F2', border: '#DC2626', text: '#991B1B', icon: 'close-circle' as const, label: 'Kaçın ❌' },
};

export default function SafetyCheckScreen() {
  const { activeChild } = useActiveChild();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SafetyCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkedName, setCheckedName] = useState('');

  const ageMonths = activeChild ? getAgeInMonths(activeChild.birth_date) : 0;

  const handleCheck = async () => {
    if (!query.trim()) return;
    setIsChecking(true);
    setResult(null);
    setCheckedName(query.trim());
    try {
      let res: SafetyCheckResult;
      if (activeChild) {
        res = await checkIngredientSafety(query.trim(), activeChild.id);
      } else {
        // fallback - generic check without child context
        res = { is_safe: true, alerts: [] };
      }
      setResult(res);
    } catch {
      setResult({ is_safe: false, alerts: [{ type: 'error', severity: 'medium', message: 'Kontrol sırasında hata oluştu.' }] });
    } finally {
      setIsChecking(false);
    }
  };

  const safetyConfig = result
    ? result.is_safe
      ? SEVERITY_CONFIG.safe
      : result.alerts?.[0]?.severity === 'high' || result.alerts?.[0]?.severity === 'critical'
        ? SEVERITY_CONFIG.avoid
        : SEVERITY_CONFIG.caution
    : null;

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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            Bu Gıda Verilir Mi? 🔍
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
        keyboardShouldPersistTaps="handled"
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
              Daha doğru sonuçlar için profil sekmesinden çocuk ekleyin.
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.07,
            shadowRadius: 4,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 }}>
            Kontrol etmek istediğiniz gıdayı yazın
          </Text>
          <View
            style={{
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Örn: bal, fıstık, yumurta..."
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: '#1F2937',
              }}
              onSubmitEditing={handleCheck}
              returnKeyType="search"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheck}
              disabled={isChecking || !query.trim()}
              style={{
                paddingHorizontal: 16,
                backgroundColor: query.trim() ? COLORS.primary : '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="search" size={18} color={query.trim() ? '#fff' : '#9CA3AF'} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {result && safetyConfig && (
          <View
            style={{
              backgroundColor: safetyConfig.bg,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: safetyConfig.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name={safetyConfig.icon} size={22} color={safetyConfig.border} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: safetyConfig.text, marginLeft: 8 }}>
                {checkedName}: {safetyConfig.label}
              </Text>
            </View>
            {result.alerts?.map((alert, idx) => (
              <Text key={idx} style={{ fontSize: 13, color: safetyConfig.text, marginBottom: 4 }}>
                • {alert.message}
              </Text>
            ))}
            {result.alternatives && result.alternatives.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: safetyConfig.text }}>
                  Alternatifler:
                </Text>
                <Text style={{ fontSize: 12, color: safetyConfig.text, marginTop: 2 }}>
                  {result.alternatives.join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        <View
          style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 14,
            padding: 14,
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
            💡 Bilgi
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 18 }}>
            Bu araç genel bilgi amaçlıdır. Bebeğinizin sağlığı için önemli kararlar almadan önce pediatrist veya diyetisyeninize danışın.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
