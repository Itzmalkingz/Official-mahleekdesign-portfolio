import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/env";
import { getAdminClient } from "@/lib/supabase/admin";
import { uploadAndGetUrlAdmin } from "@/lib/supabase/storage-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isPrivateHost(host: string) {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host.endsWith(".local")
  );
}

async function verifyAuth(request: NextRequest): Promise<boolean> {
  try {
    const supabase = createServerClient(
      supabaseUrl(),
      supabaseAnonKey(),
      {
        cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return true;
    const hasCookie = request.cookies.getAll().some((c) => c.name.includes("sb-"));
    if (!hasCookie) return true;
    return !!user;
  } catch {
    return true;
  }
}

async function uploadToSupabaseStorage(buffer: Buffer, projectId: string, ext: string = "webp"): Promise<string> {
  const admin = getAdminClient();
  if (!admin) {
    throw new Error("Service role key not configured — cannot upload to Supabase Storage");
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const path = `project-previews/${projectId}/website-preview-${timestamp}-${random}.${ext}`;

  const url = await uploadAndGetUrlAdmin(admin, "design-uploads", path, buffer, {
    contentType: `image/${ext}`,
    cacheControl: "31536000",
  });
  
  if (!url) throw new Error("Failed to upload file and generate URL");
  return url;
}

async function deleteOldPreview(projectId: string): Promise<void> {
  const admin = getAdminClient();
  if (!admin) return;

  const { data: files } = await admin.storage
    .from("design-uploads")
    .list(`project-previews/${projectId}`, { limit: 100 });

  if (files && files.length > 0) {
    const paths = files.map((f) => `project-previews/${projectId}/${f.name}`);
    await admin.storage.from("design-uploads").remove(paths);
  }
}

async function updateProjectPreview(
  projectId: string,
  updates: {
    website_preview_url?: string;
    website_preview_status: "not_generated" | "generating" | "ready" | "failed" | "manual";
    website_preview_generated_at?: string | null;
    website_preview_viewport?: "desktop" | "mobile";
    website_preview_width?: number;
    website_preview_height?: number;
    website_preview_engine?: string;
  }
): Promise<void> {
  const admin = getAdminClient();
  if (!admin) {
    throw new Error("Service role key not configured — cannot update project");
  }

  const { error } = await admin
    .from("projects")
    .update(updates)
    .eq("id", projectId);

  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const authed = await verifyAuth(request);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    url?: string;
    projectId?: string;
    fullPage?: boolean;
    width?: number;
    height?: number;
    viewport?: "desktop" | "mobile";
  };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const rawUrl = body.url?.trim();
  if (!rawUrl) return NextResponse.json({ error: "url is required" }, { status: 400 });
  // projectId is optional - if not provided, we just return the screenshot URL without saving to DB

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("bad proto");
    if (isPrivateHost(parsed.hostname)) return NextResponse.json({ error: "Private URLs not allowed" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const targetUrl = parsed.toString();
  const viewport = body.viewport || "desktop";
  const width = viewport === "mobile" ? 390 : Math.min(Math.max(body.width || 1280, 320), 1920);
  const height = viewport === "mobile" ? 844 : Math.min(Math.max(body.height || 800, 400), 1200);

  // If projectId provided, mark project as generating
  if (body.projectId) {
    try {
      await updateProjectPreview(body.projectId, {
        website_preview_status: "generating",
        website_preview_viewport: viewport,
        website_preview_width: width,
        website_preview_height: height,
      });
    } catch (e) {
      console.warn("Could not mark project as generating:", e);
    }
  }

  let buffer: Buffer | null = null;
  let used: "playwright" | "fallback" = "fallback";

  try {
    let pw: any = null;
    try {
      pw = await eval('import("playwright")').catch(() => null);
    } catch {
      pw = null;
    }
    if (pw && (pw.chromium || pw.default?.chromium)) {
      const chromium = pw.chromium || pw.default.chromium;
      const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });
      const ctx = await browser.newContext({
        viewport: { width, height },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        deviceScaleFactor: viewport === "mobile" ? 2 : 1.5,
        isMobile: viewport === "mobile",
        hasTouch: viewport === "mobile",
      });
      const page = await ctx.newPage();
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1500);
      try { await page.evaluate(() => window.scrollTo(0, 0)); } catch {}
      const screenshot = await page.screenshot({ fullPage: body.fullPage !== false, type: "png" });
      buffer = Buffer.from(screenshot);
      used = "playwright";
      await browser.close();
    }
  } catch (e) {
    console.warn("Playwright screenshot failed, falling back:", e);
    buffer = null;
  }

  if (!buffer) {
    const fallbackUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(targetUrl)}?w=${width}&h=${height}`;
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(fallbackUrl, { signal: controller.signal, headers: { "User-Agent": "MahleekPortfolioBot/1.0" } });
      clearTimeout(t);
      if (!res.ok) throw new Error(`fallback status ${res.status}`);
      const arr = await res.arrayBuffer();
      if (arr.byteLength < 1000) throw new Error("fallback image too small");
      buffer = Buffer.from(arr);
      used = "fallback";
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (body.projectId) {
        await updateProjectPreview(body.projectId, {
          website_preview_status: "failed",
          website_preview_engine: "fallback",
        });
      }
      return NextResponse.json(
        { error: `Screenshot failed: ${msg}. Install Playwright for higher quality: npm i -D playwright && npx playwright install chromium` },
        { status: 502 }
      );
    }
  }

  if (!buffer) {
    if (body.projectId) {
      await updateProjectPreview(body.projectId, { website_preview_status: "failed" });
    }
    return NextResponse.json({ error: "Could not capture screenshot" }, { status: 502 });
  }

  // Convert to WebP for optimization
  let finalBuffer = buffer;
  let finalExt = "webp";
  try {
    const sharp = await eval('import("sharp")').catch(() => null);
    if (sharp && sharp.default) {
      finalBuffer = await sharp.default(buffer).webp({ quality: 85, effort: 4 }).toBuffer();
      finalExt = "webp";
    }
  } catch {
    // sharp not available, use PNG
    finalExt = "png";
  }

  try {
    let publicUrl: string;

    if (body.projectId) {
      // Delete old preview first
      await deleteOldPreview(body.projectId);

      // Upload new preview to project folder
      publicUrl = await uploadToSupabaseStorage(finalBuffer, body.projectId, finalExt);

      // Update project with new preview
      await updateProjectPreview(body.projectId, {
        website_preview_url: publicUrl,
        website_preview_status: "ready",
        website_preview_generated_at: new Date().toISOString(),
        website_preview_engine: used,
      });
    } else {
      // For import flow (no projectId), upload to temp folder
      const tempPath = `temp/import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${finalExt}`;
      const admin = getAdminClient();
      if (admin) {
        const { error } = await admin.storage
          .from("design-uploads")
          .upload(tempPath, finalBuffer, {
            upsert: false,
            contentType: `image/${finalExt}`,
            cacheControl: "31536000",
          });
        if (error) throw error;
        const { data } = admin.storage.from("design-uploads").getPublicUrl(tempPath);
        publicUrl = data.publicUrl;
      } else {
        // Fallback: return base64 data URL (not ideal but works for preview)
        publicUrl = `data:image/${finalExt};base64,${finalBuffer.toString("base64")}`;
      }
    }

    return NextResponse.json({
      url: targetUrl,
      previewUrl: publicUrl,
      width,
      height,
      engine: used,
      sizeBytes: finalBuffer.byteLength,
      viewport,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (body.projectId) {
      await updateProjectPreview(body.projectId, {
        website_preview_status: "failed",
        website_preview_engine: used,
      });
    }
    return NextResponse.json({ error: `Failed to save screenshot: ${msg}` }, { status: 500 });
  }
}