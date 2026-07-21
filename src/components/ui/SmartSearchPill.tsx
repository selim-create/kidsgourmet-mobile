import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveChild } from '../../contexts/ActiveChildContext';
import { COLORS } from '../../lib/constants';
import { SearchModal } from './SearchModal';

function buildSuggestions(childName?: string, ageMonths?: number): string[] {
  const name = childName ?? 'Minik';
  const age = ageMonths !== undefined ? `${ageMonths} ay` : '';
  return [
    `${name} için akşam yemeği?`,
    age ? `${age} alerjensiz tarif?` : 'Alerjensiz tarif?',
    'Hızlı kahvaltı?',
    'Demir içeren tarif?',
  ];
}

export function SmartSearchPill() {
  const { activeChild } = useActiveChild();
  const [index, setIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  let ageMonths: number | undefined;
  if (activeChild?.birth_date) {
    const birth = new Date(activeChild.birth_date);
    const now = new Date();
    ageMonths = Math.max(
      0,
      (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()),
    );
  }

  const suggestions = useMemo(() => buildSuggestions(activeChild?.name, ageMonths), [activeChild?.name, ageMonths]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % suggestions.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [suggestions]);

  return (
    <>
      <TouchableOpacity
        style={styles.pill}
        activeOpacity={0.75}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="search-outline" size={16} color={COLORS.gray[400]} style={styles.searchIcon} />
        <Text style={styles.placeholder} numberOfLines={1} ellipsizeMode="tail">
          {suggestions[index]}
        </Text>
        <TouchableOpacity style={styles.micWrap} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
          <Ionicons name="mic-outline" size={15} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </TouchableOpacity>

      <SearchModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    height: 38,
    paddingHorizontal: 10,
    marginHorizontal: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  placeholder: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray[400],
  },
  micWrap: {
    marginLeft: 4,
  },
});
