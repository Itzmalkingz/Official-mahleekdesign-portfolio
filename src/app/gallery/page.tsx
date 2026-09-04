"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function GalleryPage() {
  const [designs, setDesigns] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchDesigns = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("category", "design")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) console.error("Unable to load gallery projects", error);
      if (data) setDesigns(data as Project[]);
      setLoading(false);
    };
    fetchDesigns();
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const getProjectImages = (project: Project): string[] => {
    if (project.images?.length) return project.images;
    if (project.image_url) return [project.image_url];
    return [];
  };

  const openLightbox = (projectIndex: number, imageIndex: number = 0) => {
    setActiveProjectIndex(projectIndex);
    setActiveImageIndex(imageIndex);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const navigateProject = (dir: number) => {
    const next = activeProjectIndex + dir;
    if (next >= 0 && next < designs.length) {
      setActiveProjectIndex(next);
      setActiveImageIndex(0);
    }
  };

  const navigateImage = (dir: number) => {
    const project = designs[activeProjectIndex];
    if (!project) return;
    const images = getProjectImages(project);
    const next = activeImageIndex + dir;
    if (next >= 0 && next < images.length) {
      setActiveImageIndex(next);
    }
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") {
        const project = designs[activeProjectIndex];
        const images = getProjectImages(project);
        if (activeImageIndex < images.length - 1) {
          setActiveImageIndex((prev) => prev + 1);
        } else if (activeProjectIndex < designs.length - 1) {
          setActiveProjectIndex((prev) => prev + 1);
          setActiveImageIndex(0);
        }
      }
      if (e.key === "ArrowLeft") {
        if (activeImageIndex > 0) {
          setActiveImageIndex((prev) => prev - 1);
        } else if (activeProjectIndex > 0) {
          setActiveProjectIndex((prev) => prev - 1);
          setActiveImageIndex(0);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, designs, activeProjectIndex, activeImageIndex]);

  const activeDesign = designs[activeProjectIndex];
  const allImages = activeDesign ? getProjectImages(activeDesign) : [];
  const totalProjectImages = allImages.length;

  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      <RevealOnScroll>
        <p className="section-kicker">Graphic Design Gallery</p>
      </RevealOnScroll>
      <RevealOnScroll delay={60}>
        <h1 className="section-heading">
          A curated gallery of identity, social, print, and campaign design work.
        </h1>
      </RevealOnScroll>
      <RevealOnScroll delay={120}>
        <p style={{ color: "#bdb5aa", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "46rem", marginTop: "1rem" }}>
          Explore the collection to see how I create consistency across brand touchpoints, from logo
          systems and social graphics to launch-ready visual assets.
        </p>
      </RevealOnScroll>

      {loading ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>Loading gallery...</h3>
        </div>
      ) : designs.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>No designs yet</h3>
          <p>Design pieces will appear here once uploaded through the admin dashboard.</p>
        </div>
      ) : (
        <div className="gallery-grid" style={{ marginTop: "3rem" }}>
          {designs.map((design, i) => (
            <RevealOnScroll key={design.id} delay={Math.min(i * 40, 200)}>
              <button className="gallery-item" type="button" onClick={() => openLightbox(i, 0)}>
                <div className="gallery-thumb">
                  {design.image_url ? (
                    <img src={design.image_url} alt={design.title} loading="lazy" />
                  ) : (
                    <div style={{ width: "100%", height: "10rem", background: "linear-gradient(135deg, rgba(217,182,111,0.2), rgba(92,225,230,0.15))" }} />
                  )}
                </div>
                <div className="gallery-meta">
                  <strong>{design.title}</strong>
                  <span>
                    {design.tags?.length ? design.tags[0] : "Design"}
                    {design.images?.length ? ` — ${design.images.length} images` : ""}
                  </span>
                </div>
              </button>
            </RevealOnScroll>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && activeDesign && (
        <div
          className="lightbox is-open"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeDesign.title} gallery`}
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          <div className="lightbox-shell">
            <button className="modal-close" type="button" onClick={closeLightbox}>
              Close
            </button>
            <div className="lightbox-header">
              <div>
                <p className="section-kicker">Gallery</p>
                <h3 className="lightbox-title">{activeDesign.title}</h3>
              </div>
              <div className="lightbox-counter">
                {activeImageIndex + 1} / {totalProjectImages}
                <span style={{ marginLeft: "0.75rem", opacity: 0.5 }}>
                  Project {activeProjectIndex + 1} of {designs.length}
                </span>
              </div>
            </div>
            <div className="lightbox-preview">
              <button
                className="lightbox-nav lightbox-prev"
                type="button"
                aria-label="Previous"
                disabled={activeProjectIndex === 0 && activeImageIndex === 0}
                onClick={() => {
                  if (activeImageIndex > 0) {
                    navigateImage(-1);
                  } else {
                    navigateProject(-1);
                  }
                }}
              >
                &#8249;
              </button>
              <div className="lightbox-image-wrap">
                {allImages.length > 0 ? (
                  <img src={allImages[activeImageIndex]} alt={activeDesign.title} />
                ) : (
                  <div style={{ width: "100%", height: "26rem", background: "linear-gradient(135deg, rgba(217,182,111,0.15), rgba(92,225,230,0.1))", borderRadius: "1rem" }} />
                )}
              </div>
              <button
                className="lightbox-nav lightbox-next"
                type="button"
                aria-label="Next"
                disabled={activeProjectIndex === designs.length - 1 && activeImageIndex === totalProjectImages - 1}
                onClick={() => {
                  if (activeImageIndex < totalProjectImages - 1) {
                    navigateImage(1);
                  } else {
                    navigateProject(1);
                  }
                }}
              >
                &#8250;
              </button>
            </div>
            {totalProjectImages > 1 && (
              <div className="lightbox-thumbs" style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      border: idx === activeImageIndex ? "2px solid #d9b66f" : "2px solid rgba(255,255,255,0.1)",
                      opacity: idx === activeImageIndex ? 1 : 0.5,
                      transition: "all 0.2s",
                      cursor: "pointer",
                      padding: 0,
                      background: "none",
                    }}
                  >
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
