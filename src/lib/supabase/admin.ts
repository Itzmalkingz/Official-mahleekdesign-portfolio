import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Server-only admin client using the service-role key.
 *
 * NEVER import this module (directly or transitively) from a client
 * component or route that renders to the browser. The service-role key
 * bypasses Row Level Security and must never leave the server.
 *
 * If `SUPABASE_SERVICE_ROLE_KEY` is not configured, this returns null and
 * callers should fall back to the anon cookie client (`@/lib/supabase/server`).
 */
export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cachedClient;
}

/** True when a working service-role client is available on the server. */
export function hasServiceRole(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}