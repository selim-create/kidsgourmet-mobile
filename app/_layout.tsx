import '../src/global.css';
import { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
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

const ICON_FONT_TIMEOUT_MS = 2000;

export default function RootLayout() {
  const [iconFontReady, setIconFontReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function finishStartup() {
      if (!mounted) return;
      setIconFontReady(true);
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Splash may already be hidden.
      }
    }

    async function prepareApp() {
      timeout = setTimeout(() => {
        finishStartup();
      }, ICON_FONT_TIMEOUT_MS);

      try {
        await Ionicons.loadFont();
      } catch {
        // Icon font loading should not block app startup.
      } finally {
        if (timeout) clearTimeout(timeout);
        await finishStartup();
      }
    }

    prepareApp();

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <ErrorBoundary key={iconFontReady ? 'icons-ready' : 'icons-loading'}>
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

