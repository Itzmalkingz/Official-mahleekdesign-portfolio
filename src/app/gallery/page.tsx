"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function GalleryPage() {
  const [designs, setDesigns] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchDesigns = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("category", "design")
        .order("created_at", { ascending: false });
      if (data) setDesigns(data as Project[]);
      setLoading(false);
    };
    fetchDesigns();
  }, []);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const navigate = (dir: number) => {
    const next = activeIndex + dir;
    if (next >= 0 && next < designs.length) setActiveIndex(next);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const activeDesign = designs[activeIndex];
  const allImages = activeDesign?.images?.length
    ? activeDesign.images
    : activeDesign?.image_url
    ? [activeDesign.image_url]
    : [];

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
              <button className="gallery-item" type="button" onClick={() => openLightbox(i)}>
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
                {activeIndex + 1} / {designs.length}
              </div>
            </div>
            <div className="lightbox-preview">
              <button
                className="lightbox-nav lightbox-prev"
                type="button"
                aria-label="Previous image"
                onClick={() => navigate(-1)}
              >
                &#8249;
              </button>
              <div className="lightbox-image-wrap">
                {allImages.length > 0 ? (
                  <img src={allImages[0]} alt={activeDesign.title} />
                ) : (
                  <div style={{ width: "100%", height: "26rem", background: "linear-gradient(135deg, rgba(217,182,111,0.15), rgba(92,225,230,0.1))", borderRadius: "1rem" }} />
                )}
              </div>
              <button
                className="lightbox-nav lightbox-next"
                type="button"
                aria-label="Next image"
                onClick={() => navigate(1)}
              >
                &#8250;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
