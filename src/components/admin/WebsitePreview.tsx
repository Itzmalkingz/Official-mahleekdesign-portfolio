"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Project, PreviewStatus } from "@/lib/types";
import { IconExternal, IconRefresh, IconUpload, IconTrash, IconCheck, IconAlert, IconLoader } from "./icons";

const statusLabels: Record<PreviewStatus, string> = {
  not_generated: "Not Generated",
  generating: "Generating…",
  ready: "Ready",
  failed: "Failed",
  manual: "Manually Uploaded",
};

const statusColors: Record<PreviewStatus, string> = {
  not_generated: "var(--aslate)",
  generating: "var(--ablue)",
  ready: "var(--agreen)",
  failed: "var(--ared)",
  manual: "var(--aorange)",
};

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

interface Props {
  project: Project | null;
  liveUrl: string;
  onLiveUrlChange: (url: string) => void;
  onPreviewUpdate: (updates: Partial<Project>) => void;
  isSaving?: boolean;
  hideUrlInput?: boolean;
}

export default function WebsitePreview({
  project,
  liveUrl,
  onLiveUrlChange,
  onPreviewUpdate,
  isSaving,
  hideUrlInput,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (project?.website_preview_url) {
      setPreviewUrl(project.website_preview_url);
    }
  }, [project?.website_preview_url]);

  const currentStatus: PreviewStatus = project?.website_preview_status ?? "not_generated";
  const generatedAt = project?.website_preview_generated_at;
  const viewport = project?.website_preview_viewport ?? "desktop";
  const engine = project?.website_preview_engine;

  const handleGenerate = useCallback(async () => {
    if (!liveUrl.trim()) return toast.error("Enter a website URL first");
    if (!isValidUrl(liveUrl)) return toast.error("Please enter a valid URL (e.g. https://example.com)");
    if (!project?.id) return toast.error("Project must be saved first");
    if (generating) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: liveUrl,
          projectId: project.id,
          viewport,
          fullPage: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Screenshot generation failed");

      setPreviewUrl(data.previewUrl);
      onPreviewUpdate({
        website_preview_url: data.previewUrl,
        website_preview_status: "ready",
        website_preview_generated_at: data.generatedAt ?? new Date().toISOString(),
        website_preview_width: data.width,
        website_preview_height: data.height,
        website_preview_engine: data.engine,
        website_preview_viewport: viewport,
      });
      toast.success("Preview generated successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast.error(msg);
      onPreviewUpdate({ website_preview_status: "failed" });
    } finally {
      setGenerating(false);
    }
  }, [liveUrl, project?.id, viewport, generating, onPreviewUpdate]);

  const handleRegenerate = useCallback(async () => {
    if (!project?.id) return toast.error("Project must be saved first");
    if (!liveUrl.trim()) return toast.error("Enter a website URL first");
    if (!confirm("Replace the current preview with a fresh screenshot?")) return;
    await handleGenerate();
  }, [project?.id, liveUrl, handleGenerate]);

  const handleManualUpload = useCallback(async (file: File) => {
    if (!project?.id) return toast.error("Project must be saved first");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
      const path = `project-previews/${project.id}/manual-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("design-uploads")
        .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "31536000" });
      if (error) throw error;

      const { data } = supabase.storage.from("design-uploads").getPublicUrl(path);
      const url = data.publicUrl;

      setPreviewUrl(url);
      onPreviewUpdate({
        website_preview_url: url,
        website_preview_status: "manual",
        website_preview_generated_at: new Date().toISOString(),
        website_preview_engine: "manual",
      });
      toast.success("Preview uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }, [project?.id, onPreviewUpdate]);

  const handleRemovePreview = useCallback(async () => {
    if (!project?.id) return;
    if (!confirm("Remove this preview? The live URL will be kept.")) return;
    try {
      await supabase.storage.from("design-uploads").remove([`project-previews/${project.id}`]);
    } catch {}
    setPreviewUrl("");
    onPreviewUpdate({
      website_preview_url: "",
      website_preview_status: "not_generated",
      website_preview_generated_at: null,
      website_preview_engine: null,
    });
    toast.success("Preview removed");
  }, [project?.id, onPreviewUpdate]);

  const handleOpenWebsite = useCallback(() => {
    if (liveUrl.trim() && isValidUrl(liveUrl)) {
      window.open(liveUrl.startsWith("http") ? liveUrl : `https://${liveUrl}`, "_blank", "noopener,noreferrer");
    }
  }, [liveUrl]);

  const handleIframeLoad = useCallback(() => setIframeError(false), []);
  const handleIframeError = useCallback(() => setIframeError(true), []);

  return (
    <>
      <section className="ac-card">
        <div className="ac-card-head">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            Website Preview
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.15rem 0.5rem",
                borderRadius: 999,
                background: `${statusColors[currentStatus]}20`,
                color: statusColors[currentStatus],
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {statusLabels[currentStatus]}
            </span>
          </div>
        </div>
        <div className="ac-card-pad">
        {/* Live URL Input */}
        {!hideUrlInput && (
        <div style={{ marginBottom: "1.25rem" }}>
          <label className="ac-label" style={{ display: "block", marginBottom: "0.4rem" }}>
            Live Website URL
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="ac-input"
              style={{ flex: 1, minWidth: 280 }}
              placeholder="https://example.com"
              value={liveUrl}
              onChange={(e) => onLiveUrlChange(e.target.value)}
              disabled={generating || isSaving}
            />
            <button
              className="ac-btn primary"
              disabled={generating || isSaving || !liveUrl.trim() || !isValidUrl(liveUrl)}
              onClick={handleGenerate}
            >
              <IconLoader size={14} style={{ animation: generating ? "spin 1s linear infinite" : "none" }} />
              {generating ? "Generating…" : "Generate Preview"}
            </button>
            {previewUrl && (
              <button className="ac-btn ghost" onClick={handleOpenWebsite} title="Open website">
                <IconExternal size={14} /> Open Site
              </button>
            )}
          </div>
          {!liveUrl.trim() && (
            <p style={{ fontSize: "0.75rem", color: "var(--aslate)", marginTop: "0.35rem" }}>
              Enter a live website URL and click Generate Preview to capture a screenshot.
            </p>
          )}
          {liveUrl.trim() && !isValidUrl(liveUrl) && (
            <p style={{ fontSize: "0.75rem", color: "var(--ared)", marginTop: "0.35rem" }}>
              Invalid URL format. Use https://example.com
            </p>
          )}
        </div>
      )}

        {/* Preview Display */}
        {previewUrl && (
          <div style={{ marginBottom: "1rem" }}>
            <label className="ac-label" style={{ display: "block", marginBottom: "0.4rem" }}>
              Generated Preview
            </label>
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--aline)", background: "var(--apaper-1)" }}>
              <div style={{ aspectRatio: "16/10", maxWidth: "100%", overflow: "hidden" }}>
                <img
                  src={previewUrl}
                  alt="Website preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "0.75rem 1rem",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  color: "white",
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <span>Generated: {formatDate(generatedAt)}</span>
                  {viewport && (
                    <span style={{ padding: "0.1rem 0.4rem", borderRadius: 4, background: "rgba(255,255,255,0.2)", fontSize: "0.65rem" }}>
                      {viewport}
                    </span>
                  )}
                  {engine && (
                    <span style={{ padding: "0.1rem 0.4rem", borderRadius: 4, background: "rgba(255,255,255,0.2)", fontSize: "0.65rem" }}>
                      {engine}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button
                    className="ac-btn sm ghost"
                    style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                    onClick={handleRegenerate}
                    disabled={generating}
                    title="Regenerate preview"
                  >
                    <IconRefresh size={12} />
                  </button>
                  <button
                    className="ac-btn sm ghost"
                    style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                    onClick={() => setShowPreviewModal(true)}
                    title="View full size"
                  >
                    <IconExternal size={12} />
                  </button>
                  <button
                    className="ac-btn sm ghost"
                    style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                    onClick={handleRemovePreview}
                    disabled={generating}
                    title="Remove preview"
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status & Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          {currentStatus === "not_generated" && liveUrl.trim() && isValidUrl(liveUrl) && (
            <>
              <span style={{ fontSize: "0.8rem", color: "var(--aslate)" }}>No preview generated yet.</span>
            </>
          )}
          {currentStatus === "failed" && (
            <>
              <span style={{ fontSize: "0.8rem", color: "var(--ared)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <IconAlert size={12} /> Preview generation failed.
              </span>
              <button className="ac-btn sm" onClick={handleGenerate} disabled={generating}>
                <IconRefresh size={12} /> Try Again
              </button>
            </>
          )}
          {currentStatus === "generating" && (
            <span style={{ fontSize: "0.8rem", color: "var(--ablue)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <IconLoader size={12} style={{ animation: "spin 1s linear infinite" }} /> Generating preview…
            </span>
          )}

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              border: "1px dashed var(--aline)",
              borderRadius: 8,
              fontSize: "0.8rem",
              color: "var(--aslate)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ablue)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--aline)")}
          >
            <IconUpload size={14} />
            <span>Upload Preview Manually</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleManualUpload(file);
                e.target.value = "";
              }}
              disabled={uploading}
            />
          </label>

          {previewUrl && (
            <span style={{ fontSize: "0.75rem", color: "var(--aslate)" }}>
              {currentStatus === "manual" ? "Manual upload" : `Generated via ${engine || "playwright"}`}
            </span>
          )}
        </div>

        {/* Help text */}
        <p style={{ fontSize: "0.7rem", color: "var(--aslate)", marginTop: "0.75rem", lineHeight: 1.5 }}>
          <strong>Tips:</strong> Screenshots are captured at 1280×800 (desktop) or 390×844 (mobile) and stored in Supabase Storage.
          The preview is used on project cards and case study pages. If a site blocks embedding, the screenshot still works — use
          <strong>Open Site</strong> to visit the live website.
        </p>
      </div>
    </section>

    {/* Full-size Preview Modal */}
    {showPreviewModal && (
      <div
        className="ac-modal-overlay"
        onClick={() => setShowPreviewModal(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          className="ac-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "1200px",
            maxHeight: "90vh",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--awhite)",
            boxShadow: "var(--ashadow-lg)",
          }}
        >
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--aline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>Website Preview — {project?.title}</h3>
            <button className="ac-btn ghost sm" onClick={() => setShowPreviewModal(false)}>Close</button>
          </div>
          <div style={{ padding: "1.5rem", maxHeight: "70vh", overflow: "auto" }}>
            {iframeError ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--aslate)" }}>
                <IconAlert size={32} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                <p style={{ marginBottom: "0.5rem" }}>This website doesn&apos;t allow embedded previews.</p>
                <p style={{ fontSize: "0.85rem" }}>Security headers (X-Frame-Options, CSP) prevent loading in an iframe.</p>
                <button className="ac-btn primary" style={{ marginTop: "1rem" }} onClick={handleOpenWebsite}>
                  <IconExternal size={14} /> Open Website in New Tab
                </button>
              </div>
            ) : (
              <iframe
                src={liveUrl.startsWith("http") ? liveUrl : `https://${liveUrl}`}
                style={{ width: "100%", height: "60vh", border: "1px solid var(--aline)", borderRadius: 8 }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title={project?.title}
              />
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}