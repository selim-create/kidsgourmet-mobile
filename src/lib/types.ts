// ─── Core Types ───────────────────────────────────────────────────────────────

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
  facebook?: string;
}

export interface UserStats {
  question_count: number;
  comment_count: number;
}

export interface EditUrls {
  new_post?: string;
  new_recipe?: string;
  new_ingredient?: string;
  new_discussion?: string;
}

export interface CanEdit {
  posts?: boolean;
  recipes?: boolean;
  ingredients?: boolean;
  discussions?: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  display_name?: string;
  username?: string;
  /** Avatar URL — may be signed for some setups */
  avatar_url?: string | null;
  role?: 'subscriber' | 'editor' | 'administrator' | 'kg_expert' | string;
  parent_role?: 'Anne' | 'Baba' | 'Bakıcı' | 'Diğer' | string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  is_expert?: boolean;
  is_admin?: boolean;
  is_editor?: boolean;
  has_editor_access?: boolean;
  admin_url?: string;
  edit_urls?: EditUrls;
  can_edit?: CanEdit;
  can_edit_others?: CanEdit;
  biography?: string;
  expertise?: string[];
  social_links?: SocialLinks;
  show_email?: boolean;
  followed_circles?: number[];
  stats?: UserStats;
  registered_via?: string;
  apple_refresh_token?: string;
  /** Child list returned by /profile endpoint */
  children?: Child[];
  created_at?: string;
}

export type FeedingStyle = 'breast' | 'formula' | 'mixed' | 'solid' | string;

export interface Child {
  /** UUID string from backend (NOT number!) */
  id: string;
  name: string;
  birth_date: string;
  gender?: 'male' | 'female' | 'other';
  /** Primary field returned by backend */
  allergies?: string[];
  /** @deprecated kept for backward compatibility with older mobile code that used `allergens` */
  allergens?: string[];
  feeding_style?: FeedingStyle;
  photo_id?: number | null;
  kvkk_consent?: boolean;
  created_at?: string;
  avatar_path?: string | null;
  has_avatar?: boolean;
  /** Signed URL, ~15 min expiry — refresh by reloading profile */
  avatar_url?: string | null;
  diet_types?: string[];
  notes?: string;
  age_months?: number;
  dietary_restrictions?: string[];
  sensitive_data_consent?: boolean;
  guardian_declaration?: boolean;
  weight_kg?: number | null;
  current_weight_kg?: number | null;
}

// ─── Recipe Types ──────────────────────────────────────────────────────────────

export interface RecipeExpert {
  name: string;
  title?: string;
  approved?: boolean;
  avatar_url?: string;
  note?: string;
}

export interface RecipeSubstitute {
  original: string;
  substitute: string;
  note?: string;
}

export interface RecipeCrossSell {
  url: string;
  title: string;
  image?: string;
  prep_time?: string;
  difficulty?: string;
  /** Trigger ingredient name used in the banner description (e.g. "Artan Makarna ile…") */
  ingredient?: string;
}

/** @deprecated Use RecipeCrossSell instead */
export type TariftenRecipe = RecipeCrossSell;

export interface Recipe {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: string;
  featured_image?: string;
  thumbnail?: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  age_group?: string;
  age_group_color?: string;
  meal_type?: string;
  diet_types?: string[];
  age_groups?: AgeGroup[];
  meal_types?: MealType[];
  ingredients?: Ingredient[];
  instructions?: Instruction[];
  nutrition?: NutritionInfo;
  author?: Author;
  expert?: RecipeExpert;
  expert_note?: string;
  is_expert_approved?: boolean;
  is_featured?: boolean;
  is_favorite?: boolean;
  is_freezable?: boolean;
  freezable?: boolean;
  storage_duration?: string;
  allergens?: string[];
  special_notes?: string;
  view_count?: number;
  rating?: number;
  rating_count?: number;
  user_rating?: number;
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
  substitutes?: RecipeSubstitute[];
  cross_sell?: RecipeCrossSell;
}

export interface Ingredient {
  id?: number;
  slug?: string;
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
  is_optional?: boolean;
  alternatives?: string[];
  allergen_warning?: string;
}

/** Ingredient item returned by the /kg/v1/ingredients listing endpoint. */
export interface ListIngredient {
  id: number;
  slug?: string;
  name: string;
  image?: string;
  category?: string;
  min_age_months?: number;
  allergen_warning?: string;
}

export interface IngredientDetail {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  nutrition?: NutritionInfo;
  allergens?: string[];
  age_suitability?: string;
  min_age_months?: number;
  alternatives?: string[];
  recipes?: { id: number; slug: string; title: string; featured_image?: string }[];
}

export interface Instruction {
  step?: number;
  content?: string;
  /** Alternative field names that some API versions return */
  text?: string;
  description?: string;
  instruction?: string;
  image?: string;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  calcium?: number;
  iron?: number;
}

export interface Author {
  id: number;
  name: string;
  avatar_url?: string;
  bio?: string;
  slug?: string;
  title?: string;
  is_expert?: boolean;
}

// ─── Taxonomy Types ────────────────────────────────────────────────────────────

export interface AgeGroup {
  id: number;
  name?: string;
  slug: string;
  min_age?: number;
  max_age?: number;
  description?: string;
  color?: string;
}

export interface MealType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface DietType {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface SpecialCondition {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// ─── Blog Types ────────────────────────────────────────────────────────────────

export type SponsorImage = string | { id?: number | null; url?: string | null } | null;

export interface SponsorData {
  is_sponsored: boolean;
  sponsor_name?: string;
  sponsor_url?: string;
  /** WordPress ACF/meta image — can be either a string URL or an { id, url } object */
  sponsor_logo?: SponsorImage;
  sponsor_light_logo?: SponsorImage;
  sponsor_tagline?: string;
  discount_text?: string;
  has_discount?: boolean;
  direct_redirect?: boolean;
  gam_click_url?: string;
  gam_impression_url?: string;
  sponsor_cta?: { text?: string; url?: string };
}

// ─── Embed Types ──────────────────────────────────────────────────────────────

export interface BaseEmbedItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  url: string;
  embed_type: 'recipe' | 'ingredient' | 'tool' | 'post';
}

export interface RecipeEmbedItem extends BaseEmbedItem {
  embed_type: 'recipe';
  prep_time: string;
  age_group: string | null;
  age_group_color: string;
  diet_types: string[];
  allergens: string[];
  is_featured: boolean;
}

export interface IngredientEmbedItem extends BaseEmbedItem {
  embed_type: 'ingredient';
  start_age: string;
  benefits: string;
  allergy_risk: string;
  allergens: string[];
  season: string;
}

export interface ToolEmbedItem extends BaseEmbedItem {
  embed_type: 'tool';
  tool_type: string;
  tool_icon: string;
  tool_types: string[];
  is_active: boolean;
}

export interface PostEmbedItem extends BaseEmbedItem {
  embed_type: 'post';
  category: { name: string; slug: string } | null;
  author: { name: string; avatar: string };
  date: string;
  read_time: string;
}

export type EmbedItem = RecipeEmbedItem | IngredientEmbedItem | ToolEmbedItem | PostEmbedItem;

export interface EmbedData {
  type: 'recipe' | 'ingredient' | 'tool' | 'post';
  position: number;
  placeholder_id: string;
  items: EmbedItem[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  thumbnail?: string;
  author?: Author;
  categories?: BlogCategory[];
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
  reading_time?: number;
  sponsor_data?: SponsorData;
  comment_count?: number;
  embedded_content?: EmbedData[];
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// ─── Meal Plan Types ───────────────────────────────────────────────────────────

export interface MealPlan {
  id?: number;
  year: number;
  week: number;
  days: MealPlanDay[];
}

export interface MealPlanDay {
  date: string;
  day_name: string;
  meals: MealPlanEntry[];
}

export interface MealPlanEntry {
  id?: number;
  meal_type: MealType;
  recipe?: Recipe;
  custom_meal?: string;
  notes?: string;
  is_completed?: boolean;
}

// ─── Search Types ──────────────────────────────────────────────────────────────

export interface SearchResult {
  recipes?: Recipe[];
  blog_posts?: BlogPost[];
  total?: number;
}

export interface SearchFilters {
  query?: string;
  age_group?: string;
  meal_type?: string;
  diet_type?: string;
  special_condition?: string;
  ingredient?: string;
  difficulty?: string;
  max_time?: number;
  expert_approved?: boolean;
  sort?: 'newest' | 'popular' | 'rating' | 'time';
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// ─── Search (categorized, web parity) ────────────────────────────────────────

export interface RecipeSearchResult {
  id: number;
  title: string;
  slug: string;
  image: string;
  age_group: string;
  prep_time: string;
  excerpt?: string;
}

export interface IngredientSearchResult {
  id: number;
  title: string;
  slug: string;
  image: string;
  age_group: string;
  excerpt: string;
  allergen_level?: string;
  season?: string;
}

export interface PostSearchResult {
  id: number;
  title: string;
  slug: string;
  image: string;
  excerpt: string;
  date?: string;
}

export interface DiscussionSearchResult {
  id: number;
  title: string;
  slug: string;
  author: string;
  date: string;
  comment_count: number;
}

export interface SearchCategorized {
  recipes: RecipeSearchResult[];
  ingredients: IngredientSearchResult[];
  posts: PostSearchResult[];
  discussions: DiscussionSearchResult[];
}

export interface SearchCounts {
  total: number;
  recipes: number;
  ingredients: number;
  posts: number;
  discussions: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  type: string;
  results: Array<RecipeSearchResult | IngredientSearchResult | PostSearchResult | DiscussionSearchResult>;
  categorized: SearchCategorized;
  counts: SearchCounts;
  total: number;
}

export interface SearchParams {
  q: string;
  type?: 'all' | 'recipe' | 'ingredient' | 'post' | 'discussion';
  age_group?: string;
  per_page?: number;
}

// ─── Nutrition Types ───────────────────────────────────────────────────────────

export interface NutritionSummary {
  date?: string;
  week?: number;
  calories_total?: number;
  calories_target?: number;
  protein_total?: number;
  carbs_total?: number;
  fat_total?: number;
  meals_count?: number;
  water_intake?: number;
  // Backend bazen string[], bazen {name, percent, deficiency} dizisi döndürebiliyor
  missing_nutrients?: Array<string | { name: string; percent?: number; deficiency?: string }>;
}

// ─── Safety Types ─────────────────────────────────────────────────────────────

export interface SafetyCheck {
  ingredient: string;
  age_months: number;
  is_safe?: boolean;
  safety_level?: 'safe' | 'caution' | 'avoid';
  notes?: string;
  alternatives?: string[];
}

export interface SafetyAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  ingredient?: string;
  alternative?: string;
}

export interface SafetyCheckResult {
  is_safe: boolean;
  safety_score?: number;
  alerts: SafetyAlert[];
  alternatives?: string[];
}

export interface BatchSafetyResult {
  recipe_id: number;
  result: SafetyCheckResult;
}

// ─── Comment Types ────────────────────────────────────────────────────────────

export interface CommentAuthor {
  id: number;
  name: string;
  /** Backend `format_comment` field (primary) */
  avatar?: string | null;
  /** Legacy field — kept for backward compatibility */
  avatar_url?: string | null;
}

export interface Comment {
  id: number;
  content: string;
  author: CommentAuthor;
  /** Backend `format_comment` field (WP `comment_date`, ISO-like) */
  date?: string;
  /** Legacy field — kept for backward compatibility */
  created_at?: string;
  parent_id?: number;
  likes?: number;
  is_liked?: boolean;
  replies?: Comment[];
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RecipePaginatedResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Ingredient Guide Types ────────────────────────────────────────────────────

/** Standalone ingredient item returned by the /kg/v1/ingredients guide endpoint. */
export interface IngredientGuideItem {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  start_age?: string;
  benefits?: string;
  allergy_risk?: 'Düşük' | 'Orta' | 'Yüksek' | string;
  season?: string | string[];
  storage_tips?: string;
  prep_methods?: string[];
  // Detail-page fields (used in step 3)
  prep_by_age?: any[];
  selection_tips?: string;
  pro_tips?: string;
  pairings?: any[];
  nutrition?: Record<string, any>;
  related_recipes?: any[];
  faq?: any[];
  allergen_info?: any;
  allergens?: string[];
  nutrition_per_100g?: any;
  prep_methods_list?: any[];
  image_credit?: string;
  seo?: {
    title?: string;
    description?: string;
    focus_keywords?: string[];
    og_image?: string;
  };
}

export interface IngredientGuideResponse {
  ingredients: IngredientGuideItem[];
  total: number;
  pages: number;
}

// ─── Food Introduction Types ───────────────────────────────────────────────────

export interface FoodIntroductionItem {
  id: number;
  food_name: string;
  category?: string;
  recommended_age_months?: number;
  introduction_method?: string;
  allergen_risk?: 'low' | 'medium' | 'high';
  notes?: string;
  image?: string;
}

// ─── Vaccine Types ────────────────────────────────────────────────────────────

export interface Vaccine {
  id: number | string;
  vaccine_id?: number | string;
  vaccine_code?: string;
  name: string;
  name_short?: string;
  recommended_age_months?: number;
  doses?: number;
  description?: string;
  timing_rule?: string;
  is_mandatory?: boolean;
  is_overdue?: boolean;
  /** ISO date string — present when fetched via VACCINES_BY_CHILD endpoint */
  administered_at?: string;
  date_administered?: string;
  scheduled_date?: string;
  actual_date?: string;
  /** Status string returned by child-specific endpoint */
  status?: string;
  child_id?: string | number;
  vaccine?: {
    code?: string;
    name?: string;
    name_short?: string;
    description?: string;
    timing_rule?: string;
  };
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardData {
  featured_recipes?: Recipe[];
  weekly_plan_summary?: WeeklyPlanSummary;
  nutrition_summary?: NutritionSummary;
  alerts?: DashboardAlert[];
  recommendations?: Recipe[];
}

export interface WeeklyPlanSummary {
  week: number;
  year: number;
  total_meals: number;
  completed_meals: number;
  completion_rate: number;
}

export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  action_label?: string;
  action_url?: string;
}

// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  username: string; // email OR username
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  username?: string;
  child?: {
    name: string;
    birth_date: string;
  };
  consents?: {
    terms_accepted: boolean;
    terms_accepted_at: string | null;
    marketing_consent: boolean;
    marketing_consent_at: string | null;
    sensitive_data_consent: boolean;
    sensitive_data_consent_at: string | null;
    guardian_declaration?: boolean;
    guardian_declaration_at?: string | null;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  redirect_url?: string;
  is_expert?: boolean;
  account_pending_deletion?: boolean;
}

// ─── Favorites Types ──────────────────────────────────────────────────────────

export interface FavoriteCollection {
  id: number;
  name: string;
  icon?: string;
}

// ─── Shopping List Types ──────────────────────────────────────────────────────

export type ShoppingCategory =
  | 'dairy'
  | 'meat_protein'
  | 'fruits_vegetables'
  | 'grains'
  | 'other';

/** Backend wire format — fields differ from legacy frontend names */
export interface BackendShoppingListItem {
  id: string | number;
  /** Backend field name (NOT "ingredient") */
  item: string;
  /** Backend field name (NOT "amount") */
  quantity: string;
  checked: boolean;
  recipe_id?: number;
  recipe_title?: string;
  category?: ShoppingCategory | string;
}

/** @deprecated Use BackendShoppingListItem for new code */
export interface ShoppingItem {
  id: number;
  name: string;
  category?: string;
  is_checked: boolean;
  quantity?: string;
}

export interface ShoppingListItem {
  id: string | number;
  /** Display name of the ingredient */
  ingredient: string;
  /** Quantity/amount string */
  amount: string;
  /** Whether this item has been checked off */
  checked: boolean;
  category?: ShoppingCategory | string;
  recipe_id?: number;
  recipe_title?: string;
  /** @deprecated Use `ingredient` */
  name?: string;
  /** @deprecated Use `checked` */
  is_checked?: boolean;
  /** @deprecated Use `amount` */
  quantity?: string;
}

export interface ShoppingList {
  id?: number;
  name?: string;
  items: ShoppingListItem[];
  created_at?: string;
  updated_at?: string;
}

// ─── Growth Types ─────────────────────────────────────────────────────────────

export interface GrowthRecord {
  id: string;
  child_id: string;
  date: string;
  weight_kg: number | null;
  height_cm: number | null;
  head_circumference_cm: number | null;
  weight_percentile?: number | null;
  height_percentile?: number | null;
  head_circumference_percentile?: number | null;
  notes?: string;
}

export interface GrowthPercentile {
  age_months: number;
  calculated_at: string;
  weight_percentile: number | null;
  height_percentile: number | null;
  head_circumference_percentile: number | null;
}

export interface GrowthData {
  records: GrowthRecord[];
  latest: GrowthRecord | null;
  percentile: GrowthPercentile | null;
}

export interface GrowthChartMeasurement {
  age_days: number;
  value: number;
  percentile: number | null;
  z_score: number | null;
  date: string;
}

export interface GrowthChartCurvePoint {
  age_days: number;
  value: number;
}

export type GrowthChartType = 'weight_for_age' | 'height_for_age' | 'head_for_age';

export interface GrowthChartData {
  child: { name: string; gender: string; birth_date: string };
  type: GrowthChartType;
  measurements: GrowthChartMeasurement[];
  reference_curves: {
    p3: GrowthChartCurvePoint[];
    p15: GrowthChartCurvePoint[];
    p50: GrowthChartCurvePoint[];
    p85: GrowthChartCurvePoint[];
    p97: GrowthChartCurvePoint[];
  };
}

export interface PercentileResult {
  id?: number;
  child_id?: number;
  weight_percentile?: number;
  height_percentile?: number;
  head_circumference_percentile?: number;
  bmi_percentile?: number;
  age_months?: number;
  age_days?: number;
  gender?: 'male' | 'female';
  birth_date?: string;
  measurement_date?: string;
  weight_kg?: number;
  height_cm?: number;
  head_circumference_cm?: number;
  calculated_at?: string;
  interpretation?: string;
  weight_status?: string;
  height_status?: string;
  head_circumference_status?: string;
  bmi?: number;
}

// ─── BLW / Solid Food Types ───────────────────────────────────────────────────

export interface BLWTestResult {
  id?: number;
  child_id?: number;
  score?: number;
  max_score?: number;
  readiness_level?: 'not_ready' | 'almost_ready' | 'ready';
  readiness_label?: string;
  recommendations?: string[];
  completed_at?: string;
}

export interface SolidFoodReadinessResult {
  score?: number;
  result?: SolidFoodReadinessBucket;
  timestamp?: string;
  /** Legacy saved payloads may still store numeric ids, while newer endpoints can return string ids. */
  id?: number | string;
  /** Legacy saved payloads may still store numeric ids, while newer endpoints can return string ids. */
  child_id?: number | string;
  /** @deprecated Prefer `result.id` for new kg-core responses. */
  is_ready?: boolean;
  /** @deprecated Prefer `score` for new kg-core responses. */
  readiness_score?: number;
  factors?: {
    can_sit_unsupported?: boolean;
    shows_interest?: boolean;
    lost_tongue_thrust?: boolean;
    can_hold_objects?: boolean;
  };
  notes?: string;
  recommendations?: string[];
  disclaimer?: string;
  sponsor?: string;
  checked_at?: string;
}

// ─── Allergen Types ───────────────────────────────────────────────────────────

export interface Allergen {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  common_sources?: string[];
  icon?: string;
  severity_default?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChildAllergen {
  id?: number;
  child_id: number;
  allergen: Allergen;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

// ─── Tool Types ───────────────────────────────────────────────────────────────

export interface Tool {
  id: number;
  name: string;
  slug: string;
  description?: string;
  excerpt?: string;
  icon?: string;
  url?: string;
  is_active?: boolean;
  tool_type?: string;
  tool_types?: string[];
  requires_auth?: boolean;
  is_sponsored?: boolean;
}

// ─── BLW Test Types ───────────────────────────────────────────────────────────

export interface BLWTestQuestion {
  id: string;
  text: string;
  category?: string;
  description?: string;
}

export interface BLWTestConfig {
  questions: BLWTestQuestion[];
  thresholds?: {
    ready: number;
    almost_ready: number;
  };
}

export interface BLWTestAnswer {
  question_id: string;
  answer: boolean;
}

export interface BLWResultBucket {
  slug: 'not_ready' | 'almost_ready' | 'ready';
  label: string;
  description?: string;
  recommendations?: string[];
  color?: string;
}

// ─── Percentile Types ─────────────────────────────────────────────────────────

export interface PercentileMeasurement {
  child_id?: number;
  gender: 'male' | 'female';
  birth_date: string;
  measurement_date: string;
  weight_kg?: number;
  height_cm?: number;
  head_circumference_cm?: number;
}

// ─── Water Calculator Types ───────────────────────────────────────────────────

export interface WaterNeedResult {
  daily_fluid_need_ml: number;
  breakdown: {
    from_breast_milk_formula: number;
    from_food: number;
    from_water: number;
  };
  notes: string[];
  formula: string;
  warning: string | null;
}

// ─── Solid Food Readiness Types ───────────────────────────────────────────────

export interface SolidFoodReadinessOption {
  id: string;
  text: string;
  value: number;
}

export interface SolidFoodReadinessQuestion {
  id: string;
  /** kg-core sends the prompt text in `question`. `text` kept optional for backward compat. */
  question?: string;
  text?: string;
  description?: string;
  weight?: number;
  options?: SolidFoodReadinessOption[];
}

export interface SolidFoodReadinessBucket {
  id: string;
  min_score: number;
  max_score: number;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  recommendations?: string[];
}

export interface SolidFoodReadinessConfig {
  questions: SolidFoodReadinessQuestion[];
  result_buckets?: SolidFoodReadinessBucket[];
  disclaimer?: string;
}

export interface SolidFoodResultBucket {
  slug: string;
  label: string;
  description?: string;
  recommendations?: string[];
}

// ─── Allergen Planner Types ───────────────────────────────────────────────────

export interface AllergenPlannerConfig {
  allergens: Array<{
    id: string;
    name: string;
    icon?: string;
    description?: string;
  }>;
  schedule_days?: number;
}

export interface AllergenPlannerInput {
  allergen_id: string;
  child_id?: string | number;
  previous_reactions?: string[];
}

export interface AllergenTrialDay {
  day: number;
  amount: string;
  form?: string;
  time?: string;
  notes?: string;
}

export interface AllergenTrialPlan {
  allergen: {
    id: string;
    name: string;
    risk_level?: string;
  };
  introduction_plan: {
    total_days: number;
    days: AllergenTrialDay[];
  };
  warning_signs: string[];
  emergency_signs: string[];
  when_to_stop: string[];
  success_criteria?: string;
  related_ingredients?: (
    | string
    | {
        name?: string;
        warning?: string;
      }
  )[];
}

// ─── Food Trial Types ─────────────────────────────────────────────────────────

export interface FoodTrial {
  id: number | string;
  child_id: string;
  ingredient_id?: number;
  ingredient_name?: string;
  trial_date: string;
  result: 'success' | 'mild_reaction' | 'reaction' | 'severe_reaction';
  reaction?: string;
  reaction_notes?: string;
  amount?: string;
  form?: string;
  retry_after?: string;
  is_new?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FoodTrialInput {
  child_id: string | number;
  ingredient_id?: number;
  ingredient_name?: string;
  trial_date: string;
  result: 'success' | 'mild_reaction' | 'reaction' | 'severe_reaction';
  reaction_notes?: string;
  amount?: string;
  form?: string;
}

export interface FoodTrialSummary {
  total_trials: number;
  success: number;
  mild_reaction: number;
  reaction: number;
  severe_reaction: number;
  recent_trials?: FoodTrial[];
}

// ─── Bath Planner Types ───────────────────────────────────────────────────────

export interface BathPlannerAgeGroup {
  slug: string;
  label: string;
  min_months: number;
  max_months?: number;
}

export interface BathPlannerOption {
  id: string;
  label: string;
}

export interface BathPlannerConfig {
  seasons: Array<string | BathPlannerOption>;
  age_groups: BathPlannerAgeGroup[];
  skin_types?: Array<string | BathPlannerOption>;
}

export interface BathPlannerInput {
  baby_age_months: number;
  skin_type: string;
  season: string;
  has_eczema: boolean;
}

export interface BathPlannerResult {
  frequency_per_week: number;
  best_time?: string;
  duration_minutes?: number;
  water_temperature?: string;
  tips?: string[];
  products?: string[];
  disclaimer?: string;
}

// ─── Hygiene Calculator Types ─────────────────────────────────────────────────

export interface HygieneInput {
  baby_age_months: number;
  daily_diaper_changes: number;
  outdoor_hours: number;
  meal_count: number;
}

export interface HygieneCalculatorResult {
  monthly_wipes_needed: number;
  recommendations: string[];
  carry_bag_essentials: string[];
  sponsor?: ToolSponsorData;
}

// ─── Shared Tool Types ────────────────────────────────────────────────────────

export interface ToolSponsorData {
  name: string;
  logo?: string;
  url?: string;
  cta?: string;
  [key: string]: unknown;
}

// ─── Diaper Calculator Types ──────────────────────────────────────────────────

export interface DiaperInput {
  baby_weight_kg: number;
  baby_age_months: number;
  daily_changes: number;
}

export interface DiaperCalculatorResult {
  recommended_size: string;
  size_range: string;
  daily_count: number;
  monthly_count: number;
  monthly_packs: number;
  pack_type: string;
  size_change_alert?: string;
  tips: string[];
  sponsor?: ToolSponsorData;
}

export interface RashRiskInput {
  change_frequency: number;
  night_diaper_hours: number;
  humidity_level: 'low' | 'medium' | 'high';
  has_diarrhea: boolean;
}

export interface RashRiskResult {
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  risk_factors: string[];
  prevention_tips: string[];
  sponsor?: ToolSponsorData;
}

// ─── Air Quality Types ────────────────────────────────────────────────────────

export interface AirQualityInput {
  home_type: string;
  has_pets: boolean;
  has_smoker: boolean;
  heating_type: string;
  season: 'winter' | 'spring' | 'summer' | 'autumn';
  child_age_months?: number;
  respiratory_issues?: boolean;
  ventilation_frequency?: 'multiple_daily' | 'daily' | 'rarely';
  cooking_frequency?: 'high' | 'medium' | 'low';
}

export interface AirQualityRiskFactor {
  factor: string;
  impact: string;
  severity?: string;
  category?: string;
}

export interface AirQualityExternalAqi {
  aqi: number;
  quality_level: {
    level: string;
    color: string;
    description: string;
  };
  is_safe_for_outdoor: boolean;
}

export interface AirQualityResult {
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  risk_factors: AirQualityRiskFactor[];
  recommendations: string[];
  seasonal_alerts: string[];
  indoor_tips?: string[];
  external_aqi?: AirQualityExternalAqi;
  sponsor?: ToolSponsorData;
}

// ─── Stain Encyclopedia Types ─────────────────────────────────────────────────

export interface StainGuide {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: { step: number; instruction: string; tip?: string }[];
  warnings: string[];
  related_ingredients: string[];
  sponsor?: ToolSponsorData;
}

export interface StainSearchResponse {
  total: number;
  stains: StainGuide[];
  categories: { id: string; label: string }[];
  sponsor: ToolSponsorData | null;
}



export interface MealSlot {
  id?: number;
  meal_type_slug: string;
  meal_type_name: string;
  recipe?: Recipe;
  custom_meal?: string;
  notes?: string;
  is_completed?: boolean;
  scheduled_time?: string;
}

export interface MealPlanSlot {
  date: string;
  day_name: string;
  slots: MealSlot[];
}

// ─── Consent Types ────────────────────────────────────────────────────────────

export type ConsentType =
  | 'terms'
  | 'marketing'
  | 'sensitive_data'
  | 'guardian_declaration';

export type CookieConsentType =
  | 'cookie_pazarlama'
  | 'cookie_analitik';

export interface UserConsent {
  id?: number;
  consent_type: ConsentType;
  consented: boolean;
  consented_at?: string | null;
  revoked_at?: string | null;
  version?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserConsentHistoryEntry {
  id?: number;
  consent_type: ConsentType;
  consented: boolean;
  changed_at?: string;
  consented_at?: string | null;
  revoked_at?: string | null;
  version?: string | null;
  created_at?: string;
  updated_at?: string;
  ip?: string;
  user_agent?: string;
}

export interface UserConsentsResponse {
  success?: boolean;
  data?: UserConsent[];
  consents?: UserConsent[];
}

export interface UserConsentHistoryResponse {
  success?: boolean;
  data?: UserConsentHistoryEntry[];
  history?: UserConsentHistoryEntry[];
}

// ─── Public Profile Types ──────────────────────────────────────────────────────

export interface PublicProfileQuestion {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  comment_count: number;
  expert_answered: boolean;
  created_at?: string;
  circle?: {
    slug?: string;
    name: string;
    icon: string;
    color_code: string;
  };
}

export interface PublicProfile {
  username: string;
  display_name: string;
  avatar_url?: string | null;
  parent_role?: 'Anne' | 'Baba' | 'Bakıcı' | 'Diğer' | string;
  badges: string[];
  stats: {
    question_count: number;
    approved_comments: number;
  };
  recent_questions?: PublicProfileQuestion[];
}

export interface ExpertRecipeSlim {
  id: number;
  slug: string;
  title: string;
  image: string;
  prep_time?: string;
  age_group?: string;
  age_group_color?: string;
}

export interface ExpertBlogPostSlim {
  id: number;
  slug: string;
  title: string;
  image: string;
  category?: string;
  read_time?: string;
}

export interface ExpertAnsweredQuestionSlim {
  id: number;
  slug: string;
  title: string;
  answer_excerpt: string;
  answered_at: string;
}

export interface ExpertAskedQuestionSlim {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  comment_count: number;
  created_at: string;
  circle?: {
    slug?: string;
    name: string;
    icon: string;
    color_code: string;
  };
}

export interface ExpertPublicProfile {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  biography?: string;
  expertise?: string[];
  email?: string;
  show_email?: boolean;
  social_links?: SocialLinks;
  stats: {
    total_recipes: number;
    total_blog_posts?: number;
    total_posts?: number;
    total_answers: number;
    total_questions: number;
  };
  recipes?: ExpertRecipeSlim[];
  blog_posts?: ExpertBlogPostSlim[];
  answered_questions?: ExpertAnsweredQuestionSlim[];
  asked_questions?: ExpertAskedQuestionSlim[];
}

// ─── Community Types ──────────────────────────────────────────────────────────

export interface Circle {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  icon_name?: string;
  color?: string;
  color_code?: string;
  member_count?: number;
  discussion_count?: number;
  is_following?: boolean;
}

export interface DiscussionAuthor {
  id: number;
  name: string;
  display_name?: string;
  username?: string;
  avatar_url?: string | null;
  is_expert?: boolean;
  role?: string;
}

export interface Discussion {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  author: DiscussionAuthor;
  circle?: Circle;
  circle_id?: number;
  created_at: string;
  updated_at?: string;
  comment_count?: number;
  answer_count?: number;
  vote_count?: number;
  upvote_count?: number;
  downvote_count?: number;
  user_vote?: 'up' | 'down' | null;
  is_answered?: boolean;
  has_expert_answer?: boolean;
  expert_answer?: {
    id: number;
    content: string;
    author: { name: string; avatar_url?: string | null };
  } | null;
  is_favorite?: boolean;
  tags?: string[];
  status?: string;
  views?: number;
}

export interface DiscussionsResponse {
  discussions: Discussion[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface DiscussionComment {
  id: number;
  content: string;
  author: DiscussionAuthor;
  created_at: string;
  updated_at?: string;
  vote_count?: number;
  upvote_count?: number;
  downvote_count?: number;
  user_vote?: 'up' | 'down' | null;
  is_expert_comment?: boolean;
  is_expert_answer?: boolean;
  parent_id?: number | null;
  replies?: DiscussionComment[];
}

export interface FeedResponse {
  discussions: Discussion[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CreateDiscussionRequest {
  title: string;
  content: string;
  circle_id: number;
  tags?: string[];
}

export interface CreateDiscussionResponse {
  id: number;
  slug: string;
  title: string;
  status?: string;
  message?: string;
}

export interface TopContributor {
  id: number;
  name: string;
  display_name?: string;
  username?: string;
  avatar_url?: string | null;
  contribution_count?: number;
  answer_count?: number;
  question_count?: number;
  points?: number;
  rank?: number;
  is_expert?: boolean;
}

export interface VoteResponse {
  action: 'added' | 'removed' | 'changed';
  vote: 'up' | 'down' | null;
  vote_count?: number;
  upvote_count?: number;
  downvote_count?: number;
}
