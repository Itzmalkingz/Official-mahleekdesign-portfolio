"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadFile(formData: FormData) {
  const supabase = await createClient();

  // Debug: check if we have a user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log("[uploadFile] auth user:", user?.id, "error:", authError?.message);

  const file = formData.get("file") as File;
  const path = formData.get("path") as string;
  const contentType = formData.get("contentType") as string | null;
  const cacheControl = formData.get("cacheControl") as string | null;

  if (!file || !path) {
    throw new Error("Missing file or path");
  }

  if (!user) {
    throw new Error("Not authenticated — cannot upload");
  }

  const { error: uploadError } = await supabase.storage
    .from("design-uploads")
    .upload(path, file, {
      contentType: contentType ?? undefined,
      cacheControl: cacheControl ?? undefined,
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadFile] upload error:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("design-uploads").getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Failed to generate public URL");
  }

  return data.publicUrl;
}