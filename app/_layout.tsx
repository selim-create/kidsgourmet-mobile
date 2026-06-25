import '../src/global.css';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { SWRProvider } from '../src/providers/SWRProvider';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ActiveChildProvider } from '../src/contexts/ActiveChildContext';
import { FavoritesProvider } from '../src/contexts/FavoritesContext';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components',
  'Support for defaultProps will be removed from memo components',
  'TRenderEngineProvider: Support for defaultProps',
  'MemoizedTNodeRenderer: Support for defaultProps',
  'TNodeChildrenRenderer: Support for defaultProps',
]);

export default function RootLayout() {
  useEffect(() => {
    let mounted = true;

    async function prepareApp() {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
        });
      } catch {
        // Font loading should never block app startup on Android.
      } finally {
        if (mounted) {
          await SplashScreen.hideAsync();
        }
      }
    }

    prepareApp();

    return () => {
      mounted = false;
    };
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

