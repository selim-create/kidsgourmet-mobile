import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="expert" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="children/index" />
      <Stack.Screen name="children/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="children/[id]/edit" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
