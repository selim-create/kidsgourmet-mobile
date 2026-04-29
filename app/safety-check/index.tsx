import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { checkIngredientSafety } from '../../src/services/safety-service';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';
import { COLORS } from '../../src/lib/constants';
import type { SafetyCheckResult } from '../../src/lib/types';
import {
  getSafetyConfig,
  validateFoodQuery,
  MSG_API_ERROR,
  MSG_NO_CHILD,
  DISCLAIMER_TITLE,
  DISCLAIMER_LINES,
  REFERENCE_NOTE,
} from '../../src/lib/tools/safety-check';

export default function SafetyCheckScreen() {
  const { activeChild } = useActiveChild();
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);
  const [result, setResult] = useState<SafetyCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkedName, setCheckedName] = useState('');

  const ageMonths = activeChild ? getAgeInMonths(activeChild.birth_date) : 0;
  const safetyConfig = getSafetyConfig(result);

  const handleCheck = async () => {
    const validationError = validateFoodQuery(query);
    if (validationError) {
      setQueryError(validationError);
      return;
    }
    setQueryError(null);
    setIsChecking(true);
    setResult(null);
    const trimmedQuery = query.trim();
    setCheckedName(trimmedQuery);
    try {
      let res: SafetyCheckResult;
      if (activeChild) {
        res = await checkIngredientSafety(trimmedQuery, activeChild.id);
      } else {
        res = await checkIngredientSafety(trimmedQuery, 0);
      }
      setResult(res);
    } catch {
      setResult({
        is_safe: false,
        alerts: [{ type: 'error', severity: 'medium', message: MSG_API_ERROR }],
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (queryError) setQueryError(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: COLORS.primary,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', flex: 1 }}>
            Bu Gıda Verilir mi? 🔍
          </Text>
        </View>
        {activeChild ? (
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginLeft: 38 }}>
            {activeChild.name} için · {ageMonths} aylık
          </Text>
        ) : (
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginLeft: 38 }}>
            Bebek profili seçilmedi
          </Text>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── No-child warning ─────────────────────────────────────────── */}
          {!activeChild && (
            <View
              style={{
                backgroundColor: '#FEF3C7',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              <Ionicons name="information-circle-outline" size={20} color="#D97706" />
              <Text style={{ fontSize: 13, color: '#92400E', marginLeft: 10, flex: 1, lineHeight: 19 }}>
                {MSG_NO_CHILD}
              </Text>
            </View>
          )}

          {/* ── Search card ──────────────────────────────────────────────── */}
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
                borderColor: queryError ? '#DC2626' : '#E5E7EB',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <TextInput
                value={query}
                onChangeText={handleQueryChange}
                placeholder="Örn: bal, fıstık, yumurta..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: '#1F2937',
                  minHeight: 44,
                }}
                onSubmitEditing={handleCheck}
                returnKeyType="search"
                autoCapitalize="sentences"
                autoCorrect={false}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCheck}
                disabled={isChecking}
                style={{
                  paddingHorizontal: 16,
                  minWidth: 52,
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
            {queryError && (
              <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>
                {queryError}
              </Text>
            )}
          </View>

          {/* ── Loading state ────────────────────────────────────────────── */}
          {isChecking && (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 10 }}>
                Kontrol ediliyor...
              </Text>
            </View>
          )}

          {/* ── Result card ──────────────────────────────────────────────── */}
          {result && safetyConfig && !isChecking && (
            <View
              style={{
                backgroundColor: safetyConfig.bg,
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1.5,
                borderColor: safetyConfig.border,
              }}
            >
              {/* Level header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name={safetyConfig.icon} size={24} color={safetyConfig.border} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: safetyConfig.text }}>
                    {checkedName}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: safetyConfig.border, marginTop: 2 }}>
                    {safetyConfig.label}
                  </Text>
                </View>
                {/* Badge */}
                <View
                  style={{
                    backgroundColor: safetyConfig.border,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                    {safetyConfig.badge}
                  </Text>
                </View>
              </View>

              {/* Alert messages */}
              {result.alerts && result.alerts.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  {result.alerts.map((alert, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 5 }}>
                      <Text style={{ color: safetyConfig.text, fontSize: 13, marginRight: 6 }}>•</Text>
                      <Text style={{ fontSize: 13, color: safetyConfig.text, flex: 1, lineHeight: 19 }}>
                        {alert.message}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Alternatives */}
              {result.alternatives && result.alternatives.length > 0 && (
                <View
                  style={{
                    marginTop: 12,
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: safetyConfig.text, marginBottom: 4 }}>
                    Alternatif gıdalar:
                  </Text>
                  <Text style={{ fontSize: 13, color: safetyConfig.text, lineHeight: 19 }}>
                    {result.alternatives.join(' · ')}
                  </Text>
                </View>
              )}

              {/* Safety score if present */}
              {result.safety_score !== undefined && (
                <Text style={{ fontSize: 11, color: safetyConfig.text, marginTop: 10, opacity: 0.7 }}>
                  Güvenlik skoru: {result.safety_score}
                </Text>
              )}
            </View>
          )}

          {/* ── Disclaimer ───────────────────────────────────────────────── */}
          <View
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 14,
              padding: 14,
              marginTop: result ? 8 : 20,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 }}>
              {DISCLAIMER_TITLE}
            </Text>
            {DISCLAIMER_LINES.map((line, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 5 }}>
                <Text style={{ color: '#6B7280', fontSize: 12, marginRight: 6 }}>•</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 18, flex: 1 }}>
                  {line}
                </Text>
              </View>
            ))}
            <View
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
              }}
            >
              <Text style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 16 }}>
                📚 {REFERENCE_NOTE}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
