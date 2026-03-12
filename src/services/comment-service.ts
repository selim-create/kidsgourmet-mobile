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
