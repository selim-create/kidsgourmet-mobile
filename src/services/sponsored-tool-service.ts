import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Tool } from '../lib/types';

// ─── Sponsored Tool Types ─────────────────────────────────────────────────────

export interface SponsoredToolData {
  tool: Tool;
  sponsor_name?: string;
  sponsor_url?: string;
  sponsor_logo?: string;
  sponsor_tagline?: string;
  discount_text?: string;
  has_discount?: boolean;
  direct_redirect?: boolean;
  gam_click_url?: string;
  gam_impression_url?: string;
  sponsor_cta?: { text?: string; url?: string };
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Fetches sponsored tool metadata for a given tool slug.
 * Returns null if the tool has no sponsorship.
 */
export async function getSponsoredTool(slug: string): Promise<SponsoredToolData | null> {
  try {
    return await api.get<SponsoredToolData>(API_ENDPOINTS.TOOL_SPONSOR_BY_SLUG(slug), {
      skipAuth: true,
    });
  } catch {
    return null;
  }
}

/**
 * Fetches the list of all tools, including sponsorship metadata when present.
 */
export async function getSponsoredTools(): Promise<SponsoredToolData[]> {
  try {
    return await api.get<SponsoredToolData[]>(API_ENDPOINTS.SPONSORED_TOOLS, {
      skipAuth: true,
    });
  } catch {
    return [];
  }
}
