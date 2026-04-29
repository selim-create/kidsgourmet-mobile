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
  return api.get<Comment[]>(API_ENDPOINTS.COMMENTS_BY_POST(postId));
}

export async function addBlogComment(
  postId: number,
  content: string,
): Promise<Comment> {
  const response = await api.post<{ success: boolean; message: string; comment: Comment }>(
    API_ENDPOINTS.COMMENTS,
    { post_id: postId, content },
  );
  return response.comment;
}
