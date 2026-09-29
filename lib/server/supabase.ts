import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/** Storage bucket for listing photos (created by the migration in supabase/migrations). */
export const PROPERTY_IMAGES_BUCKET = "property-images";

let client: SupabaseClient | undefined;

/**
 * Server-only Supabase client with the service role key. It bypasses row level security,
 * so it must never reach the browser (the `server-only` import enforces that) and every
 * route using it for writes must check the admin session first.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!client) {
    const { url, serviceRoleKey } = supabaseEnv();
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
