import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Avatar } from '../../../src/components/ui/Avatar';
import { DetailPageHeader } from '../../../src/components/ui/DetailPageHeader';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { useExpertPublicProfile } from '../../../src/hooks/useExpertProfile';
import { faToIonicon } from '../../../src/utils/iconHelpers';
import type { SocialLinks } from '../../../src/lib/types';

import { AppIcon } from '../../../src/components/ui/AppIcon';
const PAGE_SIZE = 6;

function SocialButton({
  icon,
  color,
  url,
}: {
  icon: string;
  color: string;
  url?: string;
}) {
  if (!url) return null;
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(url)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
      }}
      activeOpacity={0.7}
    >
      <AppIcon name={String(icon)} size={18} color={color} />
    </TouchableOpacity>
  );
}

function SocialLinks({ links }: { links?: SocialLinks }) {
  if (!links) return null;
  const hasAny =
    links.instagram ||
    links.facebook ||
    links.twitter ||
    links.linkedin ||
    links.youtube ||
    links.website;
  if (!hasAny) return null;

  return (
    <View className="flex-row flex-wrap mt-3">
      <SocialButton
        icon="logo-instagram"
        color="#EC4899"
        url={links.instagram}
      />
      <SocialButton
        icon="logo-facebook"
        color="#2563EB"
        url={links.facebook}
      />
      <SocialButton icon="logo-twitter" color="#000000" url={links.twitter} />
      <SocialButton icon="logo-linkedin" color="#2563EB" url={links.linkedin} />
      <SocialButton icon="logo-youtube" color="#EF4444" url={links.youtube} />
      <SocialButton icon="globe-outline" color="#6B7280" url={links.website} />
    </View>
  );
}

const TABS = ['Tarifler', 'Blog Yazıları', 'Cevapları', 'Soruları'] as const;
type Tab = (typeof TABS)[number];

export default function ExpertProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('Tarifler');
  const [recipesLimit, setRecipesLimit] = useState(PAGE_SIZE);
  const [postsLimit, setPostsLimit] = useState(PAGE_SIZE);
  const [answersLimit, setAnswersLimit] = useState(PAGE_SIZE);
  const [questionsLimit, setQuestionsLimit] = useState(PAGE_SIZE);

  const { data: profile, isLoading, error } = useExpertPublicProfile(username);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <DetailPageHeader title="Uzman Profili" />
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <DetailPageHeader title="Uzman Profili" />
        <EmptyState
          icon="person-outline"
          title="Kullanıcı Bulunamadı"
          description="Bu uzman profili mevcut değil veya erişilemiyor."
          actionLabel="Topluluğa Dön"
          onAction={() => router.push('/(tabs)/topluluk' as never)}
        />
      </View>
    );
  }

  const tabCounts: Record<Tab, number> = {
    Tarifler: profile.recipes?.length ?? 0,
    'Blog Yazıları': profile.blog_posts?.length ?? 0,
    Cevapları: profile.answered_questions?.length ?? 0,
    Soruları: profile.asked_questions?.length ?? 0,
  };

  const recipes = (profile.recipes ?? []).slice(0, recipesLimit);
  const posts = (profile.blog_posts ?? []).slice(0, postsLimit);
  const answers = (profile.answered_questions ?? []).slice(0, answersLimit);
  const questions = (profile.asked_questions ?? []).slice(0, questionsLimit);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      <DetailPageHeader title="Uzman Profili" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={['#9333EA', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 24, paddingBottom: 48 }}
        >
          <View className="items-center px-5">
            {/* Avatar with verified badge */}
            <View style={{ position: 'relative', marginBottom: 12 }}>
              <Avatar
                uri={profile.avatar_url}
                name={profile.display_name}
                size={120}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#22C55E',
                  borderWidth: 3,
                  borderColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name="checkmark" size={14} color="#fff" />
              </View>
            </View>

            <Text className="text-white text-2xl font-bold text-center">
              {profile.display_name}
            </Text>
            <Text className="text-white/70 text-sm mt-0.5">
              @{profile.username}
            </Text>

            {/* Expertise chips */}
            {profile.expertise && profile.expertise.length > 0 ? (
              <View className="flex-row flex-wrap justify-center gap-2 mt-3">
                {profile.expertise.map((tag, idx) => (
                  <View
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/20"
                  >
                    <Text className="text-white text-xs font-medium">{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Social links */}
            <View className="flex-row justify-center mt-3">
              <SocialLinks links={profile.social_links} />
              {profile.show_email && profile.email ? (
                <SocialButton
                  icon="mail-outline"
                  color="#9CA3AF"
                  url={`mailto:${profile.email}`}
                />
              ) : null}
            </View>
          </View>
        </LinearGradient>

        <View className="px-4">
          {/* Stats cards — overlapping hero */}
          <View
            className="flex-row gap-3 -mt-8 mb-4"
          >
            {[
              { label: 'Tarif', value: profile.stats.total_recipes },
              {
                label: 'Blog',
                value:
                  profile.stats.total_blog_posts ?? profile.stats.total_posts ?? 0,
              },
              { label: 'Cevap', value: profile.stats.total_answers },
              { label: 'Soru', value: profile.stats.total_questions },
            ].map((stat) => (
              <View
                key={stat.label}
                className="flex-1 bg-white rounded-xl shadow-sm items-center py-3"
              >
                <Text className="text-purple-700 text-xl font-bold">
                  {stat.value}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Biography */}
          {profile.biography ? (
            <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <Text className="text-dark font-bold text-base mb-2">
                Hakkında
              </Text>
              <Text className="text-gray-600 text-sm leading-6">
                {profile.biography}
              </Text>
            </View>
          ) : null}

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            <View className="flex-row gap-2 pr-4">
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`flex-row items-center px-4 py-2 rounded-full ${
                    activeTab === tab ? 'bg-purple-100' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeTab === tab ? 'text-purple-700' : 'text-gray-500'
                    }`}
                  >
                    {tab}
                  </Text>
                  {tabCounts[tab] > 0 ? (
                    <View
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full ${
                        activeTab === tab ? 'bg-purple-200' : 'bg-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          activeTab === tab
                            ? 'text-purple-700'
                            : 'text-gray-500'
                        }`}
                      >
                        {tabCounts[tab]}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Tab content */}
          {activeTab === 'Tarifler' && (
            <View className="mb-4">
              {recipes.length > 0 ? (
                <>
                  {recipes.map((recipe) => (
                    <TouchableOpacity
                      key={recipe.id}
                      onPress={() =>
                        router.push(`/recipes/${recipe.slug}` as never)
                      }
                      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-3"
                    >
                      {recipe.image ? (
                        <Image
                          source={{ uri: recipe.image }}
                          style={{ width: '100%', aspectRatio: 16 / 9 }}
                          contentFit="cover"
                        />
                      ) : null}
                      <View className="p-3">
                        {recipe.age_group ? (
                          <View
                            className="self-start px-2 py-0.5 rounded-full mb-1"
                            style={{
                              backgroundColor:
                                (recipe.age_group_color ?? '#FB923C') + '33',
                            }}
                          >
                            <Text
                              style={{
                                color: recipe.age_group_color ?? '#FB923C',
                                fontSize: 11,
                              }}
                            >
                              {recipe.age_group}
                            </Text>
                          </View>
                        ) : null}
                        <Text
                          className="text-dark font-semibold text-sm"
                          numberOfLines={2}
                        >
                          {recipe.title}
                        </Text>
                        {recipe.prep_time ? (
                          <View className="flex-row items-center mt-1 gap-1">
                            <AppIcon
                              name="time-outline"
                              size={12}
                              color="#9CA3AF"
                            />
                            <Text className="text-gray-400 text-xs">
                              {recipe.prep_time}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                  {(profile.recipes?.length ?? 0) > recipesLimit ? (
                    <TouchableOpacity
                      onPress={() => setRecipesLimit((l) => l + PAGE_SIZE)}
                      className="bg-purple-100 rounded-xl py-3 items-center mb-2"
                    >
                      <Text className="text-purple-600 font-medium text-sm">
                        +{(profile.recipes?.length ?? 0) - recipesLimit} daha
                        göster
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : (
                <View className="py-8 items-center">
                  <AppIcon
                    name="restaurant-outline"
                    size={32}
                    color="#D1D5DB"
                  />
                  <Text className="text-gray-400 text-sm mt-2">
                    Tarif bulunamadı
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Blog Yazıları' && (
            <View className="mb-4">
              {posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      onPress={() =>
                        router.push(`/blog/${post.slug}` as never)
                      }
                      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-3"
                    >
                      <View className="flex-row p-3 gap-3">
                        {post.image ? (
                          <Image
                            source={{ uri: post.image }}
                            style={{ width: 96, height: 96, borderRadius: 12 }}
                            contentFit="cover"
                          />
                        ) : null}
                        <View className="flex-1 justify-center">
                          {post.category ? (
                            <View className="self-start px-2 py-0.5 rounded-full bg-purple-100 mb-1">
                              <Text className="text-purple-600 text-xs">
                                {post.category}
                              </Text>
                            </View>
                          ) : null}
                          <Text
                            className="text-dark font-semibold text-sm"
                            numberOfLines={3}
                          >
                            {post.title}
                          </Text>
                          {post.read_time ? (
                            <View className="flex-row items-center mt-1 gap-1">
                              <AppIcon
                                name="time-outline"
                                size={12}
                                color="#9CA3AF"
                              />
                              <Text className="text-gray-400 text-xs">
                                {post.read_time}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {(profile.blog_posts?.length ?? 0) > postsLimit ? (
                    <TouchableOpacity
                      onPress={() => setPostsLimit((l) => l + PAGE_SIZE)}
                      className="bg-purple-100 rounded-xl py-3 items-center mb-2"
                    >
                      <Text className="text-purple-600 font-medium text-sm">
                        +{(profile.blog_posts?.length ?? 0) - postsLimit} daha
                        göster
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : (
                <View className="py-8 items-center">
                  <AppIcon name="document-outline" size={32} color="#D1D5DB" />
                  <Text className="text-gray-400 text-sm mt-2">
                    Blog yazısı bulunamadı
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Cevapları' && (
            <View className="mb-4">
              {answers.length > 0 ? (
                <>
                  {answers.map((answer) => (
                    <TouchableOpacity
                      key={answer.id}
                      onPress={() =>
                        router.push(`/(tabs)/topluluk/${answer.slug}` as never)
                      }
                      className="bg-white rounded-2xl shadow-sm p-4 mb-3"
                    >
                      <Text
                        className="text-dark font-semibold text-sm mb-1"
                        numberOfLines={2}
                      >
                        {answer.title}
                      </Text>
                      <Text
                        className="text-gray-500 text-xs mb-2"
                        numberOfLines={2}
                      >
                        {answer.answer_excerpt}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {formatDate(answer.answered_at)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {(profile.answered_questions?.length ?? 0) > answersLimit ? (
                    <TouchableOpacity
                      onPress={() => setAnswersLimit((l) => l + PAGE_SIZE)}
                      className="bg-purple-100 rounded-xl py-3 items-center mb-2"
                    >
                      <Text className="text-purple-600 font-medium text-sm">
                        +
                        {(profile.answered_questions?.length ?? 0) -
                          answersLimit}{' '}
                        daha göster
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : (
                <View className="py-8 items-center">
                  <AppIcon
                    name="chatbubble-outline"
                    size={32}
                    color="#D1D5DB"
                  />
                  <Text className="text-gray-400 text-sm mt-2">
                    Cevaplanan soru bulunamadı
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Soruları' && (
            <View className="mb-4">
              {questions.length > 0 ? (
                <>
                  {questions.map((q) => (
                    <TouchableOpacity
                      key={q.id}
                      onPress={() =>
                        router.push(`/(tabs)/topluluk/${q.slug}` as never)
                      }
                      className="bg-white rounded-2xl shadow-sm p-4 mb-3"
                    >
                      {q.circle ? (
                        <View className="flex-row items-center mb-2">
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              backgroundColor: q.circle.color_code + '33',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 6,
                            }}
                          >
                            <AppIcon
                              name={String(faToIonicon(q.circle.icon))}
                              size={12}
                              color={q.circle.color_code}
                            />
                          </View>
                          <Text
                            style={{ color: q.circle.color_code }}
                            className="text-xs font-medium"
                          >
                            {q.circle.name}
                          </Text>
                        </View>
                      ) : null}
                      <Text
                        className="text-dark font-semibold text-sm mb-1"
                        numberOfLines={2}
                      >
                        {q.title}
                      </Text>
                      <Text
                        className="text-gray-500 text-xs mb-2"
                        numberOfLines={2}
                      >
                        {q.excerpt}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1">
                          <AppIcon
                            name="chatbubble-outline"
                            size={12}
                            color="#9CA3AF"
                          />
                          <Text className="text-gray-400 text-xs">
                            {q.comment_count}
                          </Text>
                        </View>
                        <Text className="text-gray-400 text-xs">
                          {formatDate(q.created_at)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {(profile.asked_questions?.length ?? 0) > questionsLimit ? (
                    <TouchableOpacity
                      onPress={() => setQuestionsLimit((l) => l + PAGE_SIZE)}
                      className="bg-purple-100 rounded-xl py-3 items-center mb-2"
                    >
                      <Text className="text-purple-600 font-medium text-sm">
                        +
                        {(profile.asked_questions?.length ?? 0) -
                          questionsLimit}{' '}
                        daha göster
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : (
                <View className="py-8 items-center">
                  <AppIcon
                    name="help-circle-outline"
                    size={32}
                    color="#D1D5DB"
                  />
                  <Text className="text-gray-400 text-sm mt-2">
                    Soru bulunamadı
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
