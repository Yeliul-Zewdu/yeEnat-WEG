/**
 * HTTP client for the YeEnat Weg API.
 * - Attaches the bearer access token to authenticated requests.
 * - Normalizes the backend `{ error: { code, message_en, message_am } }` envelope
 *   into a thrown `ApiError`.
 * - Transparently refreshes the access token once on a TOKEN_EXPIRED 401, then retries.
 *   If refresh fails, clears tokens and invokes the registered `onUnauthorized` callback.
 */
import { API_BASE_URL } from "./config";
import { clearTokens, getTokens, setTokens } from "./storage";

export class ApiError extends Error {
  code: string;
  messageAm: string;
  status: number;
  detail: unknown;

  constructor(status: number, code: string, messageEn: string, messageAm: string, detail: unknown = null) {
    super(messageEn);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.messageAm = messageAm;
    this.detail = detail;
  }
}

let onUnauthorized: (() => void) | null = null;

/** Register a callback fired when the session can no longer be refreshed. */
export function setOnUnauthorized(cb: (() => void) | null): void {
  onUnauthorized = cb;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Whether to attach the Authorization header (default true). */
  auth?: boolean;
  /** Query params appended to the path. */
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = `${API_BASE_URL}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `${url}?${params.join("&")}` : url;
}

async function attemptRefresh(): Promise<boolean> {
  const tokens = await getTokens();
  if (!tokens?.refresh) return false;
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: tokens.refresh }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { access_token: string; refresh_token: string };
    await setTokens({ access: data.access_token, refresh: data.refresh_token });
    return true;
  } catch {
    return false;
  }
}

async function rawFetch<T>(path: string, options: RequestOptions, retrying: boolean): Promise<T> {
  const { method = "GET", body, auth = true, query } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const tokens = await getTokens();
    if (tokens?.access) headers["Authorization"] = `Bearer ${tokens.access}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let payload: any = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (res.ok) return payload as T;

  const err = payload?.error ?? {};
  const code: string = err.code ?? "HTTP_ERROR";

  // Token expired → refresh once, then retry the original request.
  if (auth && res.status === 401 && code === "TOKEN_EXPIRED" && !retrying) {
    const refreshed = await attemptRefresh();
    if (refreshed) return rawFetch<T>(path, options, true);
  }

  // Unrecoverable auth failure → drop session.
  if (res.status === 401) {
    await clearTokens();
    onUnauthorized?.();
  }

  throw new ApiError(
    res.status,
    code,
    err.message_en ?? `Request failed (${res.status})`,
    err.message_am ?? "ጥያቄ አልተሳካም",
    err.detail ?? null
  );
}

export function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return rawFetch<T>(path, options, false);
}
