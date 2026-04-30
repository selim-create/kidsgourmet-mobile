import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGreeting } from '../../hooks/use-greeting';
import { useActiveChild } from '../../contexts/ActiveChildContext';
import { COLORS } from '../../lib/constants';

export function HeaderGreeting() {
  const { text, emoji } = useGreeting();
  const { activeChild } = useActiveChild();

  const firstLine = `${text} ${emoji}`;
  const secondLine = activeChild
    ? `${activeChild.name} için bugün ne pişirelim?`
    : "KidsGourmet'e hoş geldin!";

  return (
    <View style={styles.container}>
      <Text style={styles.firstLine}>{firstLine}</Text>
      <Text style={styles.secondLine}>{secondLine}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  firstLine: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },
  secondLine: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 2,
  },
});
