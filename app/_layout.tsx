import '../src/global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { SWRProvider } from '../src/providers/SWRProvider';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ActiveChildProvider } from '../src/contexts/ActiveChildContext';
import { FavoritesProvider } from '../src/contexts/FavoritesContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SWRProvider>
      <AuthProvider>
        <ActiveChildProvider>
          <FavoritesProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            <Toast />
          </FavoritesProvider>
        </ActiveChildProvider>
      </AuthProvider>
    </SWRProvider>
  );
}
