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
  RECIPE_BY_SLUG: (slug: string) => `/kg/v1/recipes/${slug}`,
  RECIPES_BY_AGE: (ageSlug: string) => `/kg/v1/recipes/by-age/${ageSlug}`,
  RECIPE_RELATED: (recipeId: number) => `/kg/v1/recipes/${recipeId}/related`,

  // Favorites
  FAVORITES: '/kg/v1/user/favorites',
  USER_FAVORITES: '/kg/v1/user/favorites',
  USER_FAVORITES_TOGGLE: '/kg/v1/user/favorites/toggle',
  USER_FAVORITES_COLLECTIONS: '/kg/v1/user/favorites/collections',

  // Meal Plan
  MEAL_PLAN: '/kg/v1/meal-plan',
  MEAL_PLAN_CURRENT: '/kg/v1/meal-plan/current',
  MEAL_PLAN_GENERATE: '/kg/v1/meal-plan/generate',
  MEAL_PLAN_WEEK: (year: number, week: number) => `/kg/v1/meal-plan/${year}/${week}`,

  // Shopping List
  SHOPPING_LIST: '/kg/v1/shopping-list',
  SHOPPING_LIST_GENERATE: '/kg/v1/shopping-list/generate',

  // Blog (WordPress native)
  BLOG: '/wp/v2/posts',
  BLOG_POST: (slug: string) => `/wp/v2/posts?slug=${slug}&_embed`,
  BLOG_CATEGORIES: '/wp/v2/categories',

  // Taxonomy (WordPress native)
  AGE_GROUPS: '/wp/v2/age-group',
  MEAL_TYPES: '/wp/v2/meal-type',
  DIET_TYPES: '/wp/v2/diet-type',
  SPECIAL_CONDITIONS: '/wp/v2/special-condition',

  // Recipe Rating
  RECIPE_RATING: (recipeId: number) => `/kg/v1/recipes/${recipeId}/rate`,

  // Search
  SEARCH: '/kg/v1/search',
  SEARCH_ALL: '/kg/v1/search',

  // Recommendations
  RECOMMENDATIONS: '/kg/v1/recommendations/daily',
  RECOMMENDATIONS_DAILY: '/kg/v1/recommendations/daily',
  RECOMMENDATIONS_DASHBOARD: '/kg/v1/recommendations/dashboard',

  // Nutrition
  NUTRITION: '/kg/v1/nutrition',
  NUTRITION_WEEKLY_SUMMARY: '/kg/v1/nutrition/weekly-summary',
  NUTRITION_MISSING: '/kg/v1/nutrition/missing-nutrients',
  NUTRITION_MISSING_NUTRIENTS: '/kg/v1/nutrition/missing-nutrients',

  // Safety
  SAFETY_CHECK_INGREDIENT: '/kg/v1/safety/check-ingredient',
  SAFETY_CHECK_RECIPE: '/kg/v1/safety/check-recipe',
  SAFETY_BATCH_CHECK: '/kg/v1/safety/batch-check',

  // Ingredients
  INGREDIENTS: '/kg/v1/ingredients',
  INGREDIENTS_ALL: '/kg/v1/ingredients',
  INGREDIENT_BY_SLUG: (slug: string) => `/kg/v1/ingredients/${slug}`,
  INGREDIENT_SEARCH: '/kg/v1/ingredients/search',

  // Authors
  AUTHOR: (id: number) => `/wp/v2/users/${id}`,
  AUTHOR_RECIPES: (authorId: number) => `/kg/v1/recipes?author=${authorId}`,

  // Comments
  COMMENTS: '/kg/v1/comments',
  COMMENTS_BY_POST: (postId: number) => `/kg/v1/comments?post_id=${postId}`,
  RECIPE_COMMENTS: (recipeId: number) => `/kg/v1/recipes/${recipeId}/comments`,

  // Contact
  CONTACT: '/kg/v1/contact',

  // Food Introduction
  FOOD_INTRODUCTION_SUGGESTED: '/kg/v1/food-introduction/suggested',
  FOOD_INTRODUCTION_NEXT: '/kg/v1/food-introduction/next-suggestion',

  // Vaccines
  VACCINES_MASTER: '/kg/v1/health/vaccines/master',
  VACCINES_BY_CHILD: (childId: string) => `/kg/v1/health/vaccines?child_id=${childId}`,
  VACCINES_MARK_DONE: '/kg/v1/health/vaccines/mark-done',

  // Featured
  FEATURED: '/kg/v1/featured',
  FEATURED_ALL: '/kg/v1/featured',
  FEATURED_RECIPES: '/kg/v1/featured/recipes',

  // Tools
  TOOLS: '/kg/v1/tools',
  TOOL_BY_SLUG: (slug: string) => `/kg/v1/tools/${slug}`,

  // BLW Test
  TOOL_BLW_TEST: '/kg/v1/tools/blw-test',
  TOOL_BLW_RESULTS: '/kg/v1/tools/blw-test/results',
  BLW_TEST_CONFIG: '/kg/v1/tools/blw-test/config',
  BLW_TEST_SUBMIT: '/kg/v1/tools/blw-test/submit',

  // Percentile
  TOOL_PERCENTILE: '/kg/v1/tools/percentile',
  TOOL_PERCENTILE_RESULTS: '/kg/v1/tools/percentile/results',
  PERCENTILE_CALCULATE: '/kg/v1/tools/percentile/calculate',
  PERCENTILE_SAVE: '/kg/v1/tools/percentile/save',

  // Solid Food Readiness
  TOOL_SOLID_FOOD: '/kg/v1/tools/solid-food-readiness',
  TOOL_SOLID_FOOD_RESULTS: '/kg/v1/tools/solid-food-readiness/results',
  SOLID_FOOD_READINESS_CONFIG: '/kg/v1/tools/solid-food-readiness/config',
  SOLID_FOOD_READINESS_SUBMIT: '/kg/v1/tools/solid-food-readiness/submit',

  // Water Calculator
  WATER_CALCULATOR: '/kg/v1/tools/water-calculator',

  // Allergen Planner
  ALLERGEN_PLANNER_CONFIG: '/kg/v1/tools/allergen-planner/config',
  ALLERGEN_PLANNER_GENERATE: '/kg/v1/tools/allergen-planner/generate',

  // Food Trials (auth required)
  FOOD_TRIALS: '/kg/v1/tools/food-trials',
  FOOD_TRIAL: (id: number) => `/kg/v1/tools/food-trials/${id}`,
  FOOD_TRIAL_SUMMARY: '/kg/v1/tools/food-trials/summary',

  // Bath Planner
  BATH_PLANNER_CONFIG: '/kg/v1/tools/bath-planner/config',
  BATH_PLANNER_GENERATE: '/kg/v1/tools/bath-planner/generate',

  // Hygiene Calculator
  HYGIENE_CALCULATOR: '/kg/v1/tools/hygiene-calculator',

  // Diaper Calculator
  DIAPER_CALCULATOR: '/kg/v1/tools/diaper-calculator',
  DIAPER_RASH_RISK: '/kg/v1/tools/diaper-calculator/rash-risk',

  // Air Quality
  AIR_QUALITY_ANALYZE: '/kg/v1/tools/air-quality/analyze',

  // Stain Encyclopedia
  STAIN_ENCYCLOPEDIA_SEARCH: '/kg/v1/tools/stain-encyclopedia/search',
  STAIN_ENCYCLOPEDIA_BY_SLUG: (slug: string) => `/kg/v1/tools/stain-encyclopedia/${slug}`,

  // Sponsored Tools
  SPONSORED_TOOLS: '/kg/v1/tools/sponsored',
  TOOL_SPONSOR_BY_SLUG: (slug: string) => `/kg/v1/tools/${slug}/sponsor`,

  // Growth
  GROWTH_DATA: '/kg/v1/health/growth',
  GROWTH_RECORD: (childId: number) => `/kg/v1/health/growth?child_id=${childId}`,
  GROWTH_ADD: '/kg/v1/health/growth',

  // Allergens
  ALLERGENS: '/kg/v1/allergens',
  CHILD_ALLERGENS: (childId: number) => `/kg/v1/user/children/${childId}/allergens`,

  // Newsletter
  NEWSLETTER: '/kg/v1/newsletter',

  // Cross-sell / Promo banners
  CROSS_SELL_BANNER: '/kg/v1/cross-sell/banner',
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
