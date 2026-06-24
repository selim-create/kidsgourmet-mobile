import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import useSWR from 'swr';
import { getChild } from '../../../../src/services/user-service';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { ChildWizard } from '../../../../src/components/profile/ChildWizard';

export default function EditChildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: child, isLoading } = useSWR(
    id ? `child-${id}` : null,
    () => getChild(id),
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  // Çocuk bulunamazsa fallback göster
  if (!child) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Çocuk bulunamadı</Text>
      </View>
    );
  }

  return <ChildWizard mode="edit" child={child} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBE6',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

