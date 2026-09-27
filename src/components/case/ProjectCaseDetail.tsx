"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SafeImage from "@/components/ui/SafeImage";

const categoryLabels: Record<string, string> = {
  "brand-identity": "Brand Identity",
  "web-systems": "Web System",
  "brand-web": "Brand + Web",
};

interface Props {
  project: Project;
  related: Project[];
  backHref: string;
  backLabel: string;
}

export default function ProjectCaseDetail({ project, related, backHref, backLabel }: Props) {
  const [activeImage, setActiveImage] = useState(0);

  const allImages: string[] = [
    ...(project.images?.length
      ? project.images
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => img.image_url)
      : []),
  ];

  // For web projects, include website preview in the gallery
  const isWebProject = project.category === "web-systems" || project.category === "brand-web";
  const heroImage = project.website_preview_url || project.cover_image;

  const caseSections = [
    { key: "challenge", label: "The Challenge", body: project.challenge },
    { key: "thinking", label: "The Thinking", body: project.thinking },
    { key: "solution", label: "The Solution", body: project.solution },
    { key: "outcome", label: "The Outcome", body: project.outcome },
  ].filter((s) => s.body);

  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      {/* Back link */}
      <RevealOnScroll>
        <Link
          href={backHref}
          style={{
            color: "var(--blue)",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "2rem",
          }}
        >
          &#8249; Back to {backLabel}
        </Link>
      </RevealOnScroll>

      {/* Header */}
      <RevealOnScroll>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
            <span className="project-tag">{categoryLabels[project.category] || project.category}</span>
            {project.services?.map((service) => (
              <span key={service} className="project-tag">{service}</span>
            ))}
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.08, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: "1rem" }}>
            {project.title}
          </h1>
          {project.short_description && (
            <p style={{ color: "var(--slate)", fontSize: "1.1rem", lineHeight: "1.7", maxWidth: "40rem" }}>
              {project.short_description}
            </p>
          )}
        </div>
      </RevealOnScroll>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <RevealOnScroll delay={40}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "0.3rem 0.85rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(19, 99, 223, 0.2)",
                  background: "#eef4fd",
                  color: "var(--blue)",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      )}

      {/* Hero image */}
      <RevealOnScroll delay={60}>
        <div
          style={{
            borderRadius: "1.25rem",
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "var(--paper-100)",
            marginBottom: "1rem",
          }}
        >
          {heroImage ? (
            <SafeImage
              src={heroImage}
              alt={project.title}
              style={{ width: "100%", maxHeight: "42rem", objectFit: "contain", display: "block" }}
              fallback={project.title[0]}
            />
          ) : allImages.length > 0 ? (
            <SafeImage
              src={allImages[activeImage]}
              alt={`${project.title} preview`}
              style={{ width: "100%", maxHeight: "42rem", objectFit: "contain", display: "block" }}
              fallback={project.title[0]}
            />
          ) : project.cover_image ? (
            <SafeImage
              src={project.cover_image}
              alt={project.title}
              style={{ width: "100%", maxHeight: "42rem", objectFit: "contain", display: "block" }}
              fallback={project.title[0]}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "24rem",
                display: "grid",
                placeItems: "center",
                fontSize: "4rem",
                fontWeight: 900,
                color: "var(--blue)",
                background: "linear-gradient(135deg, rgba(19,99,223,0.12), rgba(78,151,255,0.06))",
              }}
            >
              {project.title[0]}
            </div>
          )}
        </div>
      </RevealOnScroll>

      {/* Live Website Preview for web projects */}
      {isWebProject && project.live_url && (
        <RevealOnScroll delay={70}>
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <p className="section-kicker">Live Website Preview</p>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)", marginTop: "0.25rem" }}>
                  Experience the live website
                </h2>
              </div>
              <a href={project.live_url} target="_blank" rel="noreferrer" className="btn-primary">
                Visit Live Website &#8599;
              </a>
            </div>
            <div
              style={{
                borderRadius: "1rem",
                overflow: "hidden",
                border: "1px solid var(--line)",
                background: "var(--paper-100)",
              }}
            >
              <iframe
                src={project.live_url}
                style={{ width: "100%", height: "50rem", border: "none", display: "block" }}
                title={`${project.title} live preview`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--slate)", marginTop: "0.75rem" }}>
              The live website is embedded above. If it doesn&apos;t load due to security restrictions,
              <a href={project.live_url} target="_blank" rel="noreferrer" style={{ color: "var(--blue)", textDecoration: "underline" }}>
                open it in a new tab
              </a>.
            </p>
          </div>
        </RevealOnScroll>
      )}

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <RevealOnScroll delay={80}>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "3rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(idx)}
                aria-label={`View image ${idx + 1}`}
                style={{
                  flex: "0 0 auto",
                  width: "5rem",
                  height: "5rem",
                  borderRadius: "0.6rem",
                  overflow: "hidden",
                  border: idx === activeImage ? "2px solid var(--blue)" : "2px solid var(--line)",
                  opacity: idx === activeImage ? 1 : 0.55,
                  transition: "all 0.2s",
                  cursor: "pointer",
                  padding: 0,
                  background: "var(--paper-100)",
                }}
              >
                <SafeImage src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </RevealOnScroll>
      )}

      {/* Case study sections */}
      {caseSections.length > 0 && (
        <div style={{ marginBottom: "3rem" }}>
          {caseSections.map((s, i) => (
            <RevealOnScroll key={s.key} delay={i * 60}>
              <div style={{ marginBottom: "2.5rem", maxWidth: "48rem" }}>
                <p className="section-kicker">{s.label}</p>
                <p style={{ color: "var(--ink)", fontSize: "1.05rem", lineHeight: "1.85", whiteSpace: "pre-wrap", marginTop: "0.35rem" }}>
                  {s.body}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      )}

      {/* Features */}
      {project.features && project.features.length > 0 && (
        <RevealOnScroll delay={60}>
          <div
            style={{
              marginBottom: "3rem",
              padding: "2rem",
              borderRadius: "1rem",
              border: "1px solid var(--line)",
              background: "var(--paper-100)",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--ink)" }}>
              Key Features
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))", gap: "1.25rem" }}>
              {(project.features ?? []).map((f) => (
                <div key={f.id || f.name}>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.25rem" }}>{f.name}</p>
                  {f.description && <p style={{ fontSize: "0.85rem", color: "var(--slate)", lineHeight: "1.6" }}>{f.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      )}

      {/* Project info grid */}
      <RevealOnScroll delay={80}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
            padding: "2rem",
            borderRadius: "1rem",
            border: "1px solid var(--line)",
          }}
        >
          {project.client && (
            <div>
              <span style={{ color: "var(--slate)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Client</span>
              <p style={{ color: "var(--ink)", fontSize: "1rem", marginTop: "0.3rem", fontWeight: 500 }}>{project.client}</p>
            </div>
          )}
          {project.industry && (
            <div>
              <span style={{ color: "var(--slate)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Industry</span>
              <p style={{ color: "var(--ink)", fontSize: "1rem", marginTop: "0.3rem", fontWeight: 500 }}>{project.industry}</p>
            </div>
          )}
          <div>
            <span style={{ color: "var(--slate)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Category</span>
            <p style={{ color: "var(--ink)", fontSize: "1rem", marginTop: "0.3rem", fontWeight: 500 }}>
              {categoryLabels[project.category] || project.category}
            </p>
          </div>
          {project.year && (
            <div>
              <span style={{ color: "var(--slate)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Year</span>
              <p style={{ color: "var(--ink)", fontSize: "1rem", marginTop: "0.3rem", fontWeight: 500 }}>{project.year}</p>
            </div>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <span style={{ color: "var(--slate)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Stack</span>
              <p style={{ color: "var(--ink)", fontSize: "1rem", marginTop: "0.3rem", fontWeight: 500 }}>
                {project.technologies.join(" · ")}
              </p>
            </div>
          )}
        </div>
      </RevealOnScroll>

      {/* Links */}
      <RevealOnScroll delay={100}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "4rem" }}>
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer" className="btn-primary">
              View Live Project &#8599;
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer" className="btn-secondary">
              Source on GitHub &#8599;
            </a>
          )}
        </div>
      </RevealOnScroll>

      {/* Related projects */}
      {related.length > 0 && (
        <RevealOnScroll delay={120}>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "3rem" }}>
            <p className="section-kicker">More Work</p>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginTop: "0.35rem" }}>
              Related {backLabel === "Work" ? "Projects" : "Systems"}
            </h2>
            <div className="project-stack" style={{ marginTop: "1.5rem" }}>
              {related.map((rp, i) => {
                const rpPreview = rp.website_preview_url || rp.cover_image;
                return (
                  <RevealOnScroll key={rp.id} delay={Math.min(i * 80, 240)}>
                    <Link href={`/work/${rp.slug}`} className="project-panel" aria-label={`Open ${rp.title}`}>
                      <div className="project-index">{String(i + 1).padStart(2, "0")}</div>
                      <div className="project-visual">
                        {rpPreview ? (
                          <SafeImage src={rpPreview} alt={rp.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", minHeight: "12rem", background: "linear-gradient(135deg, rgba(19,99,223,0.15), rgba(78,151,255,0.08))" }} />
                        )}
                      </div>
                      <div className="project-copy">
                        <span className="project-tag">{categoryLabels[rp.category] || rp.category}</span>
                        <h3>{rp.title}</h3>
                        {rp.short_description && <p>{rp.short_description}</p>}
                      </div>
                    </Link>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </RevealOnScroll>
      )}
    </section>
  );
}