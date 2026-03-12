import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { RecipeCard } from '../../src/components/recipes/RecipeCard';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { router } from 'expo-router';

export default function FavoritesScreen() {
  const { favorites, isLoading, reload } = useFavorites();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-light">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100">
        <Text className="text-dark text-2xl font-bold">Favorilerim</Text>
        {favorites.length > 0 ? (
          <Text className="text-gray-400 text-sm mt-0.5">
            {favorites.length} tarif kaydedildi
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen label="Favoriler yükleniyor..." />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
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
          renderItem={({ item }) => <RecipeCard recipe={item} />}
        />
      )}
    </SafeAreaView>
  );
}
