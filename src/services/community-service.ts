import api, { ApiError } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
  Circle,
  Discussion,
  DiscussionsResponse,
  DiscussionComment,
  FeedResponse,
  CreateDiscussionRequest,
  CreateDiscussionResponse,
  TopContributor,
  VoteResponse,
} from '../lib/types';
import { ensureCommentDefaults, ensureDiscussionDefaults } from '../utils/helpers';

function normalizeCircle(circle: Circle): Circle {
  const resolvedColor = circle.color_code ?? circle.color;
  const resolvedIcon = circle.icon ?? circle.icon_name;
  return {
    ...circle,
    color: resolvedColor,
    color_code: resolvedColor,
    icon: resolvedIcon,
    icon_name: circle.icon_name ?? resolvedIcon,
  };
}

function normalizeDiscussion(discussion: Discussion): Discussion {
  return ensureDiscussionDefaults({
    ...discussion,
    circle: discussion.circle ? normalizeCircle(discussion.circle) : discussion.circle,
    circle_id: discussion.circle_id ?? discussion.circle?.id,
  });
}

function normalizeComment(comment: DiscussionComment): DiscussionComment {
  return ensureCommentDefaults({
    ...comment,
    is_expert_comment: comment.is_expert_comment ?? comment.is_expert_answer,
  });
}

// ─── Circles ──────────────────────────────────────────────────────────────────

export async function getCircles(): Promise<Circle[]> {
  const data = await api.get<Circle[] | { circles: Circle[] }>(
    API_ENDPOINTS.CIRCLES,
    { skipAuth: true },
  );
  if (Array.isArray(data)) return data.map(normalizeCircle);
  if (data && typeof data === 'object' && 'circles' in data) return data.circles.map(normalizeCircle);
  return [];
}

export async function getUserCircles(): Promise<Circle[]> {
  const data = await api.get<Circle[] | { circles: Circle[] }>(
    API_ENDPOINTS.USER_CIRCLES,
  );
  if (Array.isArray(data)) return data.map(normalizeCircle);
  if (data && typeof data === 'object' && 'circles' in data) return data.circles.map(normalizeCircle);
  return [];
}

export async function updateUserCircles(circleIds: number[]): Promise<void> {
  await api.post<unknown>(API_ENDPOINTS.USER_CIRCLES, { circle_ids: circleIds });
}

export async function followCircle(circleId: number): Promise<void> {
  await api.post<unknown>(API_ENDPOINTS.CIRCLE_FOLLOW(circleId));
}

export async function unfollowCircle(circleId: number): Promise<void> {
  await api.post<unknown>(API_ENDPOINTS.CIRCLE_UNFOLLOW(circleId));
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export interface DiscussionFilters {
  circle_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function getDiscussions(
  filters: DiscussionFilters = {},
): Promise<DiscussionsResponse> {
  const params = new URLSearchParams();
  if (filters.circle_id) params.set('circle_id', String(filters.circle_id));
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.per_page) params.set('per_page', String(filters.per_page));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);

  const query = params.toString();
  const endpoint = query
    ? `${API_ENDPOINTS.DISCUSSIONS}?${query}`
    : API_ENDPOINTS.DISCUSSIONS;

  const data = await api.get<DiscussionsResponse | Discussion[]>(endpoint, {
    skipAuth: true,
  });

  if (Array.isArray(data)) {
    return {
      discussions: data.map(normalizeDiscussion),
      total: data.length,
      page: filters.page ?? 1,
      per_page: filters.per_page ?? 20,
      total_pages: 1,
    };
  }

  return {
    ...data,
    discussions: (data.discussions ?? []).map(normalizeDiscussion),
  } as DiscussionsResponse;
}

export async function getDiscussionById(id: number): Promise<Discussion> {
  const data = await api.get<Discussion>(API_ENDPOINTS.DISCUSSION_BY_ID(id), {
    skipAuth: true,
  });
  return normalizeDiscussion(data);
}

export async function getDiscussionBySlug(slug: string): Promise<Discussion> {
  const response = await api.get<{ discussions: Discussion[]; total: number; pages: number; current_page: number }>(
    API_ENDPOINTS.DISCUSSION_BY_SLUG(slug),
    { skipAuth: true },
  );
  const discussion = response.discussions?.[0];
  if (!discussion) {
    throw new ApiError(`Discussion not found: ${slug}`, 404);
  }
  return normalizeDiscussion(discussion);
}

export async function getDiscussionComments(
  discussionId: number,
): Promise<DiscussionComment[]> {
  const data = await api.get<DiscussionComment[] | { comments: DiscussionComment[] }>(
    API_ENDPOINTS.DISCUSSION_COMMENTS(discussionId),
    { skipAuth: true },
  );
  if (Array.isArray(data)) return data.map(normalizeComment);
  if (data && typeof data === 'object' && 'comments' in data) return data.comments.map(normalizeComment);
  return [];
}

export async function addComment(
  discussionId: number,
  content: string,
  parentId?: number,
): Promise<DiscussionComment> {
  return api.post<DiscussionComment>(
    API_ENDPOINTS.DISCUSSION_COMMENTS(discussionId),
    { content, parent_id: parentId },
  );
}

export async function createDiscussion(
  data: CreateDiscussionRequest,
): Promise<CreateDiscussionResponse> {
  return api.post<CreateDiscussionResponse>(API_ENDPOINTS.DISCUSSIONS, data);
}

export async function getUserDiscussions(): Promise<Discussion[]> {
  const data = await api.get<Discussion[] | DiscussionsResponse>(
    API_ENDPOINTS.USER_DISCUSSIONS,
  );
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'discussions' in data)
    return (data as DiscussionsResponse).discussions;
  return [];
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function getPersonalizedFeed(
  page = 1,
  perPage = 20,
): Promise<FeedResponse> {
  const data = await api.get<FeedResponse | Discussion[]>(
    `${API_ENDPOINTS.FEED}?page=${page}&per_page=${perPage}`,
  );
  if (Array.isArray(data)) {
    return {
      discussions: data,
      total: data.length,
      page,
      per_page: perPage,
      total_pages: 1,
    };
  }
  return data as FeedResponse;
}

// ─── Top Contributors ─────────────────────────────────────────────────────────

export async function getTopContributors(limit = 5): Promise<TopContributor[]> {
  const data = await api.get<TopContributor[] | { contributors: TopContributor[] }>(
    `${API_ENDPOINTS.TOP_CONTRIBUTORS}?limit=${limit}`,
    { skipAuth: true },
  );
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'contributors' in data)
    return data.contributors;
  return [];
}

// ─── Voting ───────────────────────────────────────────────────────────────────

export async function voteDiscussion(
  discussionId: number,
  vote: 'up' | 'down',
): Promise<VoteResponse> {
  return api.post<VoteResponse>(API_ENDPOINTS.DISCUSSION_VOTE(discussionId), {
    vote,
  });
}

export async function voteComment(
  commentId: number,
  vote: 'up' | 'down',
): Promise<VoteResponse> {
  return api.post<VoteResponse>(API_ENDPOINTS.COMMENT_VOTE(commentId), {
    vote,
  });
}

// ─── Report ───────────────────────────────────────────────────────────────────

export async function reportContent(
  contentType: 'discussion' | 'comment',
  contentId: number,
  reason: string,
): Promise<void> {
  await api.post<unknown>(API_ENDPOINTS.COMMUNITY_REPORT, {
    content_type: contentType,
    content_id: contentId,
    reason,
  });
}
