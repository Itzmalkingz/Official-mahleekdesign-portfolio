"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setProject(data as Project);

        const { data: related } = await supabase
          .from("projects")
          .select("*")
          .eq("category", data.category)
          .neq("id", data.id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(3);

        if (related) setRelatedProjects(related as Project[]);
      }

      setLoading(false);
    };

    fetchProject();
  }, [params.id]);

  if (loading) {
    return (
      <section className="section-padding" style={{ paddingTop: "9rem" }}>
        <div className="empty-state">
          <h3>Loading project...</h3>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="section-padding" style={{ paddingTop: "9rem" }}>
        <div className="empty-state">
          <h3>Project not found</h3>
          <Link href="/web-projects" className="btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>
            Back to Projects
          </Link>
        </div>
      </section>
    );
  }

  const allImages = project.images?.length
    ? project.images
    : project.image_url
    ? [project.image_url]
    : [];

  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      {/* Back Link */}
      <RevealOnScroll>
        <Link
          href={project.category === "design" ? "/gallery" : "/web-projects"}
          style={{
            color: "#d9b66f",
            textDecoration: "none",
            fontSize: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "2rem",
          }}
        >
          &#8249; Back to {project.category === "design" ? "Gallery" : "Projects"}
        </Link>
      </RevealOnScroll>

      {/* Header */}
      <RevealOnScroll>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <span className="project-tag">{project.category === "web" ? "Web Development" : "Graphic Design"}</span>
            {project.services?.map((service) => (
              <span key={service} className="project-tag">{service}</span>
            ))}
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>
            {project.title}
          </h1>
          {project.description && (
            <p style={{ color: "#bdb5aa", fontSize: "1.15rem", lineHeight: "1.7", maxWidth: "40rem" }}>
              {project.description}
            </p>
          )}
        </div>
      </RevealOnScroll>

      {/* Tags */}
      {project.tags?.length > 0 && (
        <RevealOnScroll delay={40}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "0.3rem 0.8rem",
                  borderRadius: "2rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#bdb5aa",
                  fontSize: "0.85rem",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      )}

      {/* Hero Image */}
      <RevealOnScroll delay={60}>
        <div style={{ marginBottom: "3rem" }}>
          {allImages.length > 0 ? (
            <div style={{ borderRadius: "1rem", overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
              <img
                src={allImages[activeImage]}
                alt={project.title}
                style={{ width: "100%", maxHeight: "40rem", objectFit: "contain" }}
              />
            </div>
          ) : (
            <div style={{
              width: "100%",
              height: "24rem",
              borderRadius: "1rem",
              background: "linear-gradient(135deg, rgba(217,182,111,0.15), rgba(92,225,230,0.1))",
              display: "grid",
              placeItems: "center",
              fontSize: "4rem",
              fontWeight: 900,
              color: "#d9b66f",
            }}>
              {project.title[0]}
            </div>
          )}
        </div>
      </RevealOnScroll>

      {/* Image Thumbnails */}
      {allImages.length > 1 && (
        <RevealOnScroll delay={80}>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "3rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(idx)}
                style={{
                  flex: "0 0 auto",
                  width: "5rem",
                  height: "5rem",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  border: idx === activeImage ? "2px solid #d9b66f" : "2px solid rgba(255,255,255,0.1)",
                  opacity: idx === activeImage ? 1 : 0.5,
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
        </RevealOnScroll>
      )}

      {/* Case Study */}
      {project.case_study && (
        <RevealOnScroll delay={100}>
          <div style={{ marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Case Study</h2>
            <div style={{
              color: "#bdb5aa",
              fontSize: "1.05rem",
              lineHeight: "1.8",
              maxWidth: "48rem",
              whiteSpace: "pre-wrap",
            }}>
              {project.case_study}
            </div>
          </div>
        </RevealOnScroll>
      )}

      {/* Project Info Grid */}
      <RevealOnScroll delay={120}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
          padding: "2rem",
          borderRadius: "1rem",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}>
          <div>
            <span style={{ color: "#7d776f", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</span>
            <p style={{ color: "#f6f1e8", fontSize: "1rem", marginTop: "0.25rem" }}>
              {project.category === "web" ? "Web Development" : "Graphic Design"}
            </p>
          </div>
          {project.services?.length > 0 && (
            <div>
              <span style={{ color: "#7d776f", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Services</span>
              <p style={{ color: "#f6f1e8", fontSize: "1rem", marginTop: "0.25rem" }}>
                {project.services.join(", ")}
              </p>
            </div>
          )}
          <div>
            <span style={{ color: "#7d776f", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</span>
            <p style={{ color: "#f6f1e8", fontSize: "1rem", marginTop: "0.25rem" }}>
              {new Date(project.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </RevealOnScroll>

      {/* Live Link */}
      {project.live_url && (
        <RevealOnScroll delay={140}>
          <div style={{ marginBottom: "4rem" }}>
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              View Live Project &#8599;
            </a>
          </div>
        </RevealOnScroll>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <RevealOnScroll delay={160}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "3rem" }}>
            <p className="section-kicker">More {project.category === "web" ? "Projects" : "Design Work"}</p>
            <div className="project-stack" style={{ marginTop: "1.5rem" }}>
              {relatedProjects.map((rp, i) => (
                <RevealOnScroll key={rp.id} delay={i * 80}>
                  <Link href={`/web-projects/${rp.id}`} className="project-panel" aria-label={`Open ${rp.title}`}>
                    <div className="project-index">{String(i + 1).padStart(2, "0")}</div>
                    <div className="project-visual">
                      {rp.image_url ? (
                        <img src={rp.image_url} alt={rp.title} loading="lazy" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", minHeight: "12rem", background: "linear-gradient(135deg, rgba(217,182,111,0.15), rgba(92,225,230,0.1))" }} />
                      )}
                    </div>
                    <div className="project-copy">
                      <span className="project-tag">{rp.title}</span>
                      <h3>{rp.description || "A refined experience built with strategy and clean execution."}</h3>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      )}
    </section>
  );
}
