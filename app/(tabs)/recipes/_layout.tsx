import { Stack } from 'expo-router';
import { COLORS } from '../../../src/lib/constants';

export default function RecipesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: '700', color: COLORS.dark },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Tarifler', headerShown: true }}
      />
      <Stack.Screen
        name="[slug]"
        options={{ title: '', headerShown: true }}
      />
    </Stack>
  );
}
