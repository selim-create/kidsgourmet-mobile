import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { RecipeCard } from '../../src/components/recipes/RecipeCard';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { router } from 'expo-router';

const GRID_COLUMNS = 2;
const GRID_GAP = 12;
const SCREEN_PADDING = 16;

export default function FavoritesScreen() {
  const { isAuthenticated } = useAuth();
  const { favorites, isLoading, reload } = useFavorites();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = React.useState(false);

  const cardWidth = useMemo(
    () => (width - SCREEN_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
    [width],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <AppHeader />
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            icon="heart-outline"
            title="Favorilere erişmek için giriş yapın"
            description="Beğendiğiniz tarifleri kalp ikonuna tıklayarak favorilere ekleyebilirsiniz"
          />
          <Button onPress={() => router.push('/(auth)/login')} className="mt-4 w-full">
            Giriş Yap
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <AppHeader />
      {favorites.length > 0 ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 2 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
            {favorites.length} tarif kaydedildi
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <LoadingSpinner fullScreen label="Favoriler yükleniyor..." />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={{
            padding: SCREEN_PADDING,
            flexGrow: 1,
          }}
          columnWrapperStyle={{ gap: GRID_GAP }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF8A65"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="Henüz favori tarifiniz yok"
              description="Beğendiğiniz tarifleri kalp ikonuna tıklayarak favorilere ekleyebilirsiniz"
              actionLabel="Tariflere Git"
              onAction={() => router.push('/(tabs)/recipes')}
            />
          }
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <RecipeCard recipe={item} compact />
            </View>
          )}
        />
      )}
    </View>
  );
}
