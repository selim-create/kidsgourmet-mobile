/**
 * Returns the appropriate navigation route for an author/user.
 * Experts go to /uzman/[handle], regular users to /profil/[handle].
 */
export function getAuthorRoute(author: {
  is_expert?: boolean;
  slug?: string;
  username?: string;
}): string | null {
  const handle = author.username ?? author.slug;
  if (!handle) return null;
  return author.is_expert ? `/uzman/${handle}` : `/profil/${handle}`;
}
