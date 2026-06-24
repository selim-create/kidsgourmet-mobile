export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/kg/v1/auth/login',
  REGISTER: '/kg/v1/auth/register',
  LOGOUT: '/kg/v1/auth/logout',
  /** Web-aligned aliases for AUTH_* prefix convention */
  AUTH_LOGIN: '/kg/v1/auth/login',
  AUTH_REGISTER: '/kg/v1/auth/register',
  AUTH_ME: '/kg/v1/auth/me',
  AUTH_GOOGLE: '/kg/v1/auth/google',
  AUTH_APPLE: '/kg/v1/auth/apple',
  AUTH_DELETE_ACCOUNT: '/kg/v1/user/account',
  AUTH_FORGOT_PASSWORD: '/kg/v1/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/kg/v1/auth/reset-password',

  // User
  USER_ME: '/kg/v1/user/me',
  USER_PROFILE: '/kg/v1/user/profile',
  USER_AVATAR: '/kg/v1/user/avatar',
  CHILDREN: '/kg/v1/user/children',
  /** @deprecated Use CHILD_PROFILE(uuid) instead */
  CHILD: (id: string | number) => `/kg/v1/user/children/${id}`,
  /** @deprecated Use CHILD_PROFILE_AVATAR(uuid) instead */
  AVATAR: (id: string | number) => `/kg/v1/user/children/${id}/avatar`,
  // Child Profiles (NEW — correct UUID-based)
  CHILD_PROFILES: '/kg/v1/user/children',
  CHILD_PROFILE: (uuid: string) => `/kg/v1/user/children/${uuid}`,
  CHILD_PROFILE_AVATAR: (uuid: string) => `/kg/v1/user/children/${uuid}/avatar`,

  // Recipes
  RECIPES: '/kg/v1/recipes',
  RECIPE: (slug: string) => `/kg/v1/recipes/${slug}`,
  RECIPE_BY_SLUG: (slug: string) => `/kg/v1/recipes/${slug}`,
  RECIPES_BY_AGE: (ageSlug: string) => `/kg/v1/recipes/by-age/${ageSlug}`,
  RECIPE_RELATED: (recipeId: number) => `/kg/v1/recipes/${recipeId}/related`,
  RECIPES_FEATURED: '/kg/v1/recipes/featured',

  // Favorites
  FAVORITES: '/kg/v1/user/favorites',
  USER_FAVORITES: '/kg/v1/user/favorites',
  USER_FAVORITES_TOGGLE: '/kg/v1/user/favorites/toggle',
  USER_FAVORITES_COLLECTIONS: '/kg/v1/user/favorites/collections',

  // Meal Plans (plural — verified backend path)
  MEAL_PLANS_ACTIVE: (childId: string, weekStart?: string) => {
    const params = new URLSearchParams({ child_id: childId });
    if (weekStart) params.set('week_start', weekStart);
    return `/kg/v1/meal-plans/active?${params.toString()}`;
  },
  MEAL_PLAN_BY_ID: (id: string) => `/kg/v1/meal-plans/${id}`,
  MEAL_PLANS_GENERATE: '/kg/v1/meal-plans/generate',
  MEAL_PLAN_REFRESH_SLOT: (planId: string, slotId: string) => `/kg/v1/meal-plans/${planId}/slots/${slotId}/refresh`,
  MEAL_PLAN_SKIP_SLOT: (planId: string, slotId: string) => `/kg/v1/meal-plans/${planId}/slots/${slotId}/skip`,
  MEAL_PLAN_ASSIGN_SLOT: (planId: string, slotId: string) => `/kg/v1/meal-plans/${planId}/slots/${slotId}/assign`,
  MEAL_PLAN_SHOPPING_LIST: (planId: string) => `/kg/v1/meal-plans/${planId}/shopping-list`,
  /** @deprecated legacy alias from old singular /meal-plan pattern */
  MEAL_PLAN: '/kg/v1/meal-plans',
  /** @deprecated legacy alias from old singular /meal-plan pattern */
  MEAL_PLAN_CURRENT: '/kg/v1/meal-plans/active',
  /** @deprecated legacy alias from old singular /meal-plan pattern */
  MEAL_PLAN_GENERATE: '/kg/v1/meal-plans/generate',
  /** @deprecated legacy alias from old singular /meal-plan pattern */
  MEAL_PLAN_WEEK: (_year: number, _week: number) => '/kg/v1/meal-plans/active',

  // Shopping List (user-scoped — live backend path)
  SHOPPING_LIST: '/kg/v1/user/shopping-list',
  SHOPPING_LIST_ITEM: (id: string | number) => `/kg/v1/user/shopping-list/${id}`,
  SHOPPING_LIST_ITEM_TOGGLE: (id: string | number) => `/kg/v1/user/shopping-list/${id}/toggle`,
  SHOPPING_LIST_GENERATE: '/kg/v1/user/shopping-list/generate',
  /** @deprecated kept as alias — same value as SHOPPING_LIST */
  USER_SHOPPING_LIST: '/kg/v1/user/shopping-list',

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
  RECOMMENDATIONS_RECIPES: '/kg/v1/recommendations/recipes',
  RECOMMENDATIONS_SIMILAR: (recipeId: number) => `/kg/v1/recommendations/similar/${recipeId}`,

  // Nutrition
  NUTRITION: '/kg/v1/nutrition',
  NUTRITION_WEEKLY_SUMMARY: '/kg/v1/nutrition/weekly-summary',
  NUTRITION_MISSING: '/kg/v1/nutrition/missing-nutrients',
  NUTRITION_MISSING_NUTRIENTS: '/kg/v1/nutrition/missing-nutrients',
  NUTRITION_VARIETY_ANALYSIS: '/kg/v1/nutrition/variety-analysis',

  // Safety
  SAFETY_CHECK_INGREDIENT: '/kg/v1/safety/check-ingredient',
  SAFETY_CHECK_RECIPE: '/kg/v1/safety/check-recipe',
  SAFETY_BATCH_CHECK: '/kg/v1/safety/batch-check',

  // Ingredients
  INGREDIENTS: '/kg/v1/ingredients',
  INGREDIENTS_ALL: '/kg/v1/ingredients',
  INGREDIENT_BY_SLUG: (slug: string) => `/kg/v1/ingredients/${slug}`,
  INGREDIENT_SEARCH: '/kg/v1/ingredients/search',
  /** Web-aligned alias for INGREDIENT_SEARCH */
  INGREDIENTS_SEARCH: '/kg/v1/ingredients/search',
  INGREDIENT_CATEGORIES: '/kg/v1/ingredient-categories',
  INGREDIENTS_BY_SEASON: (season: string) => `/kg/v1/ingredients?season=${encodeURIComponent(season)}`,

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
  VACCINES_SCHEDULE_VERSIONS: '/kg/v1/health/vaccines/schedule-versions',
  VACCINES_UPDATE_STATUS: '/kg/v1/health/vaccines/update-status',
  VACCINES_ADD_PRIVATE: '/kg/v1/health/vaccines/private/add',
  VACCINES_SIDE_EFFECTS: '/kg/v1/health/vaccines/side-effects',
  VACCINES_UPCOMING: (childId: string) => `/kg/v1/health/vaccines/upcoming?child_id=${childId}`,
  VACCINES_HISTORY: (childId: string) => `/kg/v1/health/vaccines/history?child_id=${childId}`,

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
  /** Web-aligned aliases for SOLID_FOOD_READINESS_* */
  SOLID_FOOD_CONFIG: '/kg/v1/tools/solid-food-readiness/config',
  SOLID_FOOD_SUBMIT: '/kg/v1/tools/solid-food-readiness/submit',

  // Water Calculator
  WATER_CALCULATOR: '/kg/v1/tools/water-need/calculate',

  // Allergen Planner
  ALLERGEN_PLANNER_CONFIG: '/kg/v1/tools/allergen-planner/config',
  ALLERGEN_PLANNER_GENERATE: '/kg/v1/tools/allergen-planner/generate',
  ALLERGEN_LIST: '/kg/v1/tools/allergen-planner/allergens',
  ALLERGEN_PLAN: (allergenId: string) => `/kg/v1/tools/allergen-planner/${allergenId}`,

  // Food Trials (auth required)
  FOOD_TRIALS: '/kg/v1/tools/food-trials',
  FOOD_TRIAL: (id: number) => `/kg/v1/tools/food-trials/${id}`,
  FOOD_TRIAL_SUMMARY: '/kg/v1/tools/food-trials/summary',
  /** Web-aligned alias for FOOD_TRIALS (POST to create a trial) */
  FOOD_TRIAL_ADD: '/kg/v1/tools/food-trials',

  // Bath Planner
  BATH_PLANNER_CONFIG: '/kg/v1/tools/bath-planner/config',
  BATH_PLANNER_GENERATE: '/kg/v1/tools/bath-planner/generate',

  // Hygiene Calculator
  HYGIENE_CALCULATOR: '/kg/v1/tools/hygiene-calculator/calculate',

  // Diaper Calculator
  DIAPER_CALCULATOR: '/kg/v1/tools/diaper-calculator/calculate',
  DIAPER_RASH_RISK: '/kg/v1/tools/diaper-calculator/rash-risk',

  // Air Quality
  AIR_QUALITY_ANALYZE: '/kg/v1/tools/air-quality/analyze',

  // Stain Encyclopedia
  STAIN_ENCYCLOPEDIA_SEARCH: '/kg/v1/tools/stain-encyclopedia/search',
  STAIN_ENCYCLOPEDIA_BY_SLUG: (slug: string) => `/kg/v1/tools/stain-encyclopedia/${slug}`,
  /** Web-aligned aliases for STAIN_ENCYCLOPEDIA_* */
  STAIN_SEARCH: '/kg/v1/tools/stain-encyclopedia/search',
  STAIN_BY_SLUG: (slug: string) => `/kg/v1/tools/stain-encyclopedia/${slug}`,

  // Sponsored Tools
  SPONSORED_TOOLS: '/kg/v1/tools/sponsored',
  TOOL_SPONSOR_BY_SLUG: (slug: string) => `/kg/v1/tools/${slug}/sponsor`,

  // Growth
  GROWTH_DATA: '/kg/v1/health/growth',
  GROWTH_RECORD: (childId: number | string) => `/kg/v1/health/growth?child_id=${childId}`,
  GROWTH_ADD: '/kg/v1/health/growth',
  GROWTH_CHART_DATA: (childId: string, type?: string) => {
    const params = new URLSearchParams({ child_id: childId });
    if (type) params.set('type', type);
    return `/kg/v1/health/growth/chart-data?${params.toString()}`;
  },

  // Allergens
  ALLERGENS: '/kg/v1/allergens',
  CHILD_ALLERGENS: (childId: number) => `/kg/v1/user/children/${childId}/allergens`,

  // Newsletter
  NEWSLETTER: '/kg/v1/newsletter',
  NEWSLETTER_SUBSCRIBE: '/kg/v1/newsletter/subscribe',

  // Cross-sell / Promo banners
  CROSS_SELL_BANNER: '/kg/v1/cross-sell/banner',

  // Consents
  USER_CONSENTS: '/kg/v1/user/consents',
  USER_CONSENT_HISTORY: '/kg/v1/user/consents/history',
  USER_CONSENT_UPDATE: (type: string) => `/kg/v1/user/consents/${type}`,

  // Collections
  USER_COLLECTIONS: '/kg/v1/user/collections',
  USER_COLLECTION_BY_ID: (id: string) => `/kg/v1/user/collections/${id}`,
  USER_COLLECTION_ITEMS: (id: string) => `/kg/v1/user/collections/${id}/items`,

  // Public Profiles (no auth)
  USER_PUBLIC: (username: string) => `/kg/v1/user/public/${username}`,
  EXPERT_PUBLIC: (username: string) => `/kg/v1/expert/public/${username}`,
  EXPERTS_LIST: '/kg/v1/experts',
  EXPERT_DASHBOARD: '/kg/v1/expert/dashboard',

  // Notifications
  NOTIFICATION_PREFERENCES: '/kg/v1/notifications/preferences',
  PUSH_SUBSCRIBE: '/kg/v1/notifications/push/subscribe',
  PUSH_UNSUBSCRIBE: '/kg/v1/notifications/push/unsubscribe',

  // User BLW & Percentile results
  USER_BLW_RESULTS: '/kg/v1/user/blw-results',
  CHILD_BLW_RESULTS: (childId: string) => `/kg/v1/user/children/${childId}/blw-results`,
  USER_PERCENTILE_RESULTS: '/kg/v1/user/percentile-results',
  CHILD_PERCENTILE_RESULTS: (childId: string) => `/kg/v1/user/children/${childId}/percentile-results`,
  USER_SOLID_FOOD_RESULTS: '/kg/v1/user/solid-food-results',
  CHILD_SOLID_FOOD_RESULTS: (childId: string) => `/kg/v1/user/children/${childId}/solid-food-results`,

  // Community
  CIRCLES: '/kg/v1/circles',
  CIRCLE_FOLLOW: (id: number) => `/kg/v1/circles/${id}/follow`,
  CIRCLE_UNFOLLOW: (id: number) => `/kg/v1/circles/${id}/unfollow`,
  USER_CIRCLES: '/kg/v1/user/circles',
  DISCUSSIONS: '/kg/v1/discussions',
  DISCUSSION_BY_ID: (id: number) => `/kg/v1/discussions/${id}`,
  DISCUSSION_BY_SLUG: (slug: string) => `/kg/v1/discussions?slug=${encodeURIComponent(slug)}`,
  DISCUSSION_COMMENTS: (id: number) => `/kg/v1/discussions/${id}/comments`,
  USER_DISCUSSIONS: '/kg/v1/user/discussions',
  FEED: '/kg/v1/feed',
  TOP_CONTRIBUTORS: '/kg/v1/community/top-contributors',
  DISCUSSION_VOTE: (id: number) => `/kg/v1/discussions/${id}/vote`,
  COMMENT_VOTE: (id: number) => `/kg/v1/comments/${id}/vote`,
  COMMUNITY_REPORT: '/kg/v1/report',
  REPORT: '/kg/v1/report',
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
