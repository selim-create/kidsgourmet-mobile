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

export interface Recipe {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  thumbnail?: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  age_groups?: AgeGroup[];
  meal_types?: MealType[];
  diet_types?: DietType[];
  ingredients?: Ingredient[];
  instructions?: Instruction[];
  nutrition?: NutritionInfo;
  author?: Author;
  is_expert_approved?: boolean;
  is_favorite?: boolean;
  view_count?: number;
  rating?: number;
  rating_count?: number;
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
}

export interface Ingredient {
  id?: number;
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
  is_optional?: boolean;
}

export interface Instruction {
  step: number;
  content: string;
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
}

// ─── Taxonomy Types ────────────────────────────────────────────────────────────

export interface AgeGroup {
  id: number;
  name: string;
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

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// ─── Blog Types ────────────────────────────────────────────────────────────────

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
  difficulty?: string;
  max_time?: number;
  sort?: 'newest' | 'popular' | 'rating' | 'time';
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
