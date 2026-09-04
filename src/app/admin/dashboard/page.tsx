"use client";

import { useEffect, useState, FormEvent, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import toast, { Toaster } from "react-hot-toast";

type ScrapeResult = {
  url: string;
  title: string;
  description: string;
  tags: string[];
  services: string[];
  caseStudy: string;
  ogImage: string | null;
  headings: string[];
};

type ScreenshotResult = {
  url: string;
  publicUrl: string;
  fileName: string;
  engine: string;
};

type PreviewData = {
  title: string;
  description: string;
  live_url: string;
  tags: string;
  services: string;
  caseStudy: string;
  ogImage: string | null;
  screenshotUrl: string | null;
  screenshotEngine: string | null;
  featured: boolean;
  sort_order: number;
};

const MAX_IMAGE_MB = 8;
const isValidUrl = (s: string) => {
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
};

export default function AdminDashboardPage() {
  const [, setUser] = useState<unknown>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const router = useRouter();

  // Manual form state (still used for Design + editing)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"web" | "design">("web");
  const [liveUrl, setLiveUrl] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [caseStudy, setCaseStudy] = useState("");
  const [services, setServices] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // ---- Quick Add from URL (WEB ONLY) ----
  const [pasteUrl, setPasteUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const fetchProjects = useCallback(async (signal?: AbortSignal) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .abortSignal(signal as unknown as AbortSignal);
      if (error) {
        toast.error(`Load failed: ${error.message}`);
        return;
      }
      if (data) setProjects(data as Project[]);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          toast.error(error.message);
          router.push("/admin/login");
          return;
        }
        if (!session) {
          router.push("/admin/login");
          return;
        }
        setUser(session.user);
        await fetchProjects(controller.signal);
      } catch (e) {
        console.error(e);
        toast.error("Auth check failed");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    return () => controller.abort();
  }, [router, fetchProjects]);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategory("web");
    setLiveUrl("");
    setTags("");
    setImageFile(null);
    setAdditionalImages([]);
    setFeatured(false);
    setSortOrder(0);
    setCaseStudy("");
    setServices("");
    setEditingId(null);
    setExistingImageUrl("");
    setExistingImages([]);
  }, []);

  const resetPreview = useCallback(() => {
    setPasteUrl("");
    setPreview(null);
    setPreviewLoading(false);
  }, []);

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setCategory(project.category);
    setLiveUrl(project.live_url || "");
    setTags(project.tags?.join(", ") || "");
    setFeatured(project.featured);
    setSortOrder(project.sort_order ?? 0);
    setCaseStudy(project.case_study || "");
    setServices(project.services?.join(", ") || "");
    setExistingImageUrl(project.image_url || "");
    setExistingImages(project.images || []);
    setImageFile(null);
    setAdditionalImages([]);
    setPreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `File too large (max ${MAX_IMAGE_MB}MB)`;
    if (!file.type.startsWith("image/")) return "Only image files allowed";
    return null;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return null;
    }
    const safeExt = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 6) || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    const { error } = await supabase.storage.from("design-uploads").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error("Upload error:", error);
      const msg = (error as unknown as { message?: string })?.message || String(error);
      if (msg.toLowerCase().includes("bucket not found") || msg.toLowerCase().includes("bucketnotfound")) {
        toast.error("Bucket 'design-uploads' not found. Run supabase-migration.sql in Supabase SQL Editor to create it, then retry.");
      } else if (msg.toLowerCase().includes("row-level security") || msg.toLowerCase().includes("policy") || msg.toLowerCase().includes("not allowed")) {
        toast.error("Upload blocked by storage policy. Ensure you're signed in and the migration policies were applied.");
      } else {
        toast.error(`Upload failed: ${msg}`);
      }
      return null;
    }
    const { data: urlData } = supabase.storage.from("design-uploads").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  // ---- Quick Add logic (web only) ----
  const handleLoadPreview = async () => {
    const url = pasteUrl.trim() || liveUrl.trim();
    if (!url) {
      toast.error("Paste a project link first");
      return;
    }
    if (!isValidUrl(url)) {
      toast.error("Enter a valid URL — e.g. https://example.com");
      return;
    }
    // Ensure web category
    if (category !== "web") setCategory("web");

    setPreviewLoading(true);
    setPreview(null);
    try {
      // Scrape + screenshot in parallel (screenshot is optional — don't block preview)
      const scrapePromise = fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }).then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Scrape failed");
        return j as ScrapeResult;
      });

      const shotPromise = fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, fullPage: true, width: 1280, height: 800 }),
      })
        .then(async (r) => {
          const j = await r.json();
          if (!r.ok) throw new Error(j.error || "Screenshot failed");
          return j as ScreenshotResult;
        })
        .catch((e) => {
          console.warn("Screenshot fallback:", e);
          return null;
        });

      const [scrape, shot] = await Promise.all([scrapePromise, shotPromise]);

      setPreview({
        title: scrape.title || "",
        description: scrape.description || "",
        live_url: scrape.url || url,
        tags: (scrape.tags || []).join(", "),
        services: (scrape.services || []).join(", "),
        caseStudy: scrape.caseStudy || "",
        ogImage: scrape.ogImage || null,
        screenshotUrl: shot?.publicUrl || null,
        screenshotEngine: shot?.engine || null,
        featured: false,
        sort_order: 0,
      });
      // also sync liveUrl field
      setLiveUrl(scrape.url || url);
      toast.success(shot ? "Preview ready — with screenshot" : "Preview ready — edit and add");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAddFromPreview = async () => {
    if (!preview) return;
    if (!preview.title.trim()) {
      toast.error("Title is required in preview");
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const imageUrl = preview.screenshotUrl || preview.ogImage || "";
      const parsedTags = preview.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
      const parsedServices = preview.services.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);
      const projectData = {
        title: preview.title.trim().slice(0, 200),
        description: preview.description.trim().slice(0, 2000),
        category: "web" as const,
        image_url: imageUrl,
        images: imageUrl ? [imageUrl] : [],
        live_url: preview.live_url.trim().slice(0, 500),
        tags: parsedTags,
        featured: preview.featured,
        sort_order: Number.isFinite(preview.sort_order) ? Math.trunc(preview.sort_order) : 0,
        case_study: preview.caseStudy.trim().slice(0, 15000),
        services: parsedServices,
      };
      const { error } = await supabase.from("projects").insert(projectData);
      if (error) toast.error(`Add failed: ${error.message}`);
      else {
        toast.success("Project added from preview!");
        resetPreview();
        // keep liveUrl synced but clear preview
        await fetchProjects();
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (url) imageUrl = url;
        else {
          toast.error("Cover image upload failed — fix the bucket/policy error above and retry");
          return;
        }
      }
      let imageUrls = [...existingImages];
      if (category === "design" && additionalImages.length > 0) {
        for (const file of additionalImages) {
          const url = await uploadImage(file);
          if (url) imageUrls.push(url);
          else toast.error(`Failed to upload ${file.name} — skipped`);
        }
      }
      imageUrls = [...new Set(imageUrls.filter(Boolean))];
      const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
      const parsedServices = services.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);
      const sortSafe = Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0;
      const projectData = {
        title: title.trim().slice(0, 200),
        description: description.trim().slice(0, 2000),
        category,
        image_url: imageUrl || "",
        images: imageUrls,
        live_url: liveUrl.trim().slice(0, 500),
        tags: parsedTags,
        featured,
        sort_order: sortSafe,
        case_study: caseStudy.trim().slice(0, 15000),
        services: parsedServices,
      };
      if (editingId) {
        const { error: updateError } = await supabase.from("projects").update(projectData).eq("id", editingId);
        if (updateError) toast.error(`Update failed: ${updateError.message}`);
        else {
          toast.success("Project updated!");
          resetForm();
          await fetchProjects();
        }
      } else {
        const { error: insertError } = await supabase.from("projects").insert(projectData);
        if (insertError) toast.error(`Add failed: ${insertError.message}`);
        else {
          toast.success("Project added!");
          resetForm();
          await fetchProjects();
        }
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast.error(`Delete failed: ${error.message}`);
    else {
      toast.success("Deleted");
      if (editingId === id) resetForm();
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="section-padding" style={{ paddingTop: "9rem", paddingBottom: "4rem" }}>
        <div className="dashboard-grid">
          <div className="dashboard-header">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-btn" />
          </div>
          <div className="dashboard-section">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-block" />
          </div>
          <div className="dashboard-section">
            <div className="skeleton skeleton-line" />
            <div style={{ display: "grid", gap: "0.8rem", marginTop: "1rem" }}>
              <div className="skeleton skeleton-entry" />
              <div className="skeleton skeleton-entry" />
              <div className="skeleton skeleton-entry" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isWeb = category === "web";

  return (
    <div className="section-padding" style={{ paddingTop: "9rem", paddingBottom: "4rem" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15,15,17,0.95)",
            color: "#f6f1e8",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "0.85rem",
          },
        }}
      />

      <div className="dashboard-grid">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button className="btn-ghost" onClick={handleSignOut} style={{ minWidth: "auto" }}>
            Sign Out
          </button>
        </div>

        {/* ============== QUICK ADD FROM URL — WEB ONLY ============== */}
        {isWeb && !editingId && (
          <div className="dashboard-section" style={{ borderColor: "rgba(19,99,223,0.22)", background: "linear-gradient(180deg, rgba(19,99,223,0.07), white)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.35rem" }}>
              <span style={{ width: "2rem", height: "2rem", display: "grid", placeItems: "center", borderRadius: "0.5rem", background: "#1363df", color: "white", fontWeight: 900 }}>↗</span>
              <h2 style={{ margin: 0 }}>Quick Add from Link — Web Projects only</h2>
              <span style={{ marginLeft: "auto", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1363df", background: "rgba(19,99,223,0.1)", padding: "0.25rem 0.6rem", borderRadius: "999px" }}>Paste → Preview → Add</span>
            </div>
            <p style={{ margin: "0 0 1rem", color: "#58677d", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Paste a live website link below. We&apos;ll fetch the title, description, tags/services and generate a case study, plus capture a screenshot — then show you an <strong>editable preview</strong>. Tweak anything, then hit Add.
            </p>

            <div className="quick-add-bar">
              <input
                type="url"
                inputMode="url"
                placeholder="https://example.com  — paste link and press Load Preview"
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLoadPreview();
                  }
                }}
                aria-label="Paste live URL"
                disabled={previewLoading}
              />
              <button type="button" className="btn-primary" onClick={handleLoadPreview} disabled={previewLoading || !pasteUrl.trim()}>
                {previewLoading ? "Loading…" : "Load Preview"}
              </button>
              {preview && (
                <button type="button" className="btn-ghost" onClick={resetPreview} disabled={previewLoading}>
                  Clear
                </button>
              )}
            </div>

            {previewLoading && (
              <div className="preview-loading">
                <span className="spinner" aria-hidden />
                <span>Fetching site, generating case study and capturing screenshot…</span>
              </div>
            )}

            {preview && !previewLoading && (
              <div className="preview-card">
                <div className="preview-card-head">
                  <h3>Editable Preview</h3>
                  <span className="preview-hint">Review everything — you can edit all fields before adding</span>
                </div>

                {(preview.screenshotUrl || preview.ogImage) && (
                  <div className="preview-media">
                    { }
                    <img src={preview.screenshotUrl || preview.ogImage || ""} alt="Preview cover" />
                    <div className="preview-media-meta">
                      <span>{preview.screenshotUrl ? `Screenshot • ${preview.screenshotEngine}` : "OG image from site"}</span>
                      {preview.screenshotUrl && preview.ogImage && preview.screenshotUrl !== preview.ogImage && (
                        <button type="button" className="link-btn" onClick={() => setPreview((p) => (p ? { ...p, screenshotUrl: p.ogImage, screenshotEngine: "og-image" } : p))}>
                          Use OG image instead
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="preview-grid">
                  <div className="form-group">
                    <label>Title *</label>
                    <input type="text" value={preview.title} onChange={(e) => setPreview((p) => (p ? { ...p, title: e.target.value } : p))} placeholder="Project title" />
                  </div>
                  <div className="form-group">
                    <label>Live URL</label>
                    <input type="url" value={preview.live_url} onChange={(e) => setPreview((p) => (p ? { ...p, live_url: e.target.value } : p))} placeholder="https://…" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={preview.description} onChange={(e) => setPreview((p) => (p ? { ...p, description: e.target.value } : p))} placeholder="Short description" rows={3} />
                </div>

                <div className="preview-grid">
                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input type="text" value={preview.tags} onChange={(e) => setPreview((p) => (p ? { ...p, tags: e.target.value } : p))} placeholder="React, Branding, SEO" />
                  </div>
                  <div className="form-group">
                    <label>Services (comma-separated)</label>
                    <input type="text" value={preview.services} onChange={(e) => setPreview((p) => (p ? { ...p, services: e.target.value } : p))} placeholder="Web Design, Web Development" />
                  </div>
                </div>

                <div className="preview-grid">
                  <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", margin: 0 }}>
                      <input type="checkbox" checked={preview.featured} onChange={(e) => setPreview((p) => (p ? { ...p, featured: e.target.checked } : p))} style={{ width: "1rem", height: "1rem" }} />
                      Featured on homepage
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      value={String(preview.sort_order)}
                      onChange={(e) => setPreview((p) => (p ? { ...p, sort_order: Number.isFinite(Number(e.target.value)) ? Math.trunc(Number(e.target.value)) : 0 } : p))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Case Study — editable</label>
                  <textarea value={preview.caseStudy} onChange={(e) => setPreview((p) => (p ? { ...p, caseStudy: e.target.value } : p))} placeholder="Generated case study — edit to match your voice" style={{ minHeight: "12rem" }} />
                  <span className="field-hint">{preview.caseStudy.length} chars — auto-generated, please refine before adding</span>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={handleAddFromPreview} disabled={submitting}>
                    {submitting ? "Adding…" : "✓ Add to Projects"}
                  </button>
                  <button type="button" className="btn-ghost" onClick={resetPreview} disabled={submitting}>
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============== MANUAL FORM (all categories; design uses this exclusively) ============== */}
        <div className="dashboard-section">
          <h2>
            {editingId ? `Edit: ${title}` : isWeb ? "Or add manually" : "Add New Design"}
            {isWeb && !editingId && !preview && <span style={{ marginLeft: "0.6rem", fontSize: "0.75rem", fontWeight: 700, color: "#58677d" }}>— or fill the form below</span>}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.2rem" }}>
              <div className="form-group">
                <label htmlFor="d-title">Title *</label>
                <input id="d-title" type="text" placeholder="Project name" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
              </div>
              <div className="form-group">
                <label htmlFor="d-category">Category</label>
                <select id="d-category" value={category} onChange={(e) => setCategory(e.target.value as "web" | "design")}>
                  <option value="web">Web Development</option>
                  <option value="design">Graphic Design</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="d-desc">Description</label>
              <textarea id="d-desc" placeholder="Brief project description..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
            </div>

            <div className="form-group">
              <label htmlFor="d-url">Live URL {isWeb && <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 600, color: "#1363df" }}>(paste here or use Quick Add above)</span>}</label>
              <input id="d-url" type="url" placeholder="https://example.com" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="d-tags">Tags (comma-separated)</label>
              <input id="d-tags" type="text" placeholder="Brand Design, Logo, Social Media" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="d-services">Services (comma-separated)</label>
              <input id="d-services" type="text" placeholder="Brand Strategy, Web Design, UI/UX" value={services} onChange={(e) => setServices(e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.2rem" }}>
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label htmlFor="d-featured" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input id="d-featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ width: "1rem", height: "1rem" }} />
                  Featured on homepage
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="d-sort">Sort Order</label>
                <input
                  id="d-sort"
                  type="number"
                  placeholder="0"
                  value={String(sortOrder)}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setSortOrder(Number.isFinite(n) ? Math.trunc(n) : 0);
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="d-casestudy">Case Study</label>
              <textarea id="d-casestudy" placeholder="Detailed case study: the problem, process, and results..." value={caseStudy} onChange={(e) => setCaseStudy(e.target.value)} style={{ minHeight: "8rem" }} maxLength={15000} />
              <span className="field-hint">{caseStudy.length} / 15000</span>
            </div>

            <div className="form-group">
              <label htmlFor="d-image">Cover Image</label>
              {existingImageUrl && !imageFile && (
                <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  { }
                  <img src={existingImageUrl} alt="Current" style={{ width: "4rem", height: "3rem", objectFit: "cover", borderRadius: "0.4rem" }} />
                  <span style={{ color: "#7d776f", fontSize: "0.85rem" }}>Current cover</span>
                </div>
              )}
              {imageFile && (
                <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ color: "#1363df", fontSize: "0.85rem" }}>New: {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)</span>
                  <button type="button" className="link-btn" onClick={() => setImageFile(null)}>Remove</button>
                </div>
              )}
              <input
                id="d-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f) {
                    const err = validateFile(f);
                    if (err) {
                      toast.error(err);
                      e.target.value = "";
                      return;
                    }
                  }
                  setImageFile(f);
                }}
                style={{ padding: "0.5rem", fontSize: "0.85rem" }}
              />
            </div>

            {category === "design" && (
              <div className="form-group">
                <label htmlFor="d-images">Additional Images (for albums)</label>
                {existingImages.length > 0 && (
                  <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    {existingImages.map((img, idx) => (
                      <span key={`${img}-${idx}`} style={{ position: "relative", display: "inline-flex" }}>
                        { }
                        <img src={img} alt="" style={{ width: "3rem", height: "3rem", objectFit: "cover", borderRadius: "0.3rem", opacity: 0.85 }} />
                        <button
                          type="button"
                          onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
                          aria-label="Remove image"
                          style={{ position: "absolute", top: -6, right: -6, width: "1.1rem", height: "1.1rem", borderRadius: "50%", border: "none", background: "#071a35", color: "white", fontSize: "0.7rem", cursor: "pointer", lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <span style={{ color: "#7d776f", fontSize: "0.85rem" }}>{existingImages.length} in gallery</span>
                  </div>
                )}
                <input
                  id="d-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    for (const f of files) {
                      const err = validateFile(f);
                      if (err) {
                        toast.error(`${f.name}: ${err}`);
                        return;
                      }
                    }
                    setAdditionalImages(files);
                  }}
                  style={{ padding: "0.5rem", fontSize: "0.85rem" }}
                />
                {additionalImages.length > 0 && <span className="field-hint">{additionalImages.length} new file(s) selected</span>}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? (editingId ? "Updating..." : "Uploading...") : editingId ? "Update Project" : "Add Project"}
              </button>
              {editingId && (
                <button type="button" className="btn-ghost" onClick={resetForm} style={{ minWidth: "auto" }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="dashboard-section">
          <h2>Existing Entries ({projects.length})</h2>
          {projects.length === 0 ? (
            <p style={{ color: "#7d776f" }}>No entries yet. Add your first project above.</p>
          ) : (
            <div className="entry-list">
              {projects.map((project) => (
                <div key={project.id} className="entry-row" style={{ opacity: editingId === project.id ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  {project.image_url ? (
                     
                    <img src={project.image_url} alt={project.title} className="entry-thumb" loading="lazy" />
                  ) : (
                    <div className="entry-thumb" style={{ background: "linear-gradient(135deg, rgba(19,99,223,0.15), rgba(19,99,223,0.05))", display: "grid", placeItems: "center", fontSize: "0.9rem", fontWeight: 900, color: "#1363df" }}>
                      {project.title?.[0] || "?"}
                    </div>
                  )}
                  <div className="entry-info">
                    <h3>
                      {project.title}
                      {project.featured && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", background: "rgba(19,99,223,0.1)", color: "#1363df", padding: "0.15rem 0.5rem", borderRadius: "2rem", verticalAlign: "middle" }}>Featured</span>}
                    </h3>
                    <span>
                      {project.category}
                      {project.tags?.length ? ` — ${project.tags.join(", ")}` : ""}
                      {project.sort_order > 0 ? ` | Order: ${project.sort_order}` : ""}
                    </span>
                    {project.live_url && <span style={{ display: "block", marginTop: "0.15rem", textTransform: "none", letterSpacing: 0, color: "#58677d" }}>{project.live_url}</span>}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn-ghost" type="button" onClick={() => startEdit(project)} style={{ minWidth: "auto", fontSize: "0.85rem" }}>
                      Edit
                    </button>
                    <button className="btn-danger" type="button" onClick={() => handleDelete(project.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
