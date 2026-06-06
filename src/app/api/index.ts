/**
 * Typed endpoint functions for the YeEnat Weg backend.
 * Grouped by resource; each call delegates to `apiFetch`.
 */
import { apiFetch } from "./client";
import type {
  AuthTokens,
  DailyLog,
  HealthProfile,
  HealthProfileInput,
  HealthReading,
  Ingredient,
  Lang,
  LogReadingResponse,
  Me,
  ReadingContext,
  ReadingType,
  UpsertProfileResponse,
  WeeklyPlan,
} from "./types";

export * from "./types";
export { ApiError, setOnUnauthorized } from "./client";
export { getTokens, setTokens, clearTokens } from "./storage";

export const auth = {
  sendOtp: (phone_number: string) =>
    apiFetch<{ message: string }>("/auth/otp/send", {
      method: "POST",
      auth: false,
      body: { phone_number },
    }),

  verifyOtp: (input: {
    phone_number: string;
    otp: string;
    full_name?: string;
    preferred_lang?: Lang;
  }) =>
    apiFetch<AuthTokens>("/auth/otp/verify", {
      method: "POST",
      auth: false,
      body: input,
    }),

  logout: (refresh_token: string) =>
    apiFetch<void>("/auth/logout", { method: "POST", auth: false, body: { refresh_token } }),
};

export const profile = {
  getMe: () => apiFetch<Me>("/users/me"),

  updateMe: (input: { full_name?: string; preferred_lang?: Lang }) =>
    apiFetch<Me>("/users/me", { method: "PATCH", body: input }),

  getHealthProfile: () => apiFetch<HealthProfile>("/users/me/health-profile"),

  upsertHealthProfile: (input: HealthProfileInput) =>
    apiFetch<UpsertProfileResponse>("/users/me/health-profile", { method: "PUT", body: input }),
};

export const mealPlans = {
  getWeeklyPlan: () => apiFetch<WeeklyPlan>("/meal-plans/current/weekly"),

  generatePlan: (trigger_reason = "manual") =>
    apiFetch<{ message: string; plan_id: string; plan_data: unknown }>("/meal-plans/generate", {
      method: "POST",
      body: { trigger_reason },
    }),
};

export const logs = {
  getDailyLogs: (date: string) => apiFetch<DailyLog>(`/logs/daily/${date}`),

  logWater: (date: string, amount_ml: number) =>
    apiFetch<{ message: string }>(`/logs/daily/${date}/water`, {
      method: "POST",
      body: { amount_ml },
    }),

  logMealFollowed: (date: string, plan_slot_id: string) =>
    apiFetch<{ message: string; log_id: string }>(`/logs/daily/${date}/meals`, {
      method: "POST",
      body: { plan_slot_id, adherence: "followed" },
    }),
};

export const readings = {
  list: (type: ReadingType, days = 30) =>
    apiFetch<HealthReading[]>("/health-readings", { query: { type, days } }),

  log: (input: {
    reading_type: ReadingType;
    value_mg_dl?: number;
    systolic_mm_hg?: number;
    diastolic_mm_hg?: number;
    context?: ReadingContext;
    note?: string;
  }) => apiFetch<LogReadingResponse>("/health-readings", { method: "POST", body: input }),
};

export const ingredients = {
  search: (q: string, limit = 20) =>
    apiFetch<{ results: Ingredient[]; total: number; page: number }>("/ingredients", {
      query: { q, limit },
    }),

  get: (id: string) => apiFetch<Ingredient>(`/ingredients/${id}`),
};
