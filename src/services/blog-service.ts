import api from '../lib/api';
import type { BlogPost, BlogCategory, PaginatedResponse, SponsorData, EmbedData, Tag } from '../lib/types';

// ─── WP REST API Response Types ────────────────────────────────────────────────

interface WPPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  comment_count?: number;
  sponsor_data?: SponsorData;
  acf?: { sponsor_data?: SponsorData };
  meta?: { sponsor_data?: SponsorData };
  embedded_content?: EmbedData[];
  _embedded?: {
    author?: Array<{ id: number; name: string; avatar_urls?: Record<string, string>; description?: string }>;
    'wp:featuredmedia'?: Array<{ source_url: string; media_details?: { sizes?: { medium?: { source_url: string } } } }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string; description?: string }>>;
  };
}

// ─── Transform Helpers ─────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .trim();
}

function transformWPPost(post: WPPost): BlogPost {
  const authorRaw = post._embedded?.author?.[0];
  const mediaRaw = post._embedded?.['wp:featuredmedia']?.[0];
  const termsRaw = post._embedded?.['wp:term']?.[0];
  const tagsRaw = post._embedded?.['wp:term']?.[1];

  const featuredImage =
    mediaRaw?.source_url ??
    mediaRaw?.media_details?.sizes?.medium?.source_url;

  const author = authorRaw
    ? {
        id: authorRaw.id,
        name: authorRaw.name,
        avatar_url: authorRaw.avatar_urls?.['96'] ?? authorRaw.avatar_urls?.['48'],
        bio: authorRaw.description,
      }
    : undefined;

  const categories: BlogCategory[] | undefined = termsRaw?.map((term) => ({
    id: term.id,
    name: term.name,
    slug: term.slug,
    description: term.description,
  }));

  const tags: Tag[] | undefined = tagsRaw?.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
  }));

  const sponsor_data = post.sponsor_data ?? post.acf?.sponsor_data ?? post.meta?.sponsor_data;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title.rendered,
    excerpt: stripHtml(post.excerpt.rendered),
    content: post.content.rendered,
    featured_image: featuredImage,
    thumbnail: featuredImage,
    author,
    categories,
    tags,
    created_at: post.date,
    updated_at: post.modified,
    sponsor_data,
    comment_count: post.comment_count ?? 0,
    embedded_content: post.embedded_content,
  };
}

// ─── Service Functions ─────────────────────────────────────────────────────────

export async function getBlogPosts(
  page = 1,
  perPage = 10,
  category?: string,
): Promise<PaginatedResponse<BlogPost>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    _embed: '1',
  });
  if (category) params.set('categories', category);

  const { data, headers } = await api.getWithHeaders<WPPost[]>(
    `/wp/v2/posts?${params.toString()}`,
    { skipAuth: true },
  );

  const total = parseInt(headers['x-wp-total'] ?? '0', 10);
  const totalPages = parseInt(headers['x-wp-totalpages'] ?? '1', 10);

  return {
    items: data.map(transformWPPost),
    total,
    page,
    per_page: perPage,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const data = await api.get<WPPost[]>(
    `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`,
    { skipAuth: true },
  );

  if (!data || data.length === 0) {
    throw new Error('Blog yazısı bulunamadı');
  }

  return transformWPPost(data[0]);
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const data = await api.get<Array<{ id: number; name: string; slug: string; description?: string }>>(
    `/wp/v2/categories?per_page=100&hide_empty=true`,
    { skipAuth: true },
  );
  return data.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
  }));
}
