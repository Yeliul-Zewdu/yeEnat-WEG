/**
 * TypeScript shapes mirroring the YeEnat Weg backend responses.
 * Derived from EnateWeg/server controllers + schemas.
 */

export type Lang = "am" | "en";
export type Sex = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type PrimaryGoal = "lose_weight" | "gain_weight" | "maintain" | "manage_condition";
export type FastingType = "none" | "orthodox" | "ramadan";
export type SlotType = "breakfast" | "lunch" | "dinner" | "snack";
export type ReadingType = "blood_sugar" | "blood_pressure";
export type ReadingContext = "fasting" | "pre_meal" | "post_meal" | "random";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user?: { id: string; full_name: string; is_new: boolean };
}

export interface Targets {
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  sodium_mg: number;
  sugar_g: number;
}

export interface HealthSummary {
  has_profile: boolean;
  profile_version: number | null;
  bmi: number | null;
  primary_goal: PrimaryGoal | null;
  targets: Targets | null;
  conditions: string[];
  requires_blood_sugar_tracking: boolean;
  has_active_plan: boolean;
}

export interface Me {
  id: string;
  phone_number: string;
  google_uid: string | null;
  full_name: string;
  preferred_lang: Lang;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  health_summary: HealthSummary;
}

export interface HealthProfile {
  user_id: string;
  sex: Sex;
  birth_year: number;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number | null;
  activity_level: ActivityLevel;
  primary_goal: PrimaryGoal;
  wake_time: string | null;
  sleep_time: string | null;
  fasting_type: FastingType;
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergies: string[];
  bmi: number | null;
  daily_kcal_target: number | null;
  protein_g_target: number | null;
  carb_g_target: number | null;
  fat_g_target: number | null;
  sodium_mg_target: number | null;
  sugar_g_target: number | null;
  profile_version: number;
  conditions: string[];
}

export interface HealthProfileInput {
  sex: Sex;
  birth_year: number;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg?: number;
  activity_level: ActivityLevel;
  primary_goal: PrimaryGoal;
  wake_time?: string;
  sleep_time?: string;
  fasting_type: FastingType;
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergies: string[];
  conditions: string[];
}

export interface UpsertProfileResponse {
  profile_version: number;
  bmi: number;
  targets: Targets;
  requires_blood_sugar_tracking: boolean;
  plan_id: string | null;
  plan_generation_status: "generated" | "failed";
}

export interface MealItem {
  item_id: string;
  ingredient_id: string | null;
  ingredient_name_en: string | null;
  ingredient_name_am: string | null;
  quantity_g: number | null;
}

export interface PlanMeal {
  id: string;
  name_en: string | null;
  name_am: string | null;
  source: string | null;
  total_kcal: number | null;
  items: MealItem[];
}

export interface PlanSlot {
  slot_id: string;
  slot_type: SlotType;
  slot_index: number;
  is_logged: boolean;
  meal: PlanMeal | null;
}

export interface PlanDay {
  day_id: string;
  date: string;
  day_kcal_target: number | null;
  slots: PlanSlot[];
}

export interface WeeklyPlan {
  plan_id: string;
  week_start: string;
  trigger_reason: string;
  generated_at: string;
  lifestyle: unknown;
  days: PlanDay[];
}

export interface DailyLog {
  date: string;
  water_ml: number;
  targets: { kcal: number; protein_g: number; carb_g: number; sodium_mg: number; sugar_g: number };
  consumed: { kcal: number; protein_g: number; carb_g: number; sodium_mg: number; sugar_g: number };
  entries: unknown[];
  sodium_alert: boolean;
  sugar_alert: boolean;
}

export interface HealthReading {
  id: string;
  user_id: string;
  reading_type: ReadingType;
  value_mg_dl: number | null;
  systolic_mm_hg: number | null;
  diastolic_mm_hg: number | null;
  context: ReadingContext;
  note: string | null;
  measured_at: string;
}

export interface LogReadingResponse {
  reading_id: string;
  value_mg_dl?: number;
  status: "high" | "normal";
  plan_updated: boolean;
  new_plan_id?: string;
  message_en: string;
  message_am: string;
}

export interface Ingredient {
  id: string;
  name_en: string;
  name_am: string | null;
  kcal_per_100g?: number;
  protein_g_per_100g?: number;
  carb_g_per_100g?: number;
  fat_g_per_100g?: number;
  fiber_g_per_100g?: number;
  sodium_mg_per_100g?: number;
  sugar_g_per_100g?: number;
  [key: string]: unknown;
}
