import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSWR from 'swr';
import Toast from 'react-native-toast-message';

import { DiscussionCard } from '../../src/components/community/DiscussionCard';
import { Avatar } from '../../src/components/ui/Avatar';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useAuth } from '../../src/contexts/AuthContext';
import { ApiError } from '../../src/lib/api';
import { COLORS } from '../../src/lib/constants';
import type { Discussion, DiscussionComment } from '../../src/lib/types';
import { addFavoriteItem, removeFavoriteItem } from '../../src/services/favorites-service';
import {
  addComment,
  getDiscussionBySlug,
  getDiscussionComments,
  getDiscussions,
  reportContent,
  voteComment,
  voteDiscussion,
} from '../../src/services/community-service';
import {
  decodeHtmlEntities,
  ensureCommentDefaults,
  ensureDiscussionDefaults,
  formatRelativeTime,
  stripHtml,
} from '../../src/utils/helpers';

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

function normalizeComment(comment: DiscussionComment) {
  return ensureCommentDefaults(comment);
}

export default function DiscussionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [relatedTopics, setRelatedTopics] = useState<Discussion[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReplyId, setSubmittingReplyId] = useState<number | null>(null);

  useEffect(() => {
    setDiscussion(null);
    setComments([]);
    setCommentText('');
    setReplyingToId(null);
    setReplyText('');
    setRelatedTopics([]);
  }, [slug]);

  const {
    data: discussionData,
    error: discussionError,
    isLoading: discussionLoading,
    mutate: mutateDiscussion,
  } = useSWR(
    slug ? `community/discussion/${slug}` : null,
    () => getDiscussionBySlug(slug),
    {
      onSuccess: (data) => {
        setDiscussion(ensureDiscussionDefaults(data));
      },
    },
  );

  useEffect(() => {
    if (discussionData) {
      setDiscussion(ensureDiscussionDefaults(discussionData));
    }
  }, [discussionData]);

  const discussionId = discussion?.id;

  const {
    data: commentsData,
    error: commentsError,
    isLoading: commentsLoading,
    mutate: mutateComments,
  } = useSWR(
    discussionId ? `community/discussion/${discussionId}/comments` : null,
    () => getDiscussionComments(discussionId!),
    {
      onSuccess: (data) => {
        setComments(data.map(normalizeComment));
      },
    },
  );

  useEffect(() => {
    if (commentsData) {
      setComments(commentsData.map(normalizeComment));
    }
  }, [commentsData]);

  const relatedCircleId = discussion?.circle_id ?? discussion?.circle?.id;
  const { data: relatedData } = useSWR(
    relatedCircleId ? `community/discussions/related/${relatedCircleId}` : null,
    () => getDiscussions({ circle_id: relatedCircleId, per_page: 4 }),
  );

  const repliesByParent = useMemo(() => {
    return comments.reduce<Record<number, DiscussionComment[]>>((acc, comment) => {
      const parentId = comment.parent_id ?? 0;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(comment);
      return acc;
    }, {});
  }, [comments]);

  const rootComments = repliesByParent[0] ?? [];
  const expertComments = rootComments.filter(
    (comment) => comment.is_expert_comment && (comment.parent_id ?? 0) === 0,
  );
  const otherComments = rootComments.filter(
    (comment) => !comment.is_expert_comment && (comment.parent_id ?? 0) === 0,
  );

  useEffect(() => {
    setRelatedTopics(
      (relatedData?.discussions ?? [])
        .filter((item) => item.id !== discussion?.id)
        .slice(0, 3),
    );
  }, [discussion?.id, relatedData]);

  const bodyText = useMemo(() => {
    const rawContent = discussion?.content || discussion?.excerpt || '';
    return stripHtml(decodeHtmlEntities(rawContent));
  }, [discussion?.content, discussion?.excerpt]);

  const requireAuth = useCallback(() => {
    router.push('/(auth)/login' as never);
  }, []);

  const showReportAlert = useCallback((contentType: 'discussion' | 'comment', contentId: number) => {
    Alert.alert(
      'İçeriği Raporla',
      'Bu içeriği neden raporlamak istiyorsunuz?',
      [
        {
          text: 'Uygunsuz içerik',
          onPress: async () => {
            try {
              await reportContent(contentType, contentId, 'inappropriate');
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
              await reportContent(contentType, contentId, 'spam');
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
              await reportContent(contentType, contentId, 'misinformation');
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

  const handleDiscussionVote = useCallback(async (discussionIdValue: number, vote: VoteKind) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    setDiscussion((prev) => {
      if (!prev || prev.id !== discussionIdValue) return prev;
      const { newUserVote, upDelta, downDelta } = getVoteUpdate(prev.user_vote, vote);
      return {
        ...prev,
        user_vote: newUserVote,
        upvote_count: Math.max(0, (prev.upvote_count ?? 0) + upDelta),
        downvote_count: Math.max(0, (prev.downvote_count ?? 0) + downDelta),
      };
    });
    setRelatedTopics((prev) =>
      prev.map((item) => {
        if (item.id !== discussionIdValue) return item;
        const { newUserVote, upDelta, downDelta } = getVoteUpdate(item.user_vote, vote);
        return {
          ...item,
          user_vote: newUserVote,
          upvote_count: Math.max(0, (item.upvote_count ?? 0) + upDelta),
          downvote_count: Math.max(0, (item.downvote_count ?? 0) + downDelta),
        };
      }),
    );

    try {
      await voteDiscussion(discussionIdValue, vote);
    } catch {
      await mutateDiscussion();
      setRelatedTopics(
        (relatedData?.discussions ?? [])
          .filter((item) => item.id !== discussion?.id)
          .slice(0, 3),
      );
    }
  }, [discussion?.id, isAuthenticated, mutateDiscussion, relatedData?.discussions, requireAuth]);

  const handleFavoriteToggle = useCallback(async (discussionIdValue: number, isFavorite: boolean) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    setDiscussion((prev) =>
      prev && prev.id === discussionIdValue
        ? { ...prev, is_favorite: !isFavorite }
        : prev,
    );
    setRelatedTopics((prev) =>
      prev.map((item) =>
        item.id === discussionIdValue
          ? { ...item, is_favorite: !isFavorite }
          : item,
      ),
    );

    try {
      if (isFavorite) {
        await removeFavoriteItem(discussionIdValue, 'post');
      } else {
        await addFavoriteItem(discussionIdValue, 'post');
      }
    } catch {
      setDiscussion((prev) =>
        prev && prev.id === discussionIdValue
          ? { ...prev, is_favorite: isFavorite }
          : prev,
      );
      setRelatedTopics((prev) =>
        prev.map((item) =>
          item.id === discussionIdValue
            ? { ...item, is_favorite: isFavorite }
            : item,
        ),
      );
    }
  }, [isAuthenticated, requireAuth]);

  const handleCommentVote = useCallback(async (commentId: number, vote: VoteKind) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id !== commentId) return comment;
        const { newUserVote, upDelta, downDelta } = getVoteUpdate(comment.user_vote, vote);
        return {
          ...comment,
          user_vote: newUserVote,
          upvote_count: Math.max(0, (comment.upvote_count ?? 0) + upDelta),
          downvote_count: Math.max(0, (comment.downvote_count ?? 0) + downDelta),
        };
      }),
    );

    try {
      await voteComment(commentId, vote);
    } catch {
      await mutateComments();
    }
  }, [isAuthenticated, mutateComments, requireAuth]);

  const handleSubmitComment = useCallback(async () => {
    if (!discussion?.id) return;
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment(discussion.id, commentText.trim());
      setCommentText('');
      Toast.show({ type: 'success', text1: 'Yorumunuz eklendi' });
      await Promise.all([mutateComments(), mutateDiscussion()]);
    } catch {
      Toast.show({ type: 'error', text1: 'Yorum eklenemedi' });
    } finally {
      setSubmittingComment(false);
    }
  }, [commentText, discussion?.id, isAuthenticated, mutateComments, mutateDiscussion, requireAuth]);

  const handleSubmitReply = useCallback(async (parentId: number) => {
    if (!discussion?.id) return;
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    if (!replyText.trim()) return;

    setSubmittingReplyId(parentId);
    try {
      await addComment(discussion.id, replyText.trim(), parentId);
      setReplyText('');
      setReplyingToId(null);
      Toast.show({ type: 'success', text1: 'Yanıtınız eklendi' });
      await Promise.all([mutateComments(), mutateDiscussion()]);
    } catch {
      Toast.show({ type: 'error', text1: 'Yanıt eklenemedi' });
    } finally {
      setSubmittingReplyId(null);
    }
  }, [discussion?.id, isAuthenticated, mutateComments, mutateDiscussion, replyText, requireAuth]);

  const renderComment = useCallback((comment: DiscussionComment, depth = 0): React.ReactNode => {
    const authorName = comment.author?.display_name ?? comment.author?.name ?? 'Anonim';
    const commentTextValue = stripHtml(decodeHtmlEntities(comment.content));
    const timeAgo = formatRelativeTime(comment.created_at);
    const isExpert = comment.is_expert_comment || comment.is_expert_answer;
    const upvoteCount = comment.upvote_count ?? Math.max(0, comment.vote_count ?? 0);
    const downvoteCount = comment.downvote_count ?? 0;
    const replies = repliesByParent[comment.id] ?? [];

    return (
      <View
        key={comment.id}
        style={[
          styles.commentCard,
          depth > 0 && styles.replyCard,
          depth > 1 && { marginLeft: Math.min(depth * 14, 28) },
        ]}
      >
        <View style={styles.commentHeader}>
          <View style={styles.commentAuthorRow}>
            <Avatar uri={comment.author?.avatar_url} name={authorName} size={34} />
            <View style={styles.commentAuthorInfo}>
              <View style={styles.commentNameRow}>
                <Text style={styles.commentAuthorName}>{authorName}</Text>
                {isExpert && (
                  <View style={styles.commentExpertBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                    <Text style={styles.commentExpertBadgeText}>Uzman Cevabı</Text>
                  </View>
                )}
              </View>
              <Text style={styles.commentTime}>{timeAgo}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => showReportAlert('comment', comment.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.commentContent}>{commentTextValue}</Text>

        <View style={styles.commentFooter}>
          <TouchableOpacity
            style={[styles.voteChip, comment.user_vote === 'up' && styles.voteChipUpActive]}
            onPress={() => handleCommentVote(comment.id, 'up')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={comment.user_vote === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
              size={15}
              color={comment.user_vote === 'up' ? COLORS.primary : COLORS.gray[400]}
            />
            {upvoteCount > 0 ? (
              <Text style={[styles.voteChipText, comment.user_vote === 'up' && styles.voteChipTextUp]}>
                {upvoteCount}
              </Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.voteChip, comment.user_vote === 'down' && styles.voteChipDownActive]}
            onPress={() => handleCommentVote(comment.id, 'down')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={comment.user_vote === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
              size={15}
              color={comment.user_vote === 'down' ? '#EF4444' : COLORS.gray[400]}
            />
            {downvoteCount > 0 ? (
              <Text style={[styles.voteChipText, comment.user_vote === 'down' && styles.voteChipTextDown]}>
                {downvoteCount}
              </Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => {
              if (!isAuthenticated) {
                requireAuth();
                return;
              }
              setReplyingToId(comment.id);
              setReplyText('');
            }}
          >
            <Ionicons name="return-down-back-outline" size={15} color={COLORS.gray[500]} />
            <Text style={styles.replyButtonText}>Yanıtla</Text>
          </TouchableOpacity>
        </View>

        {replyingToId === comment.id && (
          <View style={styles.inlineReplyBox}>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Yanıtınızı yazın..."
              placeholderTextColor={COLORS.gray[400]}
              multiline
              textAlignVertical="top"
              style={styles.inlineReplyInput}
            />
            <View style={styles.inlineReplyActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setReplyingToId(null);
                  setReplyText('');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, !replyText.trim() && styles.disabledButton]}
                onPress={() => handleSubmitReply(comment.id)}
                disabled={!replyText.trim() || submittingReplyId === comment.id}
              >
                <Text style={styles.sendButtonText}>
                  {submittingReplyId === comment.id ? 'Gönderiliyor...' : 'Gönder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {replies.length > 0 ? (
          <View style={styles.repliesContainer}>
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </View>
        ) : null}
      </View>
    );
  }, [
    handleCommentVote,
    handleSubmitReply,
    isAuthenticated,
    repliesByParent,
    replyingToId,
    replyText,
    requireAuth,
    showReportAlert,
    submittingReplyId,
  ]);

  const isNotFound = discussionError instanceof ApiError && discussionError.status === 404;

  if ((discussionLoading && !discussion) || !slug) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/topluluk' as never)} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tartışma</Text>
          <View style={styles.headerBackButton} />
        </View>
        <LoadingSpinner label="Tartışma yükleniyor..." />
      </View>
    );
  }

  if (isNotFound) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/topluluk' as never)} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tartışma</Text>
          <View style={styles.headerBackButton} />
        </View>
        <EmptyState
          icon="chatbubble-ellipses-outline"
          title="Tartışma bulunamadı"
          actionLabel="← Topluluğa Dön"
          onAction={() => router.push('/topluluk' as never)}
        />
      </View>
    );
  }

  if (discussionError && !discussion) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/topluluk' as never)} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tartışma</Text>
          <View style={styles.headerBackButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tartışma yüklenemedi. Lütfen tekrar deneyin.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => mutateDiscussion()}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const title = discussion ? decodeHtmlEntities(discussion.title) : 'Tartışma';
  const answerCount = discussion?.answer_count ?? discussion?.comment_count ?? rootComments.length;
  const circleColor = discussion?.circle?.color_code ?? discussion?.circle?.color ?? COLORS.primary;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/topluluk' as never)} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.headerBackButton} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
      >
        <View style={styles.content}>
          <View style={styles.discussionCard}>
            <View style={styles.discussionHeader}>
              <View style={styles.discussionAuthorRow}>
                <Avatar
                  uri={discussion?.author?.avatar_url}
                  name={discussion?.author?.display_name ?? discussion?.author?.name ?? 'Anonim'}
                  size={40}
                />
                <View style={styles.discussionAuthorInfo}>
                  <Text style={styles.discussionAuthorName}>
                    {discussion?.author?.display_name ?? discussion?.author?.name ?? 'Anonim'}
                  </Text>
                  <Text style={styles.discussionMeta}>
                    {formatRelativeTime(discussion?.created_at)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => discussion && showReportAlert('discussion', discussion.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>

            {discussion?.circle ? (
              <TouchableOpacity
                style={[styles.circleTag, { backgroundColor: `${circleColor}22` }]}
                onPress={() => router.push(`/topluluk/odak/${discussion.circle?.slug}` as never)}
                activeOpacity={0.75}
              >
                <Text style={[styles.circleTagText, { color: circleColor }]}>
                  {discussion.circle.name}
                </Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.discussionTitle}>{title}</Text>
            {bodyText ? <Text style={styles.discussionBody}>{bodyText}</Text> : null}

            <View style={styles.discussionFooter}>
              <TouchableOpacity
                style={[styles.voteChip, discussion?.user_vote === 'up' && styles.voteChipUpActive]}
                onPress={() => discussion && handleDiscussionVote(discussion.id, 'up')}
              >
                <Ionicons
                  name={discussion?.user_vote === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
                  size={16}
                  color={discussion?.user_vote === 'up' ? COLORS.primary : COLORS.gray[400]}
                />
                {(discussion?.upvote_count ?? 0) > 0 ? (
                  <Text style={[styles.voteChipText, discussion?.user_vote === 'up' && styles.voteChipTextUp]}>
                    {discussion?.upvote_count}
                  </Text>
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.voteChip, discussion?.user_vote === 'down' && styles.voteChipDownActive]}
                onPress={() => discussion && handleDiscussionVote(discussion.id, 'down')}
              >
                <Ionicons
                  name={discussion?.user_vote === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
                  size={16}
                  color={discussion?.user_vote === 'down' ? '#EF4444' : COLORS.gray[400]}
                />
                {(discussion?.downvote_count ?? 0) > 0 ? (
                  <Text style={[styles.voteChipText, discussion?.user_vote === 'down' && styles.voteChipTextDown]}>
                    {discussion?.downvote_count}
                  </Text>
                ) : null}
              </TouchableOpacity>

              <View style={styles.answerCountChip}>
                <Ionicons name="chatbubble-outline" size={16} color={COLORS.gray[400]} />
                <Text style={styles.answerCountText}>{answerCount}</Text>
              </View>

              <TouchableOpacity
                style={styles.favoriteAction}
                onPress={() => discussion && handleFavoriteToggle(discussion.id, discussion.is_favorite ?? false)}
              >
                <Ionicons
                  name={discussion?.is_favorite ? 'heart' : 'heart-outline'}
                  size={19}
                  color={discussion?.is_favorite ? '#EF4444' : COLORS.gray[400]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {commentsLoading && comments.length === 0 ? (
            <LoadingSpinner label="Yanıtlar yükleniyor..." />
          ) : null}

          {commentsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Yanıtlar yüklenemedi. Lütfen tekrar deneyin.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => mutateComments()}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {expertComments.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uzman Cevapları</Text>
              {expertComments.map((comment) => renderComment(comment))}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diğer Cevaplar ({otherComments.length})</Text>
            {otherComments.length > 0 ? (
              otherComments.map((comment) => renderComment(comment))
            ) : (
              <View style={styles.emptyRepliesCard}>
                <Text style={styles.emptyRepliesText}>Henüz cevap yok. İlk yorumu siz yazın!</Text>
              </View>
            )}
          </View>

          {relatedTopics.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benzer Konular</Text>
              {relatedTopics.map((item) => (
                <DiscussionCard
                  key={item.id}
                  discussion={item}
                  onVote={handleDiscussionVote}
                  onFavoriteToggle={handleFavoriteToggle}
                  onReport={(id) => showReportAlert('discussion', id)}
                  style={styles.relatedCard}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.bottomComposer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Bir cevap yazın..."
          placeholderTextColor={COLORS.gray[400]}
          multiline
          textAlignVertical="top"
          style={styles.bottomInput}
          onFocus={() => {
            if (!isAuthenticated) {
              requireAuth();
            }
          }}
        />
        <TouchableOpacity
          style={[styles.bottomSendButton, (!commentText.trim() || submittingComment) && styles.disabledButton]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || submittingComment}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  content: {
    paddingVertical: 16,
  },
  discussionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  discussionAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discussionAuthorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  discussionAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  discussionMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  circleTag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  circleTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  discussionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 10,
  },
  discussionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  discussionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 16,
    paddingTop: 14,
  },
  voteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
  },
  voteChipUpActive: {
    backgroundColor: '#FFF0E8',
  },
  voteChipDownActive: {
    backgroundColor: '#FEE2E2',
  },
  voteChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  voteChipTextUp: {
    color: COLORS.primary,
  },
  voteChipTextDown: {
    color: '#EF4444',
  },
  answerCountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
  },
  answerCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  favoriteAction: {
    marginLeft: 'auto',
    padding: 6,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  replyCard: {
    marginLeft: 18,
    borderLeftWidth: 2,
    borderLeftColor: '#F3F4F6',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAuthorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  commentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  commentExpertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  commentExpertBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  inlineReplyBox: {
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
  },
  inlineReplyInput: {
    minHeight: 84,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  inlineReplyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  sendButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  repliesContainer: {
    marginTop: 10,
  },
  relatedCard: {
    marginHorizontal: 0,
  },
  emptyRepliesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  emptyRepliesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomComposer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  bottomInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bottomSendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.5,
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
});
