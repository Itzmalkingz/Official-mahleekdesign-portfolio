"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import type { Project } from "@/lib/types";
import { Field } from "./ui";
import { IconFolder, IconImage, IconLink, IconClose, IconCheck } from "./icons";

export type ImportedProject = Partial<Project> & { _screenshot?: string; _caseStudy?: string };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface ScrapeResult {
  url: string;
  title: string;
  description: string;
  tags: string[];
  services: string[];
  caseStudy: string;
  ogImage: string | null;
  headings: string[];
  metaDescription: string | null;
}

interface ScreenshotResult {
  url: string;
  publicUrl: string;
  engine: string;
}

const splitList = (s: string[]) => Array.from(new Set((s || []).map((x) => x.trim()).filter(Boolean))).slice(0, 8);

export default function ProjectImport({ onImported }: { onImported: (p: ImportedProject) => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [withShot, setWithShot] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [result, setResult] = useState<ImportedProject | null>(null);

  const run = async (e: FormEvent) => {
    e.preventDefault();
    const target = url.trim();
    if (!target) return toast.error("Paste a live site URL first");
    setBusy(true);
    setResult(null);
    setStage("Fetching page content…");

    try {
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const scrape: ScrapeResult | { error: string } = await scrapeRes.json();
      if (!scrapeRes.ok) throw new Error("error" in scrape ? scrape.error : "Scrape failed");

      const r = scrape as ScrapeResult;
      const slug = slugify(r.title || r.url.split("/").filter(Boolean).pop() || "project");
      let cover = r.ogImage || "";
      let _screenshot = "";

      if (withShot) {
        setStage("Capturing screenshot…");
        const shotRes = await fetch("/api/screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: r.url, width: 1280, height: 800 }),
        });
        const shot: ScreenshotResult | { error: string } = await shotRes.json();
        if (shotRes.ok && "publicUrl" in shot && shot.publicUrl) {
          cover = shot.publicUrl;
          _screenshot = shot.publicUrl;
        }
      }

      const imported: ImportedProject = {
        title: r.title?.slice(0, 120),
        slug,
        short_description: r.description?.slice(0, 320) || r.metaDescription?.slice(0, 320) || undefined,
        services: splitList(r.services),
        tags: splitList(r.tags),
        live_url: r.url,
        cover_image: cover || undefined,
        og_image: cover || undefined,
        meta_title: r.title?.slice(0, 60),
        meta_description: r.metaDescription?.slice(0, 160) || r.description?.slice(0, 160) || undefined,
        category: "web-systems",
        images: [],
        features: [],
        _screenshot,
        _caseStudy: r.caseStudy,
      } as ImportedProject;

      setResult(imported);
      setStage(null);
      toast.success("Site analysed");
    } catch (err) {
      setStage(null);
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!result) return;
    onImported(result);
    setOpen(false);
    setResult(null);
    setUrl("");
    toast.success("Form prefilled — review and save");
  };

  return (
    <div className="ac-card" style={{ marginBottom: "1.25rem" }}>
      <button type="button" className="ac-card-head toggle" onClick={() => setOpen((v) => !v)} style={{ width: "100%", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <IconFolder size={15} /> Import an existing site
        </span>
        <span style={{ fontSize: "0.8rem", color: "var(--aslate)" }}>{open ? "Hide" : "Scrape a live URL to prefill the form"}</span>
      </button>

      {open && (
        <div className="ac-card-pad">
          <form onSubmit={run} style={{ display: "grid", gap: "0.9rem" }}>
            <Field label="Live site URL">
              <input
                className="ac-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://client-site.com"
                autoFocus
              />
            </Field>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <label style={{ display: "flex", gap: "0.45rem", alignItems: "center", fontSize: "0.84rem", fontWeight: 500 }}>
                <input type="checkbox" checked={withShot} onChange={(e) => setWithShot(e.target.checked)} />
                Capture a screenshot for the cover
              </label>
              <button type="submit" className="ac-btn primary" disabled={busy}>
                {busy ? stage || "Working…" : "Analyse"}
              </button>
            </div>
          </form>

          {result && (
            <div style={{ marginTop: "1rem", border: "1px solid var(--aline)", borderRadius: 12, padding: "0.9rem 1rem", display: "grid", gap: "0.7rem", background: "var(--apaper)" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                {result.cover_image ? (
                  <img src={result.cover_image} alt="" style={{ width: 120, height: 80, borderRadius: 8, objectFit: "cover", flex: "none", border: "1px solid var(--aline)" }} />
                ) : (
                  <div style={{ width: 120, height: 80, borderRadius: 8, background: "var(--aline-soft)", flex: "none", display: "grid", placeItems: "center", color: "var(--aslate)" }}>
                    <IconImage size={20} />
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{result.title}</div>
                  {result.short_description && (
                    <p style={{ fontSize: "0.8rem", color: "var(--aslate)", margin: "0.15rem 0 0.4rem" }}>{result.short_description}</p>
                  )}
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                    {(result.services || []).map((s) => (
                      <span key={s} className="ac-badge" style={{ background: "var(--ablue-blur)", color: "var(--ablue)" }}>{s}</span>
                    ))}
                  </div>
                  <a href={result.live_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "var(--aslate)", display: "inline-flex", gap: "0.3rem", alignItems: "center", marginTop: "0.4rem", textDecoration: "none" }}>
                    <IconLink size={12} /> {result.live_url}
                  </a>
                </div>
              </div>
              {result._caseStudy && (
                <details style={{ fontSize: "0.78rem", color: "var(--aslate)" }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>Generated case-study draft (copy for your story fields)</summary>
                  <pre style={{ whiteSpace: "pre-wrap", margin: "0.5rem 0 0", maxHeight: 240, overflow: "auto", fontSize: 12, background: "var(--awhite)", border: "1px solid var(--aline)", borderRadius: 8, padding: "0.6rem" }}>{result._caseStudy}</pre>
                </details>
              )}
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button className="ac-btn primary" onClick={apply}>
                  <IconCheck size={14} /> Use this data
                </button>
                <button className="ac-btn ghost" onClick={() => { setResult(null); setUrl(""); }}>
                  <IconClose size={14} /> Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}