export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/kg/v1/auth/login',
  REGISTER: '/kg/v1/auth/register',
  LOGOUT: '/kg/v1/auth/logout',

  // User
  PROFILE: '/kg/v1/user/profile',
  CHILDREN: '/kg/v1/user/children',
  CHILD: (id: number) => `/kg/v1/user/children/${id}`,
  AVATAR: (id: number) => `/kg/v1/user/children/${id}/avatar`,

  // Recipes
  RECIPES: '/kg/v1/recipes',
  RECIPE: (slug: string) => `/kg/v1/recipes/${slug}`,

  // Favorites
  FAVORITES: '/kg/v1/favorites',
  FAVORITE_TOGGLE: (recipeId: number) => `/kg/v1/favorites/${recipeId}`,

  // Meal Plan
  MEAL_PLAN: '/kg/v1/meal-plan',
  MEAL_PLAN_WEEK: (year: number, week: number) => `/kg/v1/meal-plan/${year}/${week}`,

  // Blog
  BLOG: '/kg/v1/blog',
  BLOG_POST: (slug: string) => `/kg/v1/blog/${slug}`,

  // Taxonomy
  AGE_GROUPS: '/kg/v1/age-groups',
  MEAL_TYPES: '/kg/v1/meal-types',
  DIET_TYPES: '/kg/v1/diet-types',

  // Search
  SEARCH: '/kg/v1/search',

  // Recommendations
  RECOMMENDATIONS: '/kg/v1/recommendations',
  DASHBOARD_RECOMMENDATIONS: '/kg/v1/recommendations/dashboard',

  // Nutrition
  NUTRITION: '/kg/v1/nutrition',
  NUTRITION_SUMMARY: '/kg/v1/nutrition/summary',

  // Safety
  SAFETY: '/kg/v1/safety',
  SAFETY_CHECK: '/kg/v1/safety/check',

  // Ingredients
  INGREDIENTS: '/kg/v1/ingredients',

  // Comments
  COMMENTS: '/kg/v1/comments',
  RECIPE_COMMENTS: (recipeId: number) => `/kg/v1/recipes/${recipeId}/comments`,

  // Contact
  CONTACT: '/kg/v1/contact',

  // Food Introduction
  FOOD_INTRODUCTION: '/kg/v1/food-introduction',

  // Vaccines
  VACCINES: '/kg/v1/vaccines',

  // Featured
  FEATURED: '/kg/v1/featured',
  FEATURED_RECIPES: '/kg/v1/featured/recipes',

  // Newsletter
  NEWSLETTER: '/kg/v1/newsletter',
} as const;

export const APP_NAME = 'KidsGourmet';
export const APP_VERSION = '1.0.0';

export const PAGINATION = {
  DEFAULT_PER_PAGE: 12,
  RECIPES_PER_PAGE: 12,
  BLOG_PER_PAGE: 10,
} as const;

export const COLORS = {
  primary: '#FF8A65',
  secondary: '#AED581',
  blue: '#81D4FA',
  yellow: '#FFF176',
  dark: '#455A64',
  light: '#FFFBE6',
  purple: '#B39DDB',
  success: '#22C55E',
  info: '#3B82F6',
  warning: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;
