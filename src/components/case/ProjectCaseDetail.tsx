"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project, ProjectImage } from "@/lib/types";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sortedImages: ProjectImage[] = project.images
    ? [...project.images].sort((a, b) => a.sort_order - b.sort_order)
    : [];

  const allLightboxImages: { src: string; alt: string }[] = [
    ...(project.cover_image ? [{ src: project.cover_image, alt: project.title }] : []),
    ...sortedImages.map((img) => ({ src: img.image_url, alt: img.alt_text || project.title })),
  ];

  const isWebProject = project.category === "web-systems" || project.category === "brand-web";
  const heroImage = project.website_preview_url || project.cover_image;

  const caseSections = [
    { key: "challenge", label: "The Challenge", body: project.challenge },
    { key: "thinking", label: "The Thinking", body: project.thinking },
    { key: "solution", label: "The Solution", body: project.solution },
    { key: "outcome", label: "The Outcome", body: project.outcome },
  ].filter((s) => s.body);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % allLightboxImages.length);
  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + allLightboxImages.length) % allLightboxImages.length);

  return (
    <>
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

        {/* Hero / Cover Image - natural aspect ratio, no fixed height */}
        {(heroImage || project.cover_image) && (
          <RevealOnScroll delay={60}>
            <figure style={{ marginBottom: "3rem" }}>
              <div
                style={{
                  borderRadius: "1rem",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  background: "var(--paper-100)",
                  cursor: "zoom-in",
                }}
                onClick={() => openLightbox(0)}
              >
                <SafeImage
                  src={heroImage || project.cover_image!}
                  alt={project.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "90vh",
                    objectFit: "contain",
                    display: "block",
                  }}
                  fallback={project.title[0]}
                  loading="eager"
                />
              </div>
              {(project.cover_image && project.website_preview_url) && (
                <figcaption style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--slate)" }}>
                  Click to expand
                </figcaption>
              )}
            </figure>
          </RevealOnScroll>
        )}

        {/* Live Website Preview for web projects */}
        {isWebProject && project.live_url && (
          <RevealOnScroll delay={70}>
            <div style={{ marginBottom: "3rem" }}>
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

        {/* Gallery Images - displayed inline with captions */}
        {sortedImages.length > 0 && (
          <RevealOnScroll delay={80}>
            <div style={{ marginBottom: "3rem" }}>
              <p className="section-kicker" style={{ marginBottom: "1.5rem" }}>
                {sortedImages.length === 1 ? "Project Image" : "Project Gallery"}
              </p>
              <div style={{ display: "grid", gap: "2.5rem" }}>
                {sortedImages.map((img, idx) => (
                  <figure
                    key={img.id || idx}
                    style={{
                      margin: 0,
                      display: "grid",
                      gap: "0.75rem",
                      cursor: "zoom-in",
                    }}
                    onClick={() => openLightbox((project.cover_image ? 1 : 0) + idx)}
                  >
                    <div
                      style={{
                        borderRadius: "1rem",
                        overflow: "hidden",
                        border: "1px solid var(--line)",
                        background: "var(--paper-100)",
                      }}
                    >
                      <SafeImage
                        src={img.image_url}
                        alt={img.alt_text || `${project.title} - image ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "auto",
                          maxHeight: "90vh",
                          objectFit: "contain",
                          display: "block",
                        }}
                        fallback={project.title[0]}
                        loading="lazy"
                      />
                    </div>
                    {img.alt_text && (
                      <figcaption style={{ fontSize: "0.9rem", color: "var(--slate)", lineHeight: "1.6", maxWidth: "60ch" }}>
                        {img.alt_text}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
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

      {/* Lightbox Modal */}
      {lightboxOpen && allLightboxImages.length > 0 && (
        <div
          className="lightbox is-open"
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            display: "grid",
            placeItems: "center",
            padding: "clamp(1rem, 4vw, 3rem)",
            background: "rgba(7, 26, 53, 0.96)",
          }}
        >
          <div
            className="lightbox-shell"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1200px, 100%)",
              maxHeight: "100%",
              display: "grid",
              gap: "1.25rem",
              padding: "1.5rem",
              borderRadius: "1rem",
              background: "var(--paper)",
              boxShadow: "0 2rem 5rem rgba(7, 26, 53, 0.5)",
              overflow: "hidden",
            }}
          >
            <div className="lightbox-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <h2 className="lightbox-title" style={{ margin: "0.15rem 0 0", fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", fontFamily: "Georgia, serif", fontWeight: 500, color: "var(--ink)" }}>
                {project.title}
              </h2>
              <span className="lightbox-counter" style={{ color: "var(--slate)", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {lightboxIndex + 1} / {allLightboxImages.length}
              </span>
            </div>

            <div className="lightbox-preview" style={{ position: "relative", display: "grid", alignItems: "center", justifyItems: "center", minHeight: "50vh", background: "white", border: "1px solid var(--line)", borderRadius: "0.75rem", overflow: "hidden" }}>
              <div className="lightbox-image-wrap" style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                <SafeImage
                  src={allLightboxImages[lightboxIndex].src}
                  alt={allLightboxImages[lightboxIndex].alt}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    maxHeight: "72vh",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "0.5rem",
                  }}
                  fallback={project.title[0]}
                />
              </div>

              {allLightboxImages.length > 1 && (
                <>
                  <button
                    className="lightbox-nav lightbox-prev"
                    onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "1rem",
                      transform: "translateY(-50%)",
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "999px",
                      border: "1px solid var(--line)",
                      background: "var(--blue)",
                      color: "white",
                      fontSize: "1.5rem",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                    aria-label="Previous image"
                  >
                    &#8249;
                  </button>
                  <button
                    className="lightbox-nav lightbox-next"
                    onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "1rem",
                      transform: "translateY(-50%)",
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "999px",
                      border: "1px solid var(--line)",
                      background: "var(--blue)",
                      color: "white",
                      fontSize: "1.5rem",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                    aria-label="Next image"
                  >
                    &#8250;
                  </button>
                </>
              )}
            </div>

            {allLightboxImages.length > 1 && (
              <div className="lightbox-thumbs" style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
                {allLightboxImages.map((img, idx) => (
                  <button
                    key={idx}
                    className="lightbox-thumb"
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    style={{
                      flex: "0 0 4.5rem",
                      height: "4.5rem",
                      borderRadius: "0.5rem",
                      border: idx === lightboxIndex ? "2px solid var(--blue)" : "2px solid transparent",
                      overflow: "hidden",
                      background: "var(--blue-deep)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    aria-label={`View image ${idx + 1}`}
                    aria-current={idx === lightboxIndex ? "true" : "false"}
                  >
                    <SafeImage
                      src={img.src}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}

            <button
              className="modal-close"
              onClick={closeLightbox}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                minHeight: "2.5rem",
                minWidth: "2.5rem",
                padding: "0 0.75rem",
                border: "1px solid var(--line)",
                borderRadius: "999px",
                color: "var(--ink)",
                fontSize: "0.7rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}