import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useExperts } from '../../src/hooks/useExperts';
import type { ExpertPublicProfile, SocialLinks } from '../../src/lib/types';

import { AppIcon } from '../../src/components/ui/AppIcon';
function SocialIconButton({
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
      onPress={(e) => {
        e.stopPropagation();
        Linking.openURL(url);
      }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
      }}
      activeOpacity={0.7}
    >
      <AppIcon name={String(icon)} size={15} color={color} />
    </TouchableOpacity>
  );
}

function ExpertCard({ expert }: { expert: ExpertPublicProfile }) {
  const links: SocialLinks = expert.social_links ?? {};
  const hasLinks =
    links.instagram ||
    links.facebook ||
    links.twitter ||
    links.linkedin ||
    links.youtube ||
    links.website;

  const statsToShow = [
    {
      label: 'Tarif',
      value: expert.stats.total_recipes,
    },
    {
      label: 'Blog',
      value: expert.stats.total_blog_posts ?? expert.stats.total_posts ?? 0,
    },
    {
      label: 'Cevap',
      value: expert.stats.total_answers,
    },
  ].filter((s) => s.value > 0);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/uzman/${expert.username}` as never)}
      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4"
      activeOpacity={0.85}
    >
      {/* Card top — green gradient */}
      <LinearGradient
        colors={['#ECFDF5', '#D1FAE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' }}
      >
        {/* Avatar with verified badge */}
        <View style={{ position: 'relative', marginBottom: 10 }}>
          <Avatar
            uri={expert.avatar_url}
            name={expert.display_name}
            size={80}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#22C55E',
              borderWidth: 2,
              borderColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="checkmark" size={11} color="#fff" />
          </View>
        </View>
        <Text className="text-dark font-bold text-base text-center">
          {expert.display_name}
        </Text>
        {expert.expertise && expert.expertise.length > 0 ? (
          <Text className="text-gray-500 text-xs mt-0.5 text-center">
            {expert.expertise.join(' • ')}
          </Text>
        ) : null}
      </LinearGradient>

      <View className="p-4">
        {/* Biography */}
        {expert.biography ? (
          <Text
            className="text-gray-500 text-sm leading-5 mb-3"
            numberOfLines={3}
          >
            {expert.biography}
          </Text>
        ) : null}

        {/* Social links */}
        {hasLinks ? (
          <View className="flex-row mb-3">
            <SocialIconButton
              icon="logo-instagram"
              color="#EC4899"
              url={links.instagram}
            />
            <SocialIconButton
              icon="logo-facebook"
              color="#2563EB"
              url={links.facebook}
            />
            <SocialIconButton
              icon="logo-twitter"
              color="#000000"
              url={links.twitter}
            />
            <SocialIconButton
              icon="logo-linkedin"
              color="#2563EB"
              url={links.linkedin}
            />
            <SocialIconButton
              icon="logo-youtube"
              color="#EF4444"
              url={links.youtube}
            />
            <SocialIconButton
              icon="globe-outline"
              color="#6B7280"
              url={links.website}
            />
          </View>
        ) : null}

        {/* Stats */}
        {statsToShow.length > 0 ? (
          <View className="flex-row gap-4 mb-3">
            {statsToShow.map((stat) => (
              <View key={stat.label} className="items-center">
                <Text className="text-green-600 font-bold text-base">
                  {stat.value}
                </Text>
                <Text className="text-gray-400 text-xs">{stat.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* CTA */}
        <TouchableOpacity
          onPress={() => router.push(`/uzman/${expert.username}` as never)}
          className="flex-row items-center justify-center py-2.5 rounded-xl bg-green-50"
        >
          <Text className="text-green-600 font-semibold text-sm mr-1">
            Profili Görüntüle
          </Text>
          <AppIcon name="arrow-forward" size={14} color="#16A34A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ExpertsListScreen() {
  const insets = useSafeAreaInsets();
  const { data: experts, isLoading, error, mutate } = useExperts();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-100"
      >
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <AppIcon name="arrow-back" size={24} color="#455A64" />
          </TouchableOpacity>
          <Text className="text-dark font-bold text-lg flex-1 text-center">
            Uzmanlarımız
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)' as never)}>
            <AppIcon name="home-outline" size={22} color="#455A64" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View className="bg-white px-5 pt-6 pb-5 mb-2 items-center border-b border-gray-50">
          <Text className="text-dark font-bold text-2xl text-center mb-1">
            KidsGourmet{' '}
            <Text className="text-green-500">Uzmanları</Text>
          </Text>
          <Text className="text-gray-500 text-sm text-center leading-5 max-w-xs">
            Çocuk beslenmesi ve sağlığı konusunda deneyimli uzmanlarımızla
            tanışın.
          </Text>
        </View>

        <View className="px-4 pt-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <AppIcon
                  name="alert-circle-outline"
                  size={18}
                  color="#EF4444"
                />
                <Text className="text-red-600 font-medium ml-2">
                  Yüklenirken hata oluştu
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => mutate()}
                className="mt-2 bg-red-100 rounded-lg py-2 items-center"
              >
                <Text className="text-red-600 font-medium text-sm">
                  Tekrar Dene
                </Text>
              </TouchableOpacity>
            </View>
          ) : experts && experts.length > 0 ? (
            experts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))
          ) : (
            <View className="py-12 items-center">
              <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <AppIcon name="people-outline" size={36} color="#9CA3AF" />
              </View>
              <Text className="text-dark text-lg font-semibold text-center mb-1">
                Henüz uzman eklenmemiş
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Uzman ekibi yakında burada görünecek.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
