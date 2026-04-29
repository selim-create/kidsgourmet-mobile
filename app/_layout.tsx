import '../src/global.css';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { SWRProvider } from '../src/providers/SWRProvider';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ActiveChildProvider } from '../src/contexts/ActiveChildContext';
import { FavoritesProvider } from '../src/contexts/FavoritesContext';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

// react-native-render-html v6 + React 18.3 incompatibility (harmless defaultProps deprecation warnings)
LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components',
  'Support for defaultProps will be removed from memo components',
  'TRenderEngineProvider: Support for defaultProps',
  'MemoizedTNodeRenderer: Support for defaultProps',
  'TNodeChildrenRenderer: Support for defaultProps',
]);

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
