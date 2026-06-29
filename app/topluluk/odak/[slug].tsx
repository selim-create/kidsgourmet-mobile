import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSWR from 'swr';
import Toast from 'react-native-toast-message';

import { DiscussionCard } from '../../../src/components/community/DiscussionCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { useAuth } from '../../../src/contexts/AuthContext';
import { COLORS } from '../../../src/lib/constants';
import type { Circle, Discussion } from '../../../src/lib/types';
import { addFavoriteItem, removeFavoriteItem } from '../../../src/services/favorites-service';
import {
  followCircle,
  getCircles,
  getDiscussions,
  reportContent,
  unfollowCircle,
  voteDiscussion,
} from '../../../src/services/community-service';
import { faToIonicon } from '../../../src/utils/iconHelpers';

import { AppIcon } from '../../../src/components/ui/AppIcon';
type VoteKind = 'up' | 'down';

function getVoteUpdate(currentVote: VoteKind | null | undefined, nextVote: VoteKind) {
  let newUserVote: VoteKind | null = nextVote;
  let upDelta = 0;
  let downDelta = 0;

  if (currentVote === nextVote) {
    newUserVote = null;
    if (nextVote === 'up') upDelta = -1;
    else downDelta = -1;
  } else if (!currentVote) {
    if (nextVote === 'up') upDelta = 1;
    else downDelta = 1;
  } else if (nextVote === 'up') {
    upDelta = 1;
    downDelta = -1;
  } else {
    upDelta = -1;
    downDelta = 1;
  }

  return { newUserVote, upDelta, downDelta };
}

export default function CircleDetailScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followSubmitting, setFollowSubmitting] = useState(false);

  const {
    data: circles,
    isLoading: circlesLoading,
    error: circlesError,
  } = useSWR<Circle[]>('community/circles', () => getCircles());

  const circle = useMemo(
    () => (circles ?? []).find((item) => item.slug === slug),
    [circles, slug],
  );

  useEffect(() => {
    setDiscussions([]);
    setIsFollowing(circle?.is_following ?? false);
  }, [slug, circle?.is_following]);

  const {
    data: discussionsData,
    isLoading: discussionsLoading,
    error: discussionsError,
    mutate: mutateDiscussions,
  } = useSWR(
    circle ? `community/circle/${circle.id}/discussions` : null,
    () => getDiscussions({ circle_id: circle!.id, per_page: 20 }),
    {
      onSuccess: (data) => {
        setDiscussions(data.discussions ?? []);
      },
    },
  );

  useEffect(() => {
    if (discussionsData) {
      setDiscussions(discussionsData.discussions ?? []);
    }
  }, [discussionsData]);

  const requireAuth = useCallback(() => {
    router.push('/(auth)/login' as never);
  }, []);

  const handleVote = useCallback(async (discussionId: number, vote: VoteKind) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    setDiscussions((prev) =>
      prev.map((discussion) => {
        if (discussion.id !== discussionId) return discussion;
        const { newUserVote, upDelta, downDelta } = getVoteUpdate(discussion.user_vote, vote);
        return {
          ...discussion,
          user_vote: newUserVote,
          upvote_count: Math.max(0, (discussion.upvote_count ?? 0) + upDelta),
          downvote_count: Math.max(0, (discussion.downvote_count ?? 0) + downDelta),
        };
      }),
    );

    try {
      await voteDiscussion(discussionId, vote);
    } catch {
      await mutateDiscussions();
    }
  }, [isAuthenticated, mutateDiscussions, requireAuth]);

  const handleFavoriteToggle = useCallback(async (discussionId: number, isFavoriteValue: boolean) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    setDiscussions((prev) =>
      prev.map((discussion) =>
        discussion.id === discussionId
          ? { ...discussion, is_favorite: !isFavoriteValue }
          : discussion,
      ),
    );

    try {
      if (isFavoriteValue) {
        await removeFavoriteItem(discussionId, 'post');
      } else {
        await addFavoriteItem(discussionId, 'post');
      }
    } catch {
      setDiscussions((prev) =>
        prev.map((discussion) =>
          discussion.id === discussionId
            ? { ...discussion, is_favorite: isFavoriteValue }
            : discussion,
        ),
      );
    }
  }, [isAuthenticated, requireAuth]);

  const handleReport = useCallback((discussionId: number) => {
    const submitReport = async (reason: string) => {
      try {
        await reportContent('discussion', discussionId, reason);
        Toast.show({ type: 'success', text1: 'Raporunuz iletildi.' });
      } catch {
        Toast.show({ type: 'error', text1: 'Raporlama başarısız.' });
      }
    };

    Alert.alert(
      'İçeriği Raporla',
      'Bu tartışmayı neden raporlamak istiyorsunuz?',
      [
        { text: 'Uygunsuz içerik', onPress: () => submitReport('inappropriate') },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Yanıltıcı bilgi', onPress: () => submitReport('misinformation') },
        { text: 'İptal', style: 'cancel' },
      ],
    );
  }, []);

  const handleFollowToggle = useCallback(async () => {
    if (!circle) return;
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowSubmitting(true);

    try {
      if (nextState) {
        await followCircle(circle.id);
        Toast.show({ type: 'success', text1: 'Odak takip edildi' });
      } else {
        await unfollowCircle(circle.id);
        Toast.show({ type: 'success', text1: 'Odak takipten çıkarıldı' });
      }
    } catch {
      setIsFollowing(!nextState);
      Toast.show({ type: 'error', text1: 'İşlem başarısız oldu' });
    } finally {
      setFollowSubmitting(false);
    }
  }, [circle, isAuthenticated, isFollowing, requireAuth]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await mutateDiscussions();
    setRefreshing(false);
  }, [mutateDiscussions]);

  const color = circle?.color_code ?? circle?.color ?? COLORS.primary;
  const iconName = faToIonicon(circle?.icon_name ?? circle?.icon ?? '');
  const askQuestionRoute = circle
    ? (`/(tabs)/topluluk/soru-sor?circle=${circle.id}` as never)
    : ('/(tabs)/topluluk/soru-sor' as never);

  if (circlesLoading && !circle) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/topluluk' as never)} style={styles.headerBackButton}>
            <AppIcon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Odak</Text>
          <View style={styles.headerBackButton} />
        </View>
        <LoadingSpinner label="Odak yükleniyor..." />
      </View>
    );
  }

  if ((!circlesLoading && !circle) || circlesError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/topluluk' as never)} style={styles.headerBackButton}>
            <AppIcon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Odak</Text>
          <View style={styles.headerBackButton} />
        </View>
        <EmptyState
          icon="people-outline"
          title="Odak bulunamadı"
          actionLabel="← Topluluğa Dön"
          onAction={() => router.push('/(tabs)/topluluk' as never)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/topluluk' as never)} style={styles.headerBackButton}>
          <AppIcon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{circle?.name ?? 'Odak'}</Text>
        <View style={styles.headerBackButton} />
      </View>

      <FlatList
        data={discussions}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <View style={[styles.heroIcon, { backgroundColor: `${color}22` }]}>
                <AppIcon name={String(iconName)} size={26} color={color} />
              </View>
              <Text style={styles.heroTitle}>{circle?.name}</Text>
              {circle?.description ? (
                <Text style={styles.heroDescription}>{circle.description}</Text>
              ) : null}

              {typeof circle?.discussion_count === 'number' ? (
                <View style={styles.heroStats}>
                  <View style={styles.heroStatChip}>
                    <AppIcon name="chatbubbles-outline" size={16} color={COLORS.gray[500]} />
                    <Text style={styles.heroStatText}>{circle.discussion_count} tartışma</Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing ? styles.followingButton : styles.followPrimaryButton,
                ]}
                onPress={handleFollowToggle}
                disabled={followSubmitting}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing ? styles.followingButtonText : styles.followPrimaryButtonText,
                  ]}
                >
                  {followSubmitting
                    ? 'Yükleniyor...'
                    : isFollowing
                      ? 'Takipten Çık'
                      : 'Takip Et'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.askCard}
              onPress={() => router.push(askQuestionRoute)}
              activeOpacity={0.85}
            >
              <View style={styles.askCardIcon}>
                <AppIcon name="create-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.askCardText}>
                {circle ? `${circle.name} odağında bir soru sor...` : 'Bu odakta bir soru sor...'}
              </Text>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tartışmalar</Text>
            </View>

            {discussionsLoading && discussions.length === 0 ? (
              <LoadingSpinner label="Tartışmalar yükleniyor..." />
            ) : null}

            {discussionsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Tartışmalar yüklenemedi. Lütfen tekrar deneyin.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => mutateDiscussions()}>
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!discussionsLoading && discussions.length === 0 && !discussionsError ? (
              <EmptyState
                icon="chatbubbles-outline"
                title="Bu odakta henüz tartışma bulunmuyor."
                description="İlk soruyu siz sorun!"
                actionLabel="Soru Sor"
                onAction={() => router.push(askQuestionRoute)}
              />
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <DiscussionCard
            discussion={item}
            onVote={handleVote}
            onFavoriteToggle={handleFavoriteToggle}
            onReport={handleReport}
          />
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => router.push(askQuestionRoute)}
        activeOpacity={0.85}
      >
        <AppIcon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBackButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    marginHorizontal: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  heroDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 16,
  },
  heroStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroStatText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  followButton: {
    minWidth: 148,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  followPrimaryButton: {
    backgroundColor: COLORS.primary,
  },
  followingButton: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  followPrimaryButtonText: {
    color: '#fff',
  },
  followingButtonText: {
    color: COLORS.primary,
  },
  askCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    padding: 16,
    gap: 12,
  },
  askCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  askCardText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
});
