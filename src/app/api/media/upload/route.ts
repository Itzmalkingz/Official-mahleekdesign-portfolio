import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} exceeds the 10 MB limit.`;
  }
  return null;
}

function generateStoragePath(folder: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "png";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `admin/${folder}/${timestamp}_${random}.${ext}`;
}

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

export async function POST(request: NextRequest) {
  const { supabase, response } = await getSupabaseClient(request);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers: response.headers });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "projects";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400, headers: response.headers });
    }

    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400, headers: response.headers });
    }

    const path = generateStoragePath(folder, file.name);

    const { error: uploadError } = await supabase.storage
      .from("design-uploads")
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload] Storage error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500, headers: response.headers });
    }

    const { data: urlData } = supabase.storage.from("design-uploads").getPublicUrl(path);
    if (!urlData?.publicUrl) {
      // Cleanup on failure
      await supabase.storage.from("design-uploads").remove([path]);
      return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500, headers: response.headers });
    }

    return NextResponse.json({ url: urlData.publicUrl, path }, { headers: response.headers });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500, headers: response.headers });
  }
}