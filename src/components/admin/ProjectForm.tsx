"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Project, ProjectCategory } from "@/lib/types";
import { Field } from "./ui";
import ImageField from "./ImageField";
import GalleryManager from "./GalleryManager";
import FeaturesEditor from "./FeaturesEditor";
import { IconRefresh, IconCheck } from "./icons";

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

interface Props {
  initial?: Project | null;
  mode?: "create" | "edit";
}

export default function ProjectForm({ initial, mode = "create" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState<ProjectCategory>(initial?.category ?? "web-systems");
  const [client, setClient] = useState(initial?.client ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.short_description ?? "");
  const [challenge, setChallenge] = useState(initial?.challenge ?? "");
  const [thinking, setThinking] = useState(initial?.thinking ?? "");
  const [solution, setSolution] = useState(initial?.solution ?? "");
  const [outcome, setOutcome] = useState(initial?.outcome ?? "");
  const [coverImage, setCoverImage] = useState(initial?.cover_image ?? "");
  const [images, setImages] = useState(
    initial?.images?.map((i) => ({ ...i })) ?? []
  );
  const [features, setFeatures] = useState(
    initial?.features?.map((f) => ({ ...f })) ?? []
  );
  const [services, setServices] = useState((initial?.services ?? []).join(", "));
  const [technologies, setTechnologies] = useState((initial?.technologies ?? []).join(", "));
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [liveUrl, setLiveUrl] = useState(initial?.live_url ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.github_url ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [ogImage, setOgImage] = useState(initial?.og_image ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [featured, setFeatured] = useState(initial?.featured ?? false);

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

    const payload = {
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
      cover_image: coverImage.trim(),
      images: images
        .filter((i) => i.image_url.trim())
        .map((i, idx) => ({
          image_url: i.image_url.trim(),
          alt_text: i.alt_text || "",
          sort_order: idx,
        })),
      features: features
        .filter((f) => f.name.trim())
        .map((f, idx) => ({
          name: f.name.trim(),
          description: f.description || "",
          sort_order: idx,
        })),
      services: splitList(services),
      technologies: splitList(technologies),
      tags: splitList(tags),
      live_url: liveUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      og_image: ogImage.trim() || null,
      sort_order: Number(sortOrder) || 0,
      published,
      featured,
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
      toast.error(msg.includes("images") || msg.includes("features") ? msg : msg);
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{ display: "grid", gap: "1.25rem", maxWidth: 1100 }}
    >
      {/* General */}
      <section className="ac-card">
        <div className="ac-card-head">General</div>
        <div className="ac-card-pad">
          <div className="ac-field-grid">
            <Field label="Title" hint="(required)">
              <input
                className="ac-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (!slug.trim()) setSlug(slugify(title));
                }}
                placeholder="Client / project name"
              />
            </Field>
            <Field label="Slug" hint="(required — URL path)">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="ac-input"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="client-project"
                />
                <button type="button" className="ac-btn" title="Generate from title" onClick={() => setSlug(slugify(title))}>
                  <IconRefresh size={14} />
                </button>
              </div>
            </Field>
          </div>

          <div className="ac-field-grid">
            <Field label="Category">
              <select className="ac-select" value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)}>
                <option value="brand-identity">Brand Identity</option>
                <option value="web-systems">Web System</option>
                <option value="brand-web">Brand + Web</option>
              </select>
            </Field>
            <Field label="Client">
              <input className="ac-input" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Company / founder" />
            </Field>
            <Field label="Industry">
              <input className="ac-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech" />
            </Field>
            <Field label="Year">
              <input className="ac-input" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" />
            </Field>
          </div>

          <Field label="Short description">
            <textarea
              className="ac-textarea"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One-liner shown on cards and the case study header."
            />
          </Field>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
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

      {/* Story */}
      <section className="ac-card">
        <div className="ac-card-head">The Story</div>
        <div className="ac-card-pad">
          <Field label="Challenge">
            <textarea className="ac-textarea" rows={4} value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="The business problem this project solved." />
          </Field>
          <Field label="Thinking">
            <textarea className="ac-textarea" rows={4} value={thinking} onChange={(e) => setThinking(e.target.value)} placeholder="Strategy, decisions, reasoning." />
          </Field>
          <Field label="Solution">
            <textarea className="ac-textarea" rows={4} value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="What was designed and built." />
          </Field>
          <Field label="Outcome">
            <textarea className="ac-textarea" rows={4} value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Results achieved." />
          </Field>
        </div>
      </section>

      {/* Media */}
      <section className="ac-card">
        <div className="ac-card-head">Cover</div>
        <ImageField value={coverImage} onChange={setCoverImage} folder="projects/cover" />
      </section>

      <section className="ac-card">
        <div className="ac-card-head">Gallery</div>
        <GalleryManager images={images} onChange={setImages} folder="projects" />
      </section>

      {/* Details */}
      <section className="ac-card">
        <div className="ac-card-head">Details</div>
        <div className="ac-card-pad">
          <div className="ac-field-grid">
            <Field label="Services" hint="(comma separated)">
              <input className="ac-input" value={services} onChange={(e) => setServices(e.target.value)} placeholder="Brand Design, UI/UX, Development" />
            </Field>
            <Field label="Technologies" hint="(comma separated)">
              <input className="ac-input" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="Next.js, Supabase, Figma" />
            </Field>
            <Field label="Tags" hint="(comma separated)">
              <input className="ac-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="E-commerce, SaaS" />
            </Field>
          </div>
          <div className="ac-field-grid">
            <Field label="Live URL">
              <input className="ac-input" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="GitHub URL">
              <input className="ac-input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/…" />
            </Field>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="ac-card">
        <div className="ac-card-head">Key Features</div>
        <div className="ac-card-pad">
          <FeaturesEditor features={features} onChange={setFeatures} />
        </div>
      </section>

      {/* SEO */}
      <section className="ac-card">
        <div className="ac-card-head">SEO</div>
        <div className="ac-card-pad">
          <div className="ac-field-grid">
            <Field label="Meta title">
              <input className="ac-input" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            </Field>
            <Field label="OG image">
              <input className="ac-input" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://…" />
            </Field>
          </div>
          <Field label="Meta description">
            <textarea className="ac-textarea" rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
          </Field>
        </div>
      </section>

      <div style={{ display: "flex", gap: "0.75rem", position: "sticky", bottom: "1rem", background: "var(--awhite)", border: "1px solid var(--aline)", borderRadius: 12, padding: "0.9rem 1.25rem", boxShadow: "var(--ashadow)" }}>
        <button className="ac-btn primary" type="submit" disabled={busy}>
          <IconCheck size={15} /> {busy ? "Saving…" : mode === "edit" ? "Save changes" : "Create project"}
        </button>
        <button type="button" className="ac-btn" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}