import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

async function getSupabaseClient(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  return { supabase, response };
}

export async function DELETE(request: NextRequest) {
  const { supabase, response } = await getSupabaseClient(request);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers: response.headers });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Path parameter required" }, { status: 400, headers: response.headers });
    }

    // Only allow deletion from admin folders
    if (!path.startsWith("admin/") && !path.startsWith("project-previews/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400, headers: response.headers });
    }

    const { error } = await supabase.storage.from("design-uploads").remove([path]);

    if (error) {
      console.error("[delete] Storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers });
    }

    return NextResponse.json({ success: true }, { headers: response.headers });
  } catch (err) {
    console.error("[delete] Unexpected error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500, headers: response.headers });
  }
}