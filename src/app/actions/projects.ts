"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Project, ProjectImage, ProjectFeature } from "@/lib/types";

interface ImageInput {
  file?: File;
  url?: string;
  altText?: string;
  sortOrder?: number;
}

interface ProjectInput {
  title: string;
  slug: string;
  category: Project["category"];
  client?: string | null;
  industry?: string | null;
  year?: string | null;
  shortDescription: string;
  challenge?: string | null;
  thinking?: string | null;
  solution?: string | null;
  outcome?: string | null;
  coverImage?: File | string | null;
  images?: ImageInput[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  sortOrder?: number;
  published?: boolean;
  featured?: boolean;
  tags?: string[];
  services?: string[];
  technologies?: string[];
  features?: Omit<ProjectFeature, "id" | "project_id" | "sort_order">[];
  websitePreviewUrl?: string | null;
  websitePreviewStatus?: Project["website_preview_status"];
  websitePreviewGeneratedAt?: string | null;
  websitePreviewViewport?: Project["website_preview_viewport"];
  websitePreviewWidth?: number | null;
  websitePreviewHeight?: number | null;
  websitePreviewEngine?: string | null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateStoragePath(folder: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "png";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `admin/${folder}/${timestamp}_${random}.${ext}`;
}

async function uploadFileToStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  folder: string
): Promise<{ url: string; path: string }> {
  const path = generateStoragePath(folder, file.name);

  const { error: uploadError } = await supabase.storage
    .from("design-uploads")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from("design-uploads").getPublicUrl(path);
  if (!urlData?.publicUrl) {
    await supabase.storage.from("design-uploads").remove([path]);
    throw new Error("Failed to generate public URL");
  }

  return { url: urlData.publicUrl, path };
}

async function deleteFileFromStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string
): Promise<void> {
  if (!path || (!path.startsWith("admin/") && !path.startsWith("project-previews/"))) {
    return;
  }
  await supabase.storage.from("design-uploads").remove([path]);
}

function extractStoragePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const bucketIndex = pathname.indexOf("/design-uploads/");
    if (bucketIndex === -1) return null;
    return pathname.slice(bucketIndex + "/design-uploads/".length);
  } catch {
    return null;
  }
}

export async function saveProject(input: ProjectInput, mode: "create" | "edit", projectId?: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const profile = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
  if (profile.error || !profile.data || !["admin", "editor"].includes(profile.data.role)) {
    throw new Error("Insufficient permissions");
  }

  const title = input.title.trim();
  const slug = input.slug.trim() || slugify(title);
  if (!title) throw new Error("Title is required");
  if (!slug) throw new Error("Slug is required");

  // Track uploaded paths for cleanup on failure
  const uploadedPaths: string[] = [];

  try {
    // Handle cover image
    let coverUrl: string | null = null;
    if (input.coverImage instanceof File) {
      const result = await uploadFileToStorage(supabase, input.coverImage, "projects/cover");
      coverUrl = result.url;
      uploadedPaths.push(result.path);
    } else if (typeof input.coverImage === "string" && input.coverImage) {
      coverUrl = input.coverImage;
    }

    // Handle gallery images
    const galleryUrls: ProjectImage[] = [];
    const newImageFiles = (input.images || []).filter((img): img is ImageInput & { file: File } => img.file instanceof File);
    const existingImages = (input.images || []).filter((img): img is ImageInput & { url: string } => typeof img.url === "string");

    for (let i = 0; i < newImageFiles.length; i++) {
      const img = newImageFiles[i];
      const result = await uploadFileToStorage(supabase, img.file, "projects");
      galleryUrls.push({
        image_url: result.url,
        alt_text: img.altText || "",
        sort_order: img.sortOrder ?? i,
      });
      uploadedPaths.push(result.path);
    }

    // Add existing images (already uploaded)
    for (let i = 0; i < existingImages.length; i++) {
      const img = existingImages[i];
      galleryUrls.push({
        image_url: img.url,
        alt_text: img.altText || "",
        sort_order: img.sortOrder ?? i,
      });
    }

    // Sort by sort_order
    galleryUrls.sort((a, b) => a.sort_order - b.sort_order);

    const payload = {
      title,
      slug,
      category: input.category,
      client: input.client?.trim() || null,
      industry: input.industry?.trim() || null,
      year: input.year?.trim() || null,
      short_description: input.shortDescription.trim(),
      challenge: input.challenge?.trim() || null,
      thinking: input.thinking?.trim() || null,
      solution: input.solution?.trim() || null,
      outcome: input.outcome?.trim() || null,
      cover_image: coverUrl || "",
      images: galleryUrls,
      live_url: input.liveUrl?.trim() || null,
      github_url: input.githubUrl?.trim() || null,
      meta_title: input.metaTitle?.trim() || null,
      meta_description: input.metaDescription?.trim() || null,
      og_image: input.ogImage?.trim() || null,
      sort_order: input.sortOrder ?? 0,
      published: input.published ?? false,
      featured: input.featured ?? false,
      tags: input.tags || [],
      services: input.services || [],
      technologies: input.technologies || [],
      features: (input.features || []).map((f, idx) => ({
        name: f.name.trim(),
        description: f.description || "",
        sort_order: idx,
      })),
      website_preview_url: input.websitePreviewUrl?.trim() || null,
      website_preview_status: input.websitePreviewStatus || "not_generated",
      website_preview_generated_at: input.websitePreviewGeneratedAt,
      website_preview_viewport: input.websitePreviewViewport || "desktop",
      website_preview_width: input.websitePreviewWidth,
      website_preview_height: input.websitePreviewHeight,
      website_preview_engine: input.websitePreviewEngine,
    };

    let entityId: string;

    if (mode === "edit" && projectId) {
      // Fetch existing project to get old images for cleanup
      const { data: existing } = await supabase
        .from("projects")
        .select("cover_image, images")
        .eq("id", projectId)
        .single();

      if (existing) {
        // Delete old cover if changed
        if (existing.cover_image && existing.cover_image !== coverUrl) {
          const oldPath = extractStoragePath(existing.cover_image);
          if (oldPath) await deleteFileFromStorage(supabase, oldPath);
        }

        // Delete old gallery images not in new list
        const newUrls = new Set(galleryUrls.map((g) => g.image_url));
        for (const oldImg of existing.images || []) {
          if (!newUrls.has(oldImg.image_url)) {
            const oldPath = extractStoragePath(oldImg.image_url);
            if (oldPath) await deleteFileFromStorage(supabase, oldPath);
          }
        }
      }

      const { data, error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", projectId)
        .select("id")
        .single();

      if (error) throw error;
      entityId = data.id;
    } else {
      const { data, error } = await supabase
        .from("projects")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;
      entityId = data.id;
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      actor_email: user.email,
      action: mode === "edit" ? "updated project" : "created project",
      entity_type: "project",
      entity_id: entityId,
      entity_title: slug,
    });

    revalidatePath("/admin/projects");
    revalidatePath("/work");
    revalidatePath(`/work/${slug}`);

    return { success: true, id: entityId, slug };
  } catch (err) {
    // Cleanup uploaded files on failure
    for (const path of uploadedPaths) {
      await deleteFileFromStorage(supabase, path);
    }
    const msg = err instanceof Error ? err.message : "Could not save project";
    throw new Error(msg);
  }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const profile = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
  if (profile.error || !profile.data || profile.data.role !== "admin") {
    throw new Error("Admin only");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("cover_image, images, slug")
    .eq("id", projectId)
    .single();

  if (project) {
    if (project.cover_image) {
      const path = extractStoragePath(project.cover_image);
      if (path) await deleteFileFromStorage(supabase, path);
    }
    for (const img of project.images || []) {
      const path = extractStoragePath(img.image_url);
      if (path) await deleteFileFromStorage(supabase, path);
    }
  }

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;

  revalidatePath("/admin/projects");
  revalidatePath("/work");

  return { success: true };
}