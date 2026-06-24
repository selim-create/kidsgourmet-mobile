import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../lib/constants';
import { decodeHtmlEntities, formatRelativeTime, stripHtml, truncate } from '../../utils/helpers';
import type { Discussion } from '../../lib/types';

interface DiscussionCardProps {
  discussion: Discussion;
  onVote: (id: number, vote: 'up' | 'down') => void;
  onFavoriteToggle: (id: number, isFav: boolean) => void;
  onReport: (id: number) => void;
  style?: StyleProp<ViewStyle>;
}

function getProfileSlug(user: { id?: number; slug?: string }): string | null {
  if (user.slug && user.slug.trim().length > 0) return user.slug;
  if (typeof user.id === 'number') return String(user.id);
  return null;
}

export function DiscussionCard({
  discussion,
  onVote,
  onFavoriteToggle,
  onReport,
  style,
}: DiscussionCardProps) {
  const { isAuthenticated } = useAuth();
  const title = decodeHtmlEntities(discussion.title);
  const excerpt = discussion.excerpt
    ? truncate(stripHtml(decodeHtmlEntities(discussion.excerpt)), 120)
    : '';
  const authorName = discussion.author?.display_name ?? discussion.author?.name ?? 'Anonim';
  const timeAgo = formatRelativeTime(discussion.created_at);
  const commentCount = discussion.answer_count ?? discussion.comment_count ?? 0;
  const circleColor = discussion.circle?.color_code ?? discussion.circle?.color ?? COLORS.primary;
  const authorSlug = getProfileSlug(discussion.author ?? {});
  const authorProfileHref = authorSlug
    ? (discussion.author?.is_expert ? `/uzman/${authorSlug}` : `/profil/${authorSlug}`)
    : null;

  const handlePress = () => {
    router.push(`/(tabs)/topluluk/${discussion.slug}` as never);
  };

  const handleCirclePress = () => {
    if (discussion.circle?.slug) {
      router.push(`/(tabs)/topluluk/odak/${discussion.circle.slug}` as never);
    }
  };

  const handleAuthorPress = () => {
    if (!authorProfileHref) return;
    router.push(authorProfileHref as never);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login' as never);
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
      router.push('/(auth)/login' as never);
      return;
    }
    onVote(discussion.id, vote);
  };

  const upvoteCount = discussion.upvote_count ?? Math.max(0, discussion.vote_count ?? 0);
  const downvoteCount = discussion.downvote_count ?? 0;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.97}
      onPress={handlePress}
    >
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.cardAuthorRow}
          onPress={handleAuthorPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`${authorName} profiline git`}
        >
          <Avatar uri={discussion.author?.avatar_url} name={authorName} size={36} />
          <View style={styles.cardAuthorInfo}>
            <View style={styles.cardAuthorNameRow}>
              <Text style={styles.cardAuthorName}>{authorName}</Text>
              {discussion.author?.is_expert ? (
                <View style={styles.authorExpertBadge}>
                  <Text style={styles.authorExpertBadgeText}>Uzman</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.cardTime}>{timeAgo}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMoreMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBadgeRow}>
        {discussion.circle && (
          <TouchableOpacity onPress={handleCirclePress} activeOpacity={0.75}>
            <View style={[styles.circleBadge, { backgroundColor: `${circleColor}22` }]}>
              <Text style={[styles.circleBadgeText, { color: circleColor }]}>
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

      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
      </TouchableOpacity>

      {excerpt ? (
        <Text style={styles.cardExcerpt} numberOfLines={3}>{excerpt}</Text>
      ) : null}

      <View style={styles.cardFooter}>
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

        <TouchableOpacity style={styles.commentButton} onPress={handlePress} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.gray[400]} />
          <Text style={styles.commentCount}>{commentCount}</Text>
        </TouchableOpacity>

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

const styles = StyleSheet.create({
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
  cardAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorExpertBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#DCFCE7',
  },
  authorExpertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
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
});
