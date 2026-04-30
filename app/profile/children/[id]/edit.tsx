import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import useSWR from 'swr';
import { getChild } from '../../../../src/services/user-service';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { ChildWizard } from '../../../../src/components/profile/ChildWizard';

export default function EditChildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const childId = Number(id);

  const { data: child, isLoading } = useSWR(
    childId ? `child-${childId}` : null,
    () => getChild(childId),
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFBE6' }}>
        <LoadingSpinner />
      </View>
    );
  }

  return <ChildWizard mode="edit" child={child} />;
}
