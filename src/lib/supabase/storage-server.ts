import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side admin client using the service-role key.
 * NEVER import this module (directly or transitively) from a client
 * component or route that renders to the browser. The service-role key
 * bypasses Row Level Security and must never leave the server.
 */
export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** True when a working service-role client is available on the server. */
export function hasServiceRole(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Server-side: Generate a signed URL for a storage object using admin client.
 * Works for both public and private buckets. Bypasses RLS.
 * 
 * @param adminClient - The admin Supabase client (service role)
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns The signed URL or null if client not available
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
 * Server-side: Upload a file to storage using admin client and return a working URL (signed).
 * 
 * @param adminClient - The admin Supabase client (service role)
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param buffer - The file buffer to upload
 * @param options - Upload options
 * @returns The working URL or null on failure
 */
export async function uploadAndGetUrlAdmin(
  adminClient: SupabaseClient | null,
  bucket: string,
  path: string,
  buffer: Buffer,
  options?: { contentType?: string; cacheControl?: string; upsert?: boolean }
): Promise<string | null> {
  if (!adminClient) {
    console.warn("Admin client not available, cannot upload");
    return null;
  }
  
  const { error: uploadError } = await adminClient.storage.from(bucket).upload(path, buffer, {
    upsert: options?.upsert ?? false,
    contentType: options?.contentType,
    cacheControl: options?.cacheControl,
  });
  
  if (uploadError) {
    console.error(`Upload failed (admin) for ${bucket}/${path}:`, uploadError);
    return null;
  }
  
  // Generate signed URL (works for private buckets)
  return createSignedUrlAdmin(adminClient, bucket, path);
}

/**
 * Server-side: Try public URL first, fall back to signed URL
 */
export async function getStorageUrlAdmin(
  adminClient: SupabaseClient | null,
  bucket: string,
  path: string
): Promise<string | null> {
  if (!adminClient) return null;
  
  // Try public URL first
  const { data: publicData } = adminClient.storage.from(bucket).getPublicUrl(path);
  const publicUrl = publicData?.publicUrl;
  
  if (publicUrl) {
    try {
      const response = await fetch(publicUrl, { method: "HEAD" });
      if (response.ok) return publicUrl;
    } catch {
      // Fall through to signed URL
    }
  }
  
  // Fall back to signed URL
  return createSignedUrlAdmin(adminClient, bucket, path);
}