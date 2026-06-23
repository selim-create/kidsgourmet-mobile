import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/ui/Avatar';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { usePublicProfile } from '../../../src/hooks/usePublicProfile';
import { faToIonicon } from '../../../src/utils/iconHelpers';

export default function PublicProfileScreen() {
  const insets = useSafeAreaInsets();
  const { username } = useLocalSearchParams<{ username: string }>();

  const { data: profile, isLoading, error } = usePublicProfile(username);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <View
          style={{ paddingTop: insets.top }}
          className="bg-white border-b border-gray-100"
        >
          <View className="flex-row items-center px-4 py-3">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#455A64" />
            </TouchableOpacity>
            <Text className="text-dark font-bold text-lg flex-1">Profil</Text>
          </View>
        </View>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <View
          style={{ paddingTop: insets.top }}
          className="bg-white border-b border-gray-100"
        >
          <View className="flex-row items-center px-4 py-3">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#455A64" />
            </TouchableOpacity>
            <Text className="text-dark font-bold text-lg flex-1">Profil</Text>
          </View>
        </View>
        <EmptyState
          icon="person-outline"
          title="Kullanıcı Bulunamadı"
          description="Bu profil mevcut değil veya erişilemiyor."
          actionLabel="Topluluğa Dön"
          onAction={() => router.push('/topluluk' as never)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-100"
      >
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#455A64" />
          </TouchableOpacity>
          <Text className="text-dark font-bold text-lg flex-1">Profil</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={['#FB923C', '#FDBA74']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 32 }}
        >
          <View className="items-center pt-8 px-5 pb-2">
            <Avatar
              uri={profile.avatar_url}
              name={profile.display_name}
              size={120}
            />
            <Text className="text-white text-2xl font-bold mt-4 text-center">
              {profile.display_name}
            </Text>
            {profile.parent_role ? (
              <View className="mt-2 px-3 py-1 rounded-full bg-white/20">
                <Text className="text-white text-sm font-medium">
                  {profile.parent_role}
                </Text>
              </View>
            ) : null}

            {/* Stats */}
            <View className="flex-row mt-5 gap-6">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {profile.stats.question_count}
                </Text>
                <Text className="text-white/80 text-xs mt-0.5">Soru</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {profile.stats.approved_comments}
                </Text>
                <Text className="text-white/80 text-xs mt-0.5">Yorum</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {profile.badges.length}
                </Text>
                <Text className="text-white/80 text-xs mt-0.5">Rozet</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View className="px-4 -mt-4">
          {/* Badges */}
          {profile.badges.length > 0 ? (
            <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <Text className="text-dark font-bold text-base mb-3">
                Rozetler
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {profile.badges.map((badge, idx) => (
                  <View
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200"
                  >
                    <Text className="text-orange-600 text-sm font-medium">
                      {badge}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Recent Questions */}
          <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <Text className="text-dark font-bold text-base mb-3">
              Son Sorular
            </Text>
            {profile.recent_questions && profile.recent_questions.length > 0 ? (
              profile.recent_questions.map((question) => (
                <TouchableOpacity
                  key={question.id}
                  onPress={() =>
                    router.push(`/topluluk/soru/${question.slug}` as never)
                  }
                  className="flex-row items-start py-3 border-b border-gray-50 last:border-0"
                >
                  {/* Circle icon */}
                  {question.circle ? (
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: question.circle.color_code + '33',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                        flexShrink: 0,
                      }}
                    >
                      <Ionicons
                        name={faToIonicon(question.circle.icon) as any}
                        size={18}
                        color={question.circle.color_code}
                      />
                    </View>
                  ) : null}
                  <View className="flex-1">
                    <Text
                      className="text-dark font-medium text-sm mb-0.5"
                      numberOfLines={2}
                    >
                      {question.title}
                    </Text>
                    <Text
                      className="text-gray-400 text-xs mb-1"
                      numberOfLines={2}
                    >
                      {question.excerpt}
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="chatbubble-outline"
                          size={12}
                          color="#9CA3AF"
                        />
                        <Text className="text-gray-400 text-xs">
                          {question.comment_count}
                        </Text>
                      </View>
                      {question.expert_answered ? (
                        <View className="px-2 py-0.5 rounded-full bg-green-100">
                          <Text className="text-green-600 text-xs font-medium">
                            Uzman Cevapladı
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#D1D5DB"
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-6 items-center">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={32}
                  color="#D1D5DB"
                />
                <Text className="text-gray-400 text-sm mt-2">
                  Henüz Soru Yok
                </Text>
              </View>
            )}
          </View>

          {/* Privacy Notice */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start gap-2">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#3B82F6"
                style={{ marginTop: 1 }}
              />
              <Text className="text-blue-700 text-xs flex-1 leading-5">
                Bu profilde çocuk isimleri, fotoğrafları veya kişisel bilgiler
                asla gösterilmez. Tüm kullanıcı verileri KVKK kapsamında
                korunmaktadır.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
