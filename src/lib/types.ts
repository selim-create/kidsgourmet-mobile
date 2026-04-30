// ─── Core Types ───────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
}

export interface Child {
  id: number;
  name: string;
  birth_date: string;
  gender?: 'male' | 'female' | 'other';
  avatar_url?: string;
  allergies?: string[];
  dietary_restrictions?: string[];
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
  id: number;
  name: string;
  recommended_age_months?: number;
  doses?: number;
  description?: string;
  is_mandatory?: boolean;
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
}

// ─── Favorites Types ──────────────────────────────────────────────────────────

export interface FavoriteCollection {
  id: number;
  name: string;
  icon?: string;
}

// ─── Shopping List Types ──────────────────────────────────────────────────────

export interface ShoppingItem {
  id: number;
  name: string;
  category?: string;
  is_checked: boolean;
  quantity?: string;
}

export interface ShoppingListItem {
  id: number;
  name: string;
  category?: string;
  quantity?: string;
  unit?: string;
  is_checked: boolean;
  recipe_id?: number;
  recipe_title?: string;
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
  id?: number;
  child_id: number;
  date: string;
  weight_kg?: number;
  height_cm?: number;
  head_circumference_cm?: number;
  notes?: string;
}

export interface GrowthData {
  records: GrowthRecord[];
  latest?: GrowthRecord;
  percentile?: PercentileResult;
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
  id?: number;
  child_id?: number;
  is_ready: boolean;
  readiness_score?: number;
  factors?: {
    can_sit_unsupported?: boolean;
    shows_interest?: boolean;
    lost_tongue_thrust?: boolean;
    can_hold_objects?: boolean;
  };
  notes?: string;
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
  daily_ml: number;
  min_ml?: number;
  max_ml?: number;
  note?: string;
  sources?: string[];
  disclaimer?: string;
}

// ─── Solid Food Readiness Types ───────────────────────────────────────────────

export interface SolidFoodReadinessQuestion {
  id: string;
  text: string;
  description?: string;
}

export interface SolidFoodReadinessConfig {
  questions: SolidFoodReadinessQuestion[];
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
  allergen_ids: string[];
  child_id?: number;
  start_date?: string;
}

export interface AllergenTrialDay {
  day: number;
  allergen: string;
  amount?: string;
  instructions?: string;
}

export interface AllergenTrialPlan {
  schedule: AllergenTrialDay[];
  notes?: string;
  emergency_signs?: string[];
  disclaimer?: string;
}

// ─── Food Trial Types ─────────────────────────────────────────────────────────

export interface FoodTrial {
  id: number;
  child_id?: number;
  food_name: string;
  start_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'reaction';
  notes?: string;
  reaction_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FoodTrialInput {
  child_id?: number;
  food_name: string;
  start_date?: string;
  notes?: string;
}

export interface FoodTrialSummary {
  total: number;
  completed: number;
  in_progress: number;
  reactions: number;
}

// ─── Bath Planner Types ───────────────────────────────────────────────────────

export interface BathPlannerAgeGroup {
  slug: string;
  label: string;
  min_months: number;
  max_months?: number;
}

export interface BathPlannerConfig {
  seasons: string[];
  age_groups: BathPlannerAgeGroup[];
}

export interface BathPlannerInput {
  age_months: number;
  season: string;
  child_id?: number;
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
  age_months: number;
  activity_level?: 'low' | 'medium' | 'high';
  child_id?: number;
}

export interface HygieneCalculatorResult {
  wipes_per_day: number;
  bath_frequency?: string;
  products_needed?: string[];
  tips?: string[];
  disclaimer?: string;
}

// ─── Diaper Calculator Types ──────────────────────────────────────────────────

export interface DiaperInput {
  age_months: number;
  weight_kg?: number;
  child_id?: number;
}

export interface DiaperCalculatorResult {
  diapers_per_day: number;
  diapers_per_month: number;
  current_size?: string;
  next_size_at?: string;
  tips?: string[];
  disclaimer?: string;
}

export interface RashRiskInput {
  age_months: number;
  frequency_per_day?: number;
  skin_sensitivity?: 'low' | 'medium' | 'high';
  child_id?: number;
}

export interface RashRiskResult {
  risk_level: 'low' | 'medium' | 'high';
  risk_score?: number;
  factors?: string[];
  recommendations?: string[];
  disclaimer?: string;
}

// ─── Air Quality Types ────────────────────────────────────────────────────────

export interface AirQualityResult {
  aqi: number;
  category: string;
  color?: string;
  outdoor_recommendation: string;
  activity_suggestions?: string[];
  health_notes?: string[];
  source?: string;
  measured_at?: string;
}

// ─── Stain Encyclopedia Types ─────────────────────────────────────────────────

export interface ToolSponsorData {
  name: string;
  logo?: string;
  url?: string;
  cta?: string;
  [key: string]: unknown;
}

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
