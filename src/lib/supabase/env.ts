/**
 * Supabase URL + anon/publishable key resolution.
 *
 * Supabase UI has migrated to calling the browser-embedded key the
 * "publishable key". Read either name so both conventions work.
 */
export function supabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function supabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}