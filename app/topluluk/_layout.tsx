import { Stack } from 'expo-router';

export default function ToplulukLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="soru-sor" />
    </Stack>
  );
}
