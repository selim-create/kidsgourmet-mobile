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
  /** WordPress ACF/meta image — string URL VEYA { id, url } object olabilir */
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

export interface Comment {
  id: number;
  content: string;
  author: Author;
  created_at: string;
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
  bmi_percentile?: number;
  age_months?: number;
  calculated_at?: string;
  interpretation?: string;
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

// ─── Meal Slot Types ──────────────────────────────────────────────────────────

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
