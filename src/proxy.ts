import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (!user) {
    if (isAdminPath && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (!isAdminPath) return supabaseResponse;

  // /admin → dashboard
  if (pathname === "/admin" || pathname === "/admin/") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // Resolve the profile role. If the table isn't created yet (pre-migration)
  // or the user has no row (project unseeded), treat as "unconfigured" so the
  // first login is never locked out. Once roles exist, only admin/editor may
  // enter the console.
  let role: "admin" | "editor" | "staff" | "unconfigured" = "unconfigured";
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.role) role = data.role;
  } catch {
    role = "unconfigured";
  }

  const allowed = role === "admin" || role === "editor" || role === "unconfigured";

  if (isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = allowed ? "/admin/dashboard" : "/admin/no-access";
    return NextResponse.redirect(url);
  }

  if (!allowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/no-access";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};