import "server-only";
import { ApiError } from "./errors";
import { supabaseAdmin } from "./supabase";

type Limit = {
  /** What is being limited, e.g. "contact" or "login". */
  scope: string;
  /** Who: usually the hashed client IP from clientKey(). */
  key: string;
  limit: number;
  windowSeconds: number;
};

/**
 * Fixed-window rate limit shared by every server instance: the counter lives in Postgres
 * (public.hit_rate_limit), since in-memory counters don't work across Vercel functions.
 * Throws a 429 with Retry-After once the limit is passed.
 */
export async function rateLimit({ scope, key, limit, windowSeconds }: Limit): Promise<void> {
  const { data, error } = await supabaseAdmin()
    .rpc("hit_rate_limit", { p_key: `${scope}:${key}`, p_limit: limit, p_window_seconds: windowSeconds })
    .single<{ allowed: boolean; retry_after_seconds: number }>();
  if (error) throw error;

  if (!data.allowed) {
    throw new ApiError(429, "rate_limited", "Too many requests. Please try again later.", {
      "Retry-After": String(Math.max(1, data.retry_after_seconds)),
    });
  }
}
