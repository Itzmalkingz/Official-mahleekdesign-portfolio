"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { uploadAndGetUrl } from "@/lib/supabase/storage";
import toast from "react-hot-toast";
import type { Project, ProjectCategory } from "@/lib/types";
import { Field } from "./ui";
import ImageUploadManager, { type PendingImage } from "./ImageUploadManager";
import WebsitePreview from "./WebsitePreview";
import FeaturesEditor from "./FeaturesEditor";
import { IconCheck, IconChevronDown } from "./icons";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 38,
          height: 22,
          borderRadius: 99,
          border: "none",
          background: checked ? "var(--ablue)" : "#cfd8e4",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.15s ease",
          flex: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 19 : 3,
            width: 16,
            height: 16,
            borderRadius: 99,
            background: "#fff",
            transition: "left 0.15s ease",
          }}
        />
      </button>
      <span style={{ fontSize: "0.84rem", fontWeight: 500 }}>{label}</span>
    </label>
  );
}

function CollapsibleSection({
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="ac-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1rem 1.25rem",
          border: "none",
          background: "none",
          cursor: "pointer",
          textAlign: "left",
          font: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: open ? "var(--ablue)" : "var(--aslate)",
              background: open ? "#e5eefc" : "var(--apaper-2)",
              padding: "0.15rem 0.5rem",
              borderRadius: 6,
            }}
          >
            {open ? "ON" : "OFF"}
          </span>
          <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{title}</span>
          {hint && (
            <span style={{ fontSize: "0.76rem", color: "var(--aslate)", fontWeight: 500 }}>{hint}</span>
          )}
        </div>
        <span style={{ color: "var(--aslate)", transition: "transform 0.15s ease", transform: open ? "rotate(0deg)" : "rotate(-90deg)", flex: "none" }}>
          <IconChevronDown size={16} />
        </span>
      </button>
      {open && <div className="ac-card-pad" style={{ display: "grid", gap: "1rem" }}>{children}</div>}
    </section>
  );
}

interface Props {
  initial?: Partial<Project> | null;
  mode?: "create" | "edit";
}

const CATEGORY_OPTIONS: { value: ProjectCategory; label: string; icon: string }[] = [
  { value: "brand-identity", label: "Brand Identity", icon: "◆" },
  { value: "web-systems", label: "Web System", icon: "◈" },
  { value: "brand-web", label: "Brand + Web", icon: "◇" },
];

export default function ProjectForm({ initial, mode = "create" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(mode === "create" && !initial);

  const [category, setCategory] = useState<ProjectCategory>(initial?.category ?? "brand-identity");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.short_description ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.live_url ?? "");
  const [cover, setCover] = useState<PendingImage | null>(
    initial?.cover_image ? { url: initial.cover_image } : null
  );
  const [gallery, setGallery] = useState<PendingImage[]>(
    (initial?.images ?? []).map((i) => ({ url: i.image_url, altText: i.alt_text }))
  );
  const [published, setPublished] = useState(initial?.published ?? false);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [features, setFeatures] = useState(
    initial?.features?.map((f) => ({ ...f })) ?? []
  );

  const [challenge, setChallenge] = useState(initial?.challenge ?? "");
  const [thinking, setThinking] = useState(initial?.thinking ?? "");
  const [solution, setSolution] = useState(initial?.solution ?? "");
  const [outcome, setOutcome] = useState(initial?.outcome ?? "");

  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [ogImage, setOgImage] = useState(initial?.og_image ?? "");

  const [year, setYear] = useState(initial?.year ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [services, setServices] = useState((initial?.services ?? []).join(", "));
  const [technologies, setTechnologies] = useState((initial?.technologies ?? []).join(", "));
  const [githubUrl, setGithubUrl] = useState(initial?.github_url ?? "");

  const [websitePreviewUrl, setWebsitePreviewUrl] = useState(initial?.website_preview_url ?? "");
  const [websitePreviewStatus, setWebsitePreviewStatus] = useState(initial?.website_preview_status ?? "not_generated");
  const [websitePreviewGeneratedAt, setWebsitePreviewGeneratedAt] = useState(initial?.website_preview_generated_at ?? null);
  const [websitePreviewViewport, setWebsitePreviewViewport] = useState(initial?.website_preview_viewport ?? "desktop");
  const [websitePreviewWidth, setWebsitePreviewWidth] = useState(initial?.website_preview_width ?? null);
  const [websitePreviewHeight, setWebsitePreviewHeight] = useState(initial?.website_preview_height ?? null);
  const [websitePreviewEngine, setWebsitePreviewEngine] = useState(initial?.website_preview_engine ?? null);

  const autoSeoTitle = useMemo(() => {
    if (metaTitle) return metaTitle;
    if (title) return `${title} — Portfolio`;
    return "";
  }, [metaTitle, title]);

  const autoSeoDesc = useMemo(() => {
    if (metaDescription) return metaDescription;
    if (shortDescription) return shortDescription;
    if (title) return `Portfolio project: ${title}`;
    return "";
  }, [metaDescription, shortDescription, title]);

  const uploadToStorage = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `admin/${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const url = await uploadAndGetUrl("design-uploads", path, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });
    if (!url) throw new Error("Failed to upload file and generate URL");
    return url;
  };

  const handleTitleBlur = useCallback(() => {
    if (!slug.trim() && title.trim()) {
      setSlug(slugify(title));
    }
    if (!metaTitle && title.trim()) {
      setMetaTitle(`${title} — Portfolio`);
    }
    if (!metaDescription && shortDescription.trim()) {
      setMetaDescription(shortDescription);
    }
  }, [slug, title, metaTitle, metaDescription, shortDescription]);

  const handleShortDescChange = useCallback(
    (val: string) => {
      setShortDescription(val);
      if (!metaDescription) {
        setMetaDescription(val);
      }
    },
    [metaDescription]
  );

  const splitList = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const submit = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!slug.trim()) return toast.error("Slug is required");

    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let coverUrl: string | null = null;
    const galleryUrls: { image_url: string; alt_text: string; sort_order: number }[] = [];

    try {
      if (cover?.file) {
        coverUrl = await uploadToStorage(cover.file, "projects/cover");
      } else if (cover?.url) {
        coverUrl = cover.url;
      }

      for (let i = 0; i < gallery.length; i++) {
        const item = gallery[i];
        if (!item) continue;
        let url: string;
        if (item.file) {
          url = await uploadToStorage(item.file, "projects");
        } else if (item.url) {
          url = item.url;
        } else {
          continue;
        }
        galleryUrls.push({
          image_url: url,
          alt_text: item.altText ?? "",
          sort_order: i,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg.includes("bucket") ? "Storage bucket not ready — run the Phase 1 migration." : msg);
      setBusy(false);
      return;
    }

    const payload: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim(),
      category,
      client: client.trim() || null,
      industry: industry.trim() || null,
      year: year.trim() || null,
      short_description: shortDescription.trim(),
      challenge: challenge.trim() || null,
      thinking: thinking.trim() || null,
      solution: solution.trim() || null,
      outcome: outcome.trim() || null,
      cover_image: coverUrl ?? "",
      images: galleryUrls,
      live_url: liveUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      meta_title: autoSeoTitle.trim() || null,
      meta_description: autoSeoDesc.trim() || null,
      og_image: ogImage.trim() || null,
      sort_order: Number(sortOrder) || 0,
      published,
      featured,
      tags: splitList(tags),
      services: splitList(services),
      technologies: splitList(technologies),
      features: features
        .filter((f) => f.name.trim())
        .map((f, idx) => ({
          name: f.name.trim(),
          description: f.description || "",
          sort_order: idx,
        })),
      website_preview_url: websitePreviewUrl.trim() || null,
      website_preview_status: websitePreviewStatus,
      website_preview_generated_at: websitePreviewGeneratedAt,
      website_preview_viewport: websitePreviewViewport,
      website_preview_width: websitePreviewWidth,
      website_preview_height: websitePreviewHeight,
      website_preview_engine: websitePreviewEngine,
    };

    let entityId = initial?.id ?? "";
    try {
      if (mode === "edit" && initial?.id) {
        const { data, error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", initial.id)
          .select("id")
          .single();
        if (error) throw error;
        entityId = data?.id ?? initial.id;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        entityId = data?.id;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save project";
      toast.error(msg);
      setBusy(false);
      return;
    }

    await supabase.from("activity_logs").insert({
      actor_id: user?.id,
      actor_email: user?.email,
      action: mode === "edit" ? "updated project" : "created project",
      entity_type: "project",
      entity_id: entityId,
      entity_title: slug.trim(),
    });

    toast.success(mode === "edit" ? "Project updated" : "Project created");
    router.push("/admin/projects");
    router.refresh();
  };

  const onPreviewUpdate = useCallback((updates: Partial<Project>) => {
    if (updates.website_preview_url !== undefined) setWebsitePreviewUrl(updates.website_preview_url);
    if (updates.website_preview_status !== undefined) setWebsitePreviewStatus(updates.website_preview_status);
    if (updates.website_preview_generated_at !== undefined) setWebsitePreviewGeneratedAt(updates.website_preview_generated_at);
    if (updates.website_preview_viewport !== undefined) setWebsitePreviewViewport(updates.website_preview_viewport);
    if (updates.website_preview_width !== undefined) setWebsitePreviewWidth(updates.website_preview_width);
    if (updates.website_preview_height !== undefined) setWebsitePreviewHeight(updates.website_preview_height);
    if (updates.website_preview_engine !== undefined) setWebsitePreviewEngine(updates.website_preview_engine);
  }, []);

  const projectForPreview = initial
    ? {
        ...initial,
        id: initial.id ?? "",
        website_preview_url: websitePreviewUrl,
        website_preview_status: websitePreviewStatus,
        website_preview_generated_at: websitePreviewGeneratedAt,
        website_preview_viewport: websitePreviewViewport,
        website_preview_width: websitePreviewWidth,
        website_preview_height: websitePreviewHeight,
        website_preview_engine: websitePreviewEngine,
      } as Project
    : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{ display: "grid", gap: "1.25rem", maxWidth: 820 }}
    >
      {/* ── Type Selector (create mode only) ─────────────────────── */}
      {showTypeSelector && (
        <section className="ac-card">
          <div className="ac-card-pad" style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="ac-label" style={{ fontSize: "0.82rem", textTransform: "none", letterSpacing: "0", color: "var(--aink)", fontWeight: 700 }}>
                What type of project is this?
              </label>
              <p style={{ fontSize: "0.8rem", color: "var(--aslate)", marginTop: "0.2rem" }}>
                Select the category that best describes this work. You can change it later.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setCategory(opt.value);
                    setShowTypeSelector(false);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    padding: "1.25rem 1.5rem",
                    borderRadius: "var(--arad)",
                    border: category === opt.value ? "2px solid var(--ablue)" : "1px solid var(--aline)",
                    background: category === opt.value ? "#eef4fd" : "var(--awhite)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                    font: "inherit",
                  }}
                >
                  <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{opt.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--aink)" }}>{opt.label}</span>
                  {category === opt.value && (
                    <span style={{ fontSize: "0.72rem", color: "var(--ablue)", fontWeight: 600 }}>Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Essential Information ────────────────────────────────── */}
      <section className="ac-card">
        <div className="ac-card-head">Essential Information</div>
        <div className="ac-card-pad" style={{ display: "grid", gap: "1.1rem" }}>
          <Field label="Project name" hint="(required)">
            <input
              className="ac-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Client / project name"
            />
          </Field>

          <div className="ac-field-grid">
            <Field label="Client / brand">
              <input className="ac-input" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Company / founder" />
            </Field>
            <Field label="Industry">
              <input className="ac-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech" />
            </Field>
            <Field label="Year">
              <input className="ac-input" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" />
            </Field>
          </div>

          {category !== "brand-identity" && (
            <Field label="Live website URL">
              <input className="ac-input" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://…" />
            </Field>
          )}

          <Field label="Short description">
            <textarea
              className="ac-textarea"
              rows={2}
              value={shortDescription}
              onChange={(e) => handleShortDescChange(e.target.value)}
              placeholder="One-liner shown on cards and the case study header."
            />
          </Field>

          <div className="ac-toggle-row" style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
            <Toggle checked={published} onChange={setPublished} label="Published" />
            <Toggle checked={featured} onChange={setFeatured} label="Featured (homepage)" />
            <Field label="Sort order">
              <input
                className="ac-input"
                type="number"
                style={{ width: 90 }}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* ── Media Gallery (cover-first) ────────────── */}
      <section className="ac-card">
        <div className="ac-card-head">Media — Gallery</div>
        <div className="ac-card-pad">
          <ImageUploadManager cover={cover} gallery={gallery} onCoverChange={setCover} onGalleryChange={setGallery} />
        </div>
      </section>

      {/* ── Website Preview (Web System / Brand + Web) ───── */}
      {(category === "web-systems" || category === "brand-web") && (
        <WebsitePreview
          project={projectForPreview}
          liveUrl={liveUrl}
          onLiveUrlChange={setLiveUrl}
          onPreviewUpdate={onPreviewUpdate}
          isSaving={busy}
          hideUrlInput
        />
      )}

      {/* ── Optional Case Study ──────────────────────────────────── */}
      <CollapsibleSection title="Case Study" hint="optional" defaultOpen={false}>
        <Field label="Challenge">
          <textarea className="ac-textarea" rows={3} value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="The business problem this project solved." />
        </Field>
        <Field label="Thinking / Strategy">
          <textarea className="ac-textarea" rows={3} value={thinking} onChange={(e) => setThinking(e.target.value)} placeholder="Strategy, decisions, reasoning." />
        </Field>
        <Field label="Solution">
          <textarea className="ac-textarea" rows={3} value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="What was designed and built." />
        </Field>
        <Field label="Outcome">
          <textarea className="ac-textarea" rows={3} value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Results achieved." />
        </Field>
      </CollapsibleSection>

      {/* ── SEO (collapsed) ──────────────────────────────────────── */}
      <CollapsibleSection title="SEO" hint="auto-generated by default" defaultOpen={false}>
        <Field label="Meta title">
          <input className="ac-input" value={autoSeoTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={autoSeoTitle || "Auto-generated"} />
        </Field>
        <Field label="Meta description">
          <textarea className="ac-textarea" rows={2} value={autoSeoDesc} onChange={(e) => setMetaDescription(e.target.value)} placeholder={autoSeoDesc || "Auto-generated from description"} />
        </Field>
        <Field label="OG image">
          <input className="ac-input" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://…" />
        </Field>
      </CollapsibleSection>

      {/* ── Advanced (collapsed) ─────────────────────────────────── */}
      <CollapsibleSection title="Advanced" hint="rarely needed" defaultOpen={false}>
        <div className="ac-field-grid">
          <Field label="Services (comma separated)">
            <input className="ac-input" value={services} onChange={(e) => setServices(e.target.value)} placeholder="Brand Design, UI/UX" />
          </Field>
          <Field label="Technologies (comma separated)">
            <input className="ac-input" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="Next.js, Supabase" />
          </Field>
          <Field label="Tags (comma separated)">
            <input className="ac-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="E-commerce, SaaS" />
          </Field>
          <Field label="GitHub URL">
            <input className="ac-input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/…" />
          </Field>
        </div>
        <FeaturesEditor features={features} onChange={setFeatures} />
      </CollapsibleSection>

      {/* ── Sticky Save Bar ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", position: "sticky", bottom: "1rem", background: "var(--awhite)", border: "1px solid var(--aline)", borderRadius: 12, padding: "0.9rem 1.25rem", boxShadow: "var(--ashadow)" }}>
        <button className="ac-btn primary" type="submit" disabled={busy}>
          <IconCheck size={15} /> {busy ? "Saving…" : mode === "edit" ? "Save changes" : "Create project"}
        </button>
        <button
          type="button"
          className="ac-btn"
          onClick={() => setShowTypeSelector(true)}
        >
          Change type
        </button>
        <button type="button" className="ac-btn" onClick={() => router.back()}>
          Cancel
        </button>
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--aslate)", alignSelf: "center" }}>
          {mode === "edit" ? "Editing · " : ""}{category === "brand-identity" ? "Brand Identity" : category === "web-systems" ? "Web System" : "Brand + Web"}
        </span>
      </div>
    </form>
  );
}
