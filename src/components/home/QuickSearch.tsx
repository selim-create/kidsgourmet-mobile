import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';

const AGE_OPTIONS = [
  { label: 'Tüm Aylar', value: '' },
  { label: '0-6 Ay', value: '0-6' },
  { label: '6-8 Ay', value: '6-8' },
  { label: '9-11 Ay', value: '9-11' },
  { label: '12-24 Ay', value: '12-24' },
  { label: '2+ Yaş', value: '2plus' },
];

const QUICK_CHIPS = [
  { emoji: '🍎', label: 'İlk Tadımlar', filter: 'ilk-tadimlar' },
  { emoji: '🌱', label: 'Vegan', filter: 'vegan' },
  { emoji: '🍲', label: 'Çorbalar', filter: 'corba' },
  { emoji: '🍪', label: 'Atıştırmalık', filter: 'atistirmalik' },
];

export function QuickSearch() {
  const [query, setQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [showAgePicker, setShowAgePicker] = useState(false);

  const selectedAgeLabel =
    AGE_OPTIONS.find((o) => o.value === selectedAge)?.label ?? 'Tüm Aylar';

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (selectedAge) params.set('age', selectedAge);
    const qs = params.toString();
    router.push(qs ? (`/search?${qs}` as never) : '/search');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ne Arıyorsunuz?</Text>

      {/* Search input */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.gray[400]} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Evde ne var? (Örn: Havuç, Yumurta)"
            placeholderTextColor={COLORS.gray[400]}
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Age group selector */}
      <TouchableOpacity
        onPress={() => setShowAgePicker(!showAgePicker)}
        activeOpacity={0.8}
        style={styles.agePicker}
      >
        <Ionicons name="people-outline" size={16} color={COLORS.primary} />
        <Text style={styles.agePickerText}>{selectedAgeLabel}</Text>
        <Ionicons
          name={showAgePicker ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.gray[400]}
        />
      </TouchableOpacity>

      {/* Age options dropdown */}
      {showAgePicker && (
        <View style={styles.ageDropdown}>
          {AGE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                setSelectedAge(opt.value);
                setShowAgePicker(false);
              }}
              activeOpacity={0.8}
              style={[
                styles.ageOption,
                selectedAge === opt.value && styles.ageOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.ageOptionText,
                  selectedAge === opt.value && styles.ageOptionTextActive,
                ]}
              >
                {opt.label}
              </Text>
              {selectedAge === opt.value && (
                <Ionicons name="checkmark" size={16} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search button */}
      <TouchableOpacity onPress={handleSearch} activeOpacity={0.85} style={styles.searchBtn}>
        <Ionicons name="search" size={18} color="#fff" />
        <Text style={styles.searchBtnText}>Tarif Bul</Text>
      </TouchableOpacity>

      {/* Quick access chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={{ marginTop: 12 }}
      >
        {QUICK_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.label}
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                `/(tabs)/recipes?diet_type=${chip.filter}` as never,
              )
            }
            style={styles.chip}
          >
            <Text style={styles.chipEmoji}>{chip.emoji}</Text>
            <Text style={styles.chipLabel}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  inputRow: {
    marginBottom: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
  },
  agePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  agePickerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  ageDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    overflow: 'hidden',
  },
  ageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ageOptionActive: {
    backgroundColor: '#FFF3EE',
  },
  ageOptionText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  ageOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipEmoji: {
    fontSize: 15,
  },
  chipLabel: {
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: '500',
  },
});
