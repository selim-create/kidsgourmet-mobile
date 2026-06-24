import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { RecipeCard } from '../../src/components/recipes/RecipeCard';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { FavoriteTabs } from '../../src/components/ui/FavoriteTabs';
import type { FavoriteTabKey } from '../../src/components/ui/FavoriteTabs';
import { router } from 'expo-router';

export default function FavoritesScreen() {
  const { isAuthenticated } = useAuth();
  const { favorites, isLoading, reload } = useFavorites();
  const [refreshing, setRefreshing] = React.useState(false);
  // Aktif tab durumu — varsayılan olarak "Tümü"
  const [activeTab, setActiveTab] = React.useState<FavoriteTabKey>('all');

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

  // Tab tanımları — şimdilik yalnızca tarifler aktif, diğerleri yakında
  // 'all' ve 'recipe' aynı sayıyı gösteriyor çünkü şu an yalnızca tarif tipi favori destekleniyor;
  // ilerleyen PR'larda diğer içerik tipleri eklendikçe bu sayılar ayrışacak.
  const tabs = [
    { key: 'all' as FavoriteTabKey, label: 'Tümü', count: favorites.length },
    { key: 'recipe' as FavoriteTabKey, label: 'Tarifler', count: favorites.length },
    { key: 'ingredient' as FavoriteTabKey, label: 'Beslenme Rehberi', count: 0 },
    { key: 'post' as FavoriteTabKey, label: 'Blog & Rehber', count: 0 },
    { key: 'discussion' as FavoriteTabKey, label: 'Topluluk', count: 0 },
  ];

  // Aktif tab'a göre gösterilecek liste
  const showRecipes = activeTab === 'all' || activeTab === 'recipe';

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <AppHeader />

      {/* İçerik tipi tab chip'leri */}
      <FavoriteTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <LoadingSpinner fullScreen label="Favoriler yükleniyor..." />
      ) : showRecipes ? (
        // Tarif listesi — tek sütun, avatar clip olmaz
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF8A65"
            />
          }
          ListHeaderComponent={
            favorites.length > 0 ? (
              <Text style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 8 }}>
                {favorites.length} tarif kaydedildi
              </Text>
            ) : null
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
          // compact prop kaldırıldı — tam kart kullanılıyor
          renderItem={({ item }) => <RecipeCard recipe={item} />}
        />
      ) : (
        // Diğer tab'lar için placeholder
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#9CA3AF', textAlign: 'center' }}>
            Bu içerik tipi yakında eklenecek
          </Text>
        </View>
      )}
    </View>
  );
}

