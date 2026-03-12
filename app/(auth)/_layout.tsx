import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Yükleniyor..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
