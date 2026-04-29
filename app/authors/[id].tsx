import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useSWR from 'swr';
import { getAuthor, getAuthorRecipes } from '../../src/services/author-service';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Avatar } from '../../src/components/ui/Avatar';
import { RecipeCard } from '../../src/components/recipes/RecipeCard';
import { DetailHeader } from '../../src/components/ui/DetailHeader';
import { COLORS } from '../../src/lib/constants';

export default function AuthorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const authorId = Number(id);

  const { data: author, isLoading: authorLoading } = useSWR(
    id ? `author-${id}` : null,
    () => getAuthor(authorId),
  );

  const { data: recipesData, isLoading: recipesLoading } = useSWR(
    id ? `author-recipes-${id}` : null,
    () => getAuthorRecipes(authorId, 1, 20),
  );

  if (authorLoading) {
    return <LoadingSpinner fullScreen label="Yükleniyor..." />;
  }

  if (!author) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={{ color: '#374151', fontWeight: '700', fontSize: 18, marginTop: 16 }}>
          Yazar bulunamadı
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recipes = recipesData?.items ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header card */}
        <View
          style={{
            backgroundColor: '#fff',
            paddingTop: 80,
            paddingBottom: 24,
            paddingHorizontal: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Avatar uri={author.avatar_url} name={author.name} size={88} />

          <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.dark, marginTop: 14, textAlign: 'center' }}>
            {author.name}
          </Text>

          {author.is_expert ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#F0FDF4', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Ionicons name="shield-checkmark" size={14} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#16A34A' }}>Uzman</Text>
            </View>
          ) : null}

          {author.bio ? (
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22, marginTop: 12, textAlign: 'center' }}>
              {author.bio}
            </Text>
          ) : null}
        </View>

        {/* Recipes */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 16 }}>
            {author.name} tarafından tarif{recipes.length > 0 ? `ler (${recipes.length})` : 'ler'}
          </Text>

          {recipesLoading ? (
            <LoadingSpinner label="Tarifler yükleniyor..." />
          ) : recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard key={String(recipe.id)} recipe={recipe} />
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="restaurant-outline" size={40} color="#D1D5DB" />
              <Text style={{ color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>
                Henüz tarif bulunamadı.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <DetailHeader transparent />
    </View>
  );
}
