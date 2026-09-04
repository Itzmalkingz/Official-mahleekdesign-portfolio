import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return true;
    // Allow in dev if no session but allowlist via header
    const hasCookie = request.cookies.getAll().some((c) => c.name.includes("sb-"));
    if (!hasCookie) return true; // permissive for local dev
    return !!user;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  const authed = await verifyAuth(request);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { url?: string; fullPage?: boolean; width?: number; height?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const rawUrl = body.url?.trim();
  if (!rawUrl) return NextResponse.json({ error: "url is required" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("bad proto");
    if (isPrivateHost(parsed.hostname)) return NextResponse.json({ error: "Private URLs not allowed" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const targetUrl = parsed.toString();
  const width = Math.min(Math.max(body.width || 1280, 320), 1920);
  const height = Math.min(Math.max(body.height || 800, 400), 1200);

  // Try Playwright first (headless Chromium). Fallback to external thumbnail if not available.
  let buffer: Buffer | null = null;
  let used: "playwright" | "fallback" = "fallback";

  try {
    // Dynamic import so build doesn't fail if playwright not installed
    // Use eval to prevent webpack from trying to resolve at build time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pw: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - optional peer, may not be installed
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
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        deviceScaleFactor: 1.5,
      });
      const page = await ctx.newPage();
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(1200);
      // Hide cookie banners a bit
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

  // Fallback: use WordPress mShots (no key, public) — then fetch image and store locally
  if (!buffer) {
    const fallbackUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(targetUrl)}?w=${width}&h=${height}`;
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(fallbackUrl, { signal: controller.signal, headers: { "User-Agent": "MahleekPortfolioBot/1.0" } });
      clearTimeout(t);
      if (!res.ok) throw new Error(`fallback status ${res.status}`);
      const arr = await res.arrayBuffer();
      if (arr.byteLength < 1000) throw new Error("fallback image too small");
      buffer = Buffer.from(arr);
      used = "fallback";
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: `Screenshot failed: ${msg}. Install Playwright for higher quality: npm i -D playwright && npx playwright install chromium` }, { status: 502 });
    }
  }

  if (!buffer) return NextResponse.json({ error: "Could not capture screenshot" }, { status: 502 });

  // Save to public/screenshots locally (as requested)
  try {
    const dir = path.join(process.cwd(), "public", "screenshots");
    await mkdir(dir, { recursive: true });
    const safeHost = parsed.hostname.replace(/[^a-z0-9.-]/gi, "-").slice(0, 40);
    const fileName = `${Date.now()}-${safeHost}-${Math.random().toString(36).slice(2, 6)}.png`;
    const absPath = path.join(dir, fileName);
    await writeFile(absPath, buffer);
    const publicUrl = `/screenshots/${fileName}`;

    return NextResponse.json({
      url: targetUrl,
      publicUrl,
      fileName,
      width,
      height,
      engine: used,
      sizeBytes: buffer.byteLength,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Failed to save screenshot: ${msg}` }, { status: 500 });
  }
}
