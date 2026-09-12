import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Server-side Supabase client bound to the request session cookies.
 * Uses the anon key but authenticates as the logged-in user, so Row Level
 * Security applies. Use this in Server Components, Server Actions and
 * route handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` called from a Server Component — session refresh is
            // handled by the proxy (src/proxy.ts).
          }
        },
      },
    }
  );
}

export type Role = "admin" | "editor" | "staff" | "unconfigured";

export interface AdminProfile {
  user_id: string;
  email: string;
  full_name?: string | null;
  role: Role;
  avatar_url?: string | null;
}

/**
 * Resolve the signed-in user's profile. Returns an `AdminProfile` where the
 * role is `"unconfigured"` when the user has no profile row yet (project not
 * yet seeded) — kept so the owner never gets locked out before running the
 * seed migration. Once any profile exists with a role, only admin/editor
 * roles are allowed inside the admin console.
 */
export async function getProfile(): Promise<{
  user: User | null;
  profile: AdminProfile | null;
} | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email, full_name, role, avatar_url")
    .eq("user_id", user.id)
    .single();

  if (profile) {
    return {
      user,
      profile: {
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url,
      },
    };
  }

  // No profile row yet → treat as unconfigured (first-run/owner fallback).
  return {
    user,
    profile: {
      user_id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name as string | undefined,
      role: "unconfigured",
    },
  };
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** True if the signed-in user may use the admin console. */
export async function canAccessAdmin(): Promise<boolean> {
  const result = await getProfile();
  if (!result?.user) return false;
  const role = result.profile?.role;
  return role === "admin" || role === "editor" || role === "unconfigured";
}

/** True if the signed-in user has the `admin` role. */
export async function isAdmin(): Promise<boolean> {
  const result = await getProfile();
  return result?.profile?.role === "admin";
}