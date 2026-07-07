import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { ingredientService } from '../../src/services/ingredient-service';
import { checkIngredientSafety } from '../../src/services/safety-service';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';
import { COLORS } from '../../src/lib/constants';
import type { IngredientGuideItem } from '../../src/lib/types';
import {
  SAFETY_CONFIGS,
  getSafetyLevel,
  type SafetyLevel,
  DISCLAIMER_TITLE,
  DISCLAIMER_LINES,
  REFERENCE_NOTE,
  MSG_NO_CHILD,
} from '../../src/lib/tools/safety-check';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse the first integer from a start_age string like "6+ ay", "12 ay", "6" */
function parseStartAgeMonths(startAge?: string): number | null {
  if (!startAge) return null;
  const match = startAge.match(/\d+/);
  if (!match) return null;
  return parseInt(match[0], 10);
}

/**
 * Client-side safety decision — mirrors web page logic exactly.
 *
 * The 1-month caution buffer (`startAgeMonths - 1`) reflects the web's UX
 * design: babies within one month of the recommended start age get a "proceed
 * with caution" signal rather than a hard block, matching pediatric guidance
 * that introduction timing is approximate.
 */
function getClientSafetyLevel(babyAgeMonths: number, startAgeMonths: number): SafetyLevel {
  if (babyAgeMonths >= startAgeMonths) return 'safe';
  // Within one month of recommended age → caution, not a hard block
  if (babyAgeMonths >= startAgeMonths - 1) return 'caution';
  return 'avoid';
}

// ─── Result type (client-side) ────────────────────────────────────────────────

interface ClientSafetyResult {
  level: SafetyLevel | 'unknown';
  ingredientName: string;
  startAge: string;
  babyAgeMonths: number;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SafetyCheckScreen() {
  const { activeChild } = useActiveChild();
  const autoAgeMonths = activeChild ? getAgeInMonths(activeChild.birth_date) : null;

  // Manual age input for when no active child
  const [manualAge, setManualAge] = useState('6');

  const ageMonths = autoAgeMonths !== null ? autoAgeMonths : (parseInt(manualAge, 10) || 0);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<IngredientGuideItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientGuideItem | null>(null);
  const [result, setResult] = useState<ClientSafetyResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Debounced ingredient search ─────────────────────────────────────────────

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setSelectedIngredient(null);
    setResult(null);
    setQueryError(null);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await ingredientService.search(text.trim());
        setSuggestions(results.slice(0, 8));
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // ─── Select ingredient from dropdown ─────────────────────────────────────────

  const handleSelectIngredient = (ingredient: IngredientGuideItem) => {
    setSelectedIngredient(ingredient);
    setQuery(ingredient.name);
    setSuggestions([]);
    setResult(null);
    setQueryError(null);
  };

  // ─── Evaluate safety ─────────────────────────────────────────────────────────

  const handleCheck = async () => {
    if (!selectedIngredient) {
      setQueryError('Lütfen listeden bir gıda seçin.');
      return;
    }

    // Validate age when entered manually
    if (autoAgeMonths === null) {
      const parsedAge = parseInt(manualAge, 10);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 36) {
        setQueryError('Lütfen 0–36 arasında geçerli bir ay değeri girin.');
        return;
      }
    }

    // Try Safety API first when active child and ingredient ID are available
    if (activeChild && selectedIngredient.id != null) {
      try {
        const apiResult = await checkIngredientSafety(selectedIngredient.id, activeChild.id);
        const level = getSafetyLevel(apiResult);
        const startAge = selectedIngredient.start_age ?? 'Belirtilmemiş';
        setResult({
          level,
          ingredientName: selectedIngredient.name,
          startAge,
          babyAgeMonths: ageMonths,
        });
        return;
      } catch {
        // Fall through to client-side calculation below
      }
    }

    // Client-side fallback
    const startAgeMonths = parseStartAgeMonths(selectedIngredient.start_age);
    if (startAgeMonths === null) {
      // Cannot determine safety without start_age data
      setResult({
        level: 'unknown',
        ingredientName: selectedIngredient.name,
        startAge: 'Belirtilmemiş',
        babyAgeMonths: ageMonths,
      });
      return;
    }

    const level = getClientSafetyLevel(ageMonths, startAgeMonths);
    setResult({
      level,
      ingredientName: selectedIngredient.name,
      startAge: selectedIngredient.start_age ?? `${startAgeMonths} ay`,
      babyAgeMonths: ageMonths,
    });
  };

  // For 'unknown' level use a neutral caution-style config
  const UNKNOWN_CONFIG = {
    bg: '#F3F4F6',
    border: '#6B7280',
    text: '#374151',
    icon: 'help-circle' as const,
    label: 'Bilgi Yetersiz ℹ️',
    badge: 'Bilinmiyor',
  };

  const safetyConfig = result
    ? result.level === 'unknown'
      ? UNKNOWN_CONFIG
      : SAFETY_CONFIGS[result.level]
    : null;

  const getResultMessage = (r: ClientSafetyResult): string => {
    if (r.level === 'unknown') {
      return `${r.ingredientName} için başlangıç yaşı bilgisi bulunamadı. Pediatristenize danışın.`;
    }
    if (r.level === 'safe') {
      return `${r.ingredientName} bu yaşta verilebilir. Önerilen başlangıç yaşına ulaşmış.`;
    }
    if (r.level === 'caution') {
      return `${r.ingredientName} önerilen yaşa çok yakın. Küçük porsiyonlarla dikkatli deneyin ve reaksiyonları gözlemleyin.`;
    }
    return `${r.ingredientName} henüz erken. Önerilen başlangıç yaşı: ${r.startAge}.`;
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
            {activeChild.name} için · {autoAgeMonths} aylık
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

          {/* ── Manual age input (when no active child) ───────────────────── */}
          {!activeChild && (
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
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Bebek yaşı (ay)
              </Text>
              <TextInput
                value={manualAge}
                onChangeText={(t) => setManualAge(t.replace(/[^0-9]/g, ''))}
                placeholder="Örn: 6"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={2}
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 15,
                  color: '#1F2937',
                }}
              />
              <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                0–36 ay arası girin
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
              Kontrol etmek istediğiniz gıdayı arayın
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
                placeholder="Örn: havuç, elma, yumurta..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: '#1F2937',
                  minHeight: 44,
                }}
                autoCapitalize="sentences"
                autoCorrect={false}
              />
              {isSearching && (
                <View style={{ paddingHorizontal: 14, justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              )}
            </View>
            {queryError && (
              <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>
                {queryError}
              </Text>
            )}

            {/* Dropdown suggestions */}
            {suggestions.length > 0 && (
              <View
                style={{
                  marginTop: 4,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                {suggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id ?? idx}
                    activeOpacity={0.7}
                    onPress={() => handleSelectIngredient(item)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: idx < suggestions.length - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6',
                      backgroundColor: '#fff',
                    }}
                  >
                    <Text style={{ fontSize: 14, color: '#1F2937', fontWeight: '500' }}>
                      {item.name}
                    </Text>
                    {item.start_age ? (
                      <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        Önerilen başlangıç: {item.start_age}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No results hint */}
            {query.trim().length >= 2 && !isSearching && suggestions.length === 0 && !selectedIngredient && (
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                Sonuç bulunamadı. Farklı bir kelime deneyin.
              </Text>
            )}
          </View>

          {/* ── Check button ─────────────────────────────────────────────── */}
          {selectedIngredient && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCheck}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                Kontrol Et
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Result card ──────────────────────────────────────────────── */}
          {result && safetyConfig && (
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
                    {result.ingredientName}
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

              {/* Message */}
              <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                <Text style={{ color: safetyConfig.text, fontSize: 13, marginRight: 6 }}>•</Text>
                <Text style={{ fontSize: 13, color: safetyConfig.text, flex: 1, lineHeight: 19 }}>
                  {getResultMessage(result)}
                </Text>
              </View>

              {/* Age info */}
              <Text style={{ fontSize: 11, color: safetyConfig.text, marginTop: 8, opacity: 0.75 }}>
                Bebek yaşı: {result.babyAgeMonths} ay · Önerilen başlangıç: {result.startAge}
              </Text>
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
