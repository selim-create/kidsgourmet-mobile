import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Comment } from '../lib/types';

export async function getRecipeComments(recipeId: number): Promise<Comment[]> {
  return api.get<Comment[]>(API_ENDPOINTS.RECIPE_COMMENTS(recipeId));
}

export async function addComment(
  recipeId: number,
  content: string,
): Promise<Comment> {
  return api.post<Comment>(API_ENDPOINTS.RECIPE_COMMENTS(recipeId), { content });
}

export async function deleteComment(commentId: number): Promise<void> {
  return api.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}`);
}

export async function getBlogComments(postId: number): Promise<Comment[]> {
  try {
    return await api.get<Comment[]>(`/kg/v1/posts/${postId}/comments`);
  } catch (primaryError) {
    // Fall back to WordPress native comments API
    if (__DEV__) {
      console.warn(`[comments] kg endpoint failed for post ${postId}, trying wp/v2:`, primaryError);
    }
    try {
      return await api.get<Comment[]>(`/wp/v2/comments?post=${postId}`);
    } catch (fallbackError) {
      if (__DEV__) {
        console.warn(`[comments] wp/v2 fallback also failed for post ${postId}:`, fallbackError);
      }
      return [];
    }
  }
}

export async function addBlogComment(
  postId: number,
  content: string,
): Promise<Comment> {
  return api.post<Comment>(`/kg/v1/posts/${postId}/comments`, { content });
}
