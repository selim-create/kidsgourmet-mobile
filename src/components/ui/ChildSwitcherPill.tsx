import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveChild } from '../../contexts/ActiveChildContext';
import { calculateAgeInMonths } from '../../utils/ageCalculator';
import { COLORS } from '../../lib/constants';
import { Avatar } from './Avatar';
import { ChildSwitcherSheet } from './ChildSwitcherSheet';

/** Returns a soft background color based on child's age in months. */
function getAgeColor(ageMonths: number): string {
  if (ageMonths < 6)  return '#DBEAFE'; // blue-light
  if (ageMonths < 12) return '#DCFCE7'; // green-light
  if (ageMonths < 24) return '#FFF0E8'; // primary-light (orange)
  return '#EDE9FE';                     // purple-light
}

export function ChildSwitcherPill() {
  const { activeChild } = useActiveChild();
  const [sheetVisible, setSheetVisible] = useState(false);

  if (!activeChild) return null;

  const ageMonths = calculateAgeInMonths(activeChild.birth_date);
  const bgColor = getAgeColor(ageMonths);
  const firstName = activeChild.name.split(' ')[0];

  return (
    <>
      <TouchableOpacity
        style={[styles.pill, { backgroundColor: bgColor }]}
        activeOpacity={0.75}
        onPress={() => setSheetVisible(true)}
      >
        {/* Mini avatar with status dot */}
        <View style={styles.avatarWrap}>
          <Avatar
            uri={activeChild.avatar_url}
            name={activeChild.name}
            size={24}
          />
          {/* TODO: replace with real meal-log status (green=done, yellow=partial, red=allergen risk) */}
          <View style={styles.statusDot} />
        </View>

        <Text style={styles.label} numberOfLines={1}>
          {firstName} · {ageMonths} ay
        </Text>

        <Ionicons name="chevron-down" size={14} color={COLORS.gray[500]} style={styles.chevron} />
      </TouchableOpacity>

      <ChildSwitcherSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    maxWidth: 200,
  },
  avatarWrap: {
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: '#fff',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    flexShrink: 1,
  },
  chevron: {
    marginLeft: 2,
  },
});
