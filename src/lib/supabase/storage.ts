import { supabase } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generate a signed URL for a storage object.
 * Works for both public and private buckets.
 * 
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns The signed URL or null if client not available
 */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) {
      console.error(`Failed to create signed URL for ${bucket}/${path}:`, error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error(`Exception creating signed URL for ${bucket}/${path}:`, err);
    return null;
  }
}

/**
 * Get a public URL for a storage object.
 * Only works if the bucket is public.
 * Falls back to signed URL if public URL fails or bucket is private.
 * 
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public or signed URL
 */
export async function getStorageUrl(
  bucket: string,
  path: string
): Promise<string | null> {
  // First try public URL (fastest, no expiration)
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = publicData?.publicUrl;
  
  if (publicUrl) {
    // Verify the URL works by doing a HEAD request
    try {
      const response = await fetch(publicUrl, { method: "HEAD" });
      if (response.ok) return publicUrl;
    } catch {
      // Network error, fall through to signed URL
    }
  }
  
  // Fall back to signed URL
  return createSignedUrl(bucket, path);
}

/**
 * Server-side version using admin client (service role key)
 * This bypasses RLS and can generate signed URLs for any bucket
 */
export async function createSignedUrlAdmin(
  adminClient: SupabaseClient | null,
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!adminClient) {
    console.warn("Admin client not available, cannot create signed URL");
    return null;
  }
  
  try {
    const { data, error } = await adminClient.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) {
      console.error(`Failed to create signed URL (admin) for ${bucket}/${path}:`, error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error(`Exception creating signed URL (admin) for ${bucket}/${path}:`, err);
    return null;
  }
}

/**
 * Upload a file to storage and return a working URL (signed or public)
 * 
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param file - The file/buffer to upload
 * @param options - Upload options
 * @returns The working URL or null on failure
 */
export async function uploadAndGetUrl(
  bucket: string,
  path: string,
  file: File | Buffer,
  options?: { contentType?: string; cacheControl?: string; upsert?: boolean }
): Promise<string> {
  // Ensure session is loaded/refreshed before upload
  await supabase.auth.getSession();

  const { error: uploadError, data: uploadData } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: options?.upsert ?? false,
    contentType: options?.contentType,
    cacheControl: options?.cacheControl,
  });
  
  if (uploadError) {
    console.error(`Upload failed for ${bucket}/${path}:`, uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  console.log(`Upload successful:`, uploadData);
  
  // Try public URL first
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = publicData?.publicUrl;
  
  if (publicUrl) {
    try {
      const response = await fetch(publicUrl, { method: "HEAD" });
      if (response.ok) return publicUrl;
      console.warn(`Public URL returned ${response.status}, falling back to signed URL`);
    } catch (e) {
      console.warn(`Public URL check failed:`, e);
    }
  }
  
  // Fall back to signed URL
  const signedUrl = await createSignedUrl(bucket, path);
  if (!signedUrl) throw new Error("Failed to create signed URL");
  return signedUrl;
}