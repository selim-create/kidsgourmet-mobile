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
  } catch {
    // Fall back to WordPress native comments API
    try {
      return await api.get<Comment[]>(`/wp/v2/comments?post=${postId}`);
    } catch {
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
