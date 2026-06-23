import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSWR from 'swr';
import Toast from 'react-native-toast-message';

import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/lib/constants';
import {
  getCircles,
  getDiscussions,
  getTopContributors,
  voteDiscussion,
  reportContent,
} from '../../src/services/community-service';
import { addFavoriteItem, removeFavoriteItem } from '../../src/services/favorites-service';
import { formatRelativeTime, decodeHtmlEntities, stripHtml, truncate } from '../../src/utils/helpers';
import type { Circle, Discussion, TopContributor } from '../../src/lib/types';

// ─── DiscussionCard ───────────────────────────────────────────────────────────

interface DiscussionCardProps {
  discussion: Discussion;
  onVote: (id: number, vote: 'up' | 'down') => void;
  onFavoriteToggle: (id: number, isFav: boolean) => void;
  onReport: (id: number) => void;
}

function DiscussionCard({ discussion, onVote, onFavoriteToggle, onReport }: DiscussionCardProps) {
  const { isAuthenticated } = useAuth();
  const title = decodeHtmlEntities(discussion.title);
  const excerpt = discussion.excerpt
    ? truncate(stripHtml(decodeHtmlEntities(discussion.excerpt)), 120)
    : '';
  const authorName = discussion.author?.display_name ?? discussion.author?.name ?? 'Anonim';
  const timeAgo = formatRelativeTime(discussion.created_at);
  const commentCount = discussion.answer_count ?? discussion.comment_count ?? 0;

  const handlePress = () => {
    router.push(`/topluluk/${discussion.slug}` as never);
  };

  const handleCirclePress = () => {
    if (discussion.circle?.slug) {
      router.push(`/topluluk/odak/${discussion.circle.slug}` as never);
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    onFavoriteToggle(discussion.id, discussion.is_favorite ?? false);
  };

  const handleMoreMenu = () => {
    Alert.alert('', '', [
      {
        text: 'Raporla',
        style: 'destructive',
        onPress: () => onReport(discussion.id),
      },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const handleVote = (vote: 'up' | 'down') => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    onVote(discussion.id, vote);
  };

  const upvoteCount = discussion.upvote_count ?? Math.max(0, discussion.vote_count ?? 0);
  const downvoteCount = discussion.downvote_count ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.97}
      onPress={handlePress}
    >
      {/* Header: avatar + author + time + menu */}
      <View style={styles.cardHeader}>
        <View style={styles.cardAuthorRow}>
          <Avatar uri={discussion.author?.avatar_url} name={authorName} size={36} />
          <View style={styles.cardAuthorInfo}>
            <Text style={styles.cardAuthorName}>{authorName}</Text>
            <Text style={styles.cardTime}>{timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleMoreMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>

      {/* Circle badge + expert badge */}
      <View style={styles.cardBadgeRow}>
        {discussion.circle && (
          <TouchableOpacity onPress={handleCirclePress} activeOpacity={0.75}>
            <View style={[styles.circleBadge, { backgroundColor: discussion.circle.color ? discussion.circle.color + '22' : '#FF8A6522' }]}>
              <Text style={[styles.circleBadgeText, { color: discussion.circle.color ?? COLORS.primary }]}>
                {discussion.circle.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        {(discussion.has_expert_answer || discussion.is_answered) && (
          <View style={styles.expertBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
            <Text style={styles.expertBadgeText}>Uzman Yanıtladı</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
      </TouchableOpacity>

      {/* Excerpt */}
      {excerpt ? (
        <Text style={styles.cardExcerpt} numberOfLines={3}>{excerpt}</Text>
      ) : null}

      {/* Footer: votes + comments + favorite */}
      <View style={styles.cardFooter}>
        {/* Upvote */}
        <TouchableOpacity
          style={[styles.voteButton, discussion.user_vote === 'up' && styles.voteButtonActive]}
          onPress={() => handleVote('up')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={discussion.user_vote === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
            size={16}
            color={discussion.user_vote === 'up' ? COLORS.primary : COLORS.gray[400]}
          />
          {upvoteCount > 0 && (
            <Text style={[styles.voteCount, discussion.user_vote === 'up' && styles.voteCountActive]}>
              {upvoteCount}
            </Text>
          )}
        </TouchableOpacity>

        {/* Downvote */}
        <TouchableOpacity
          style={[styles.voteButton, discussion.user_vote === 'down' && styles.voteButtonDownActive]}
          onPress={() => handleVote('down')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={discussion.user_vote === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
            size={16}
            color={discussion.user_vote === 'down' ? '#EF4444' : COLORS.gray[400]}
          />
          {downvoteCount > 0 && (
            <Text style={[styles.voteCount, discussion.user_vote === 'down' && styles.voteCountDown]}>
              {downvoteCount}
            </Text>
          )}
        </TouchableOpacity>

        {/* Comment count */}
        <TouchableOpacity style={styles.commentButton} onPress={handlePress} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.gray[400]} />
          <Text style={styles.commentCount}>{commentCount}</Text>
        </TouchableOpacity>

        {/* Favorite */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavorite}
          activeOpacity={0.7}
        >
          <Ionicons
            name={discussion.is_favorite ? 'heart' : 'heart-outline'}
            size={18}
            color={discussion.is_favorite ? '#EF4444' : COLORS.gray[400]}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── TopContributorCard ───────────────────────────────────────────────────────

function TopContributorCard({ contributor, rank }: { contributor: TopContributor; rank: number }) {
  const name = contributor.display_name ?? contributor.name;
  const rankEmoji = rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉';
  return (
    <View style={styles.contributorCard}>
      <Text style={styles.contributorRank}>{rankEmoji}</Text>
      <Avatar uri={contributor.avatar_url} name={name} size={42} />
      <Text style={styles.contributorName} numberOfLines={1}>{name}</Text>
      {contributor.is_expert && (
        <View style={styles.contributorExpertBadge}>
          <Text style={styles.contributorExpertText}>Uzman</Text>
        </View>
      )}
      {(contributor.answer_count ?? 0) > 0 && (
        <Text style={styles.contributorStat}>{contributor.answer_count} yanıt</Text>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CommunityHomeScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const [selectedCircle, setSelectedCircle] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: circles, isLoading: circlesLoading } = useSWR<Circle[]>(
    'community/circles',
    () => getCircles(),
  );

  const discussionKey = `community/discussions?circle=${selectedCircle ?? 'all'}&search=${searchQuery}`;
  const {
    data: discussionsData,
    isLoading: discussionsLoading,
    error: discussionsError,
    mutate: mutateDiscussions,
  } = useSWR(
    discussionKey,
    () => getDiscussions({
      circle_id: selectedCircle ?? undefined,
      search: searchQuery || undefined,
      per_page: 20,
    }),
    {
      onSuccess: (data) => {
        setDiscussions(data.discussions ?? []);
      },
    },
  );

  // sync state when SWR data arrives
  React.useEffect(() => {
    if (discussionsData) {
      setDiscussions(discussionsData.discussions ?? []);
    }
  }, [discussionsData]);

  const { data: topContributors } = useSWR<TopContributor[]>(
    'community/top-contributors',
    () => getTopContributors(3),
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((text: string) => {
    setSearchInput(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(text.trim());
    }, 500);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await mutateDiscussions();
    setRefreshing(false);
  }, [mutateDiscussions]);

  const handleVote = useCallback(async (discussionId: number, vote: 'up' | 'down') => {
    // Optimistic update
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id !== discussionId) return d;
        const wasVote = d.user_vote;
        let newUserVote: 'up' | 'down' | null = vote;
        let upDelta = 0;
        let downDelta = 0;

        if (wasVote === vote) {
          // removing same vote
          newUserVote = null;
          if (vote === 'up') upDelta = -1;
          else downDelta = -1;
        } else if (wasVote === null) {
          // adding new vote
          if (vote === 'up') upDelta = 1;
          else downDelta = 1;
        } else {
          // changing vote
          if (vote === 'up') { upDelta = 1; downDelta = -1; }
          else { upDelta = -1; downDelta = 1; }
        }

        return {
          ...d,
          user_vote: newUserVote,
          upvote_count: Math.max(0, (d.upvote_count ?? 0) + upDelta),
          downvote_count: Math.max(0, (d.downvote_count ?? 0) + downDelta),
        };
      }),
    );

    try {
      await voteDiscussion(discussionId, vote);
    } catch {
      // Revert on error
      await mutateDiscussions();
    }
  }, [mutateDiscussions]);

  const handleFavoriteToggle = useCallback(async (discussionId: number, isFav: boolean) => {
    // Optimistic update
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === discussionId ? { ...d, is_favorite: !isFav } : d,
      ),
    );

    try {
      if (isFav) {
        await removeFavoriteItem(discussionId, 'post');
      } else {
        await addFavoriteItem(discussionId, 'post');
      }
    } catch {
      // Revert on error
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId ? { ...d, is_favorite: isFav } : d,
        ),
      );
    }
  }, []);

  const handleReport = useCallback(async (discussionId: number) => {
    Alert.alert(
      'İçeriği Raporla',
      'Bu tartışmayı neden raporlamak istiyorsunuz?',
      [
        {
          text: 'Uygunsuz içerik',
          onPress: async () => {
            try {
              await reportContent('discussion', discussionId, 'inappropriate');
              Toast.show({ type: 'success', text1: 'Raporunuz iletildi.' });
            } catch {
              Toast.show({ type: 'error', text1: 'Raporlama başarısız.' });
            }
          },
        },
        {
          text: 'Spam',
          onPress: async () => {
            try {
              await reportContent('discussion', discussionId, 'spam');
              Toast.show({ type: 'success', text1: 'Raporunuz iletildi.' });
            } catch {
              Toast.show({ type: 'error', text1: 'Raporlama başarısız.' });
            }
          },
        },
        {
          text: 'Yanıltıcı bilgi',
          onPress: async () => {
            try {
              await reportContent('discussion', discussionId, 'misinformation');
              Toast.show({ type: 'success', text1: 'Raporunuz iletildi.' });
            } catch {
              Toast.show({ type: 'error', text1: 'Raporlama başarısız.' });
            }
          },
        },
        { text: 'İptal', style: 'cancel' },
      ],
    );
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  const isLoading = discussionsLoading && !discussions.length;
  const isEmpty = !discussionsLoading && discussions.length === 0 && !discussionsError;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Topluluk</Text>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => router.push('/topluluk/soru-sor' as never)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
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
            {/* ── Circle (Odak) filter chips ────────────────────────────────── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContent}
            >
              <TouchableOpacity
                style={[styles.chip, selectedCircle === null && styles.chipActive]}
                onPress={() => setSelectedCircle(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selectedCircle === null && styles.chipTextActive]}>
                  Tümü
                </Text>
              </TouchableOpacity>
              {!circlesLoading && (circles ?? []).map((circle) => (
                <TouchableOpacity
                  key={circle.id}
                  style={[styles.chip, selectedCircle === circle.id && styles.chipActive]}
                  onPress={() => setSelectedCircle(circle.id === selectedCircle ? null : circle.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, selectedCircle === circle.id && styles.chipTextActive]}>
                    {circle.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Search ────────────────────────────────────────────────────── */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.gray[400]} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tartışmalarda ara..."
                placeholderTextColor={COLORS.gray[400]}
                value={searchInput}
                onChangeText={handleSearchChange}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>

            {/* ── Top Contributors ──────────────────────────────────────────── */}
            {(topContributors ?? []).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Haftanın Anneleri 👑</Text>
                <View style={styles.contributorsRow}>
                  {(topContributors ?? []).slice(0, 3).map((contributor, index) => (
                    <TopContributorCard
                      key={contributor.id}
                      contributor={contributor}
                      rank={index + 1}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* ── Discussions header ────────────────────────────────────────── */}
            <View style={styles.discussionsHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCircle
                  ? (circles ?? []).find((c) => c.id === selectedCircle)?.name ?? 'Tartışmalar'
                  : 'Son Tartışmalar'}
              </Text>
            </View>

            {/* ── Loading state ─────────────────────────────────────────────── */}
            {isLoading && (
              <LoadingSpinner label="Tartışmalar yükleniyor..." />
            )}

            {/* ── Error state ───────────────────────────────────────────────── */}
            {discussionsError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Tartışmalar yüklenemedi. Lütfen tekrar deneyin.</Text>
                <TouchableOpacity onPress={() => mutateDiscussions()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Tekrar Dene</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {isEmpty && !isLoading && (
              <EmptyState
                icon="chatbubbles-outline"
                title="Henüz tartışma bulunmuyor."
                description={
                  selectedCircle || searchQuery
                    ? 'Bu filtre için tartışma bulunamadı.'
                    : 'İlk soruyu siz sorun!'
                }
                actionLabel="Soru Sor"
                onAction={() => router.push('/topluluk/soru-sor' as never)}
              />
            )}
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
        ListFooterComponent={
          <>
            {/* ── Community Rules ───────────────────────────────────────────── */}
            {discussions.length > 0 && (
              <View style={styles.rulesCard}>
                <View style={styles.rulesHeader}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.rulesTitle}>Topluluk Kuralları</Text>
                </View>
                <Text style={styles.rulesItem}>
                  {'1. '}Saygılı ve yapıcı bir dil kullanın.
                </Text>
                <Text style={styles.rulesItem}>
                  {'2. '}Kişisel tıbbi tavsiye yerine bilgi paylaşımı yapın.
                </Text>
                <Text style={styles.rulesItem}>
                  {'3. '}Çocukların gizliliğini koruyun, kişisel bilgi paylaşmayın.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/kullanim-kosullari' as never)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rulesLink}>Kullanıcı Sözleşmesini Okuyun →</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 100 }} />
          </>
        }
      />

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => router.push('/topluluk/soru-sor' as never)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  headerAction: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 120,
  },
  // Circle chips
  chipsScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  chipsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#fff',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: '#1F2937',
  },
  // Section
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  // Contributors
  contributorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contributorCard: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  contributorRank: {
    fontSize: 18,
    marginBottom: 2,
  },
  contributorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    maxWidth: 80,
  },
  contributorExpertBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  contributorExpertText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
  },
  contributorStat: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  // Discussions header
  discussionsHeader: {
    marginTop: 4,
  },
  // Discussion card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardAuthorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  cardAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  cardTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  circleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  circleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  expertBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardExcerpt: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    gap: 4,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  voteButtonActive: {
    backgroundColor: '#FFF0E8',
  },
  voteButtonDownActive: {
    backgroundColor: '#FEE2E2',
  },
  voteCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  voteCountActive: {
    color: COLORS.primary,
  },
  voteCountDown: {
    color: '#EF4444',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  commentCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  favoriteButton: {
    marginLeft: 'auto',
    padding: 6,
  },
  // Error
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Rules card
  rulesCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  rulesItem: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  rulesLink: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 8,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
