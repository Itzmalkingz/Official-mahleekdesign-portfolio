"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

const categoryLabels: Record<string, string> = {
  "brand-identity": "Brand Identity",
  "web-systems": "Web System",
  "brand-web": "Brand + Web",
};

const categoryFilters = [
  { value: "all", label: "All" },
  { value: "brand-identity", label: "Brand Identity" },
  { value: "web-systems", label: "Web Systems" },
  { value: "brand-web", label: "Brand + Web" },
];

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchProjects = async () => {
      let query = supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (activeFilter !== "all") {
        query = query.eq("category", activeFilter);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) setError(true);
      if (data) setProjects(data as Project[]);
      setLoading(false);
    };
    fetchProjects();
  }, [activeFilter]);

  const filteredProjects = projects;

  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      <RevealOnScroll>
        <p className="section-kicker">Portfolio</p>
      </RevealOnScroll>
      <RevealOnScroll delay={60}>
        <h1 className="section-heading">Built to solve.</h1>
      </RevealOnScroll>
      <RevealOnScroll delay={120}>
        <p style={{ color: "var(--slate)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "46rem", marginTop: "1rem" }}>
          A selection of brand identities, web systems, and digital experiences built around real business needs.
        </p>
      </RevealOnScroll>

      {/* Category Filter */}
      <RevealOnScroll delay={180}>
        <div className="category-filter" style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {categoryFilters.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`filter-btn ${activeFilter === cat.value ? "active" : ""}`}
              onClick={() => setActiveFilter(cat.value)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "999px",
                border: "1px solid rgba(19, 99, 223, 0.2)",
                background: activeFilter === cat.value ? "var(--blue)" : "white",
                color: activeFilter === cat.value ? "white" : "var(--ink)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 200ms ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </RevealOnScroll>

      {loading ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>Loading projects...</h3>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>Projects are temporarily unavailable</h3>
          <p>Please try again shortly.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>No projects in this category</h3>
          <p>Projects will appear here once published through the admin dashboard.</p>
        </div>
      ) : (
        <div className="project-stack" style={{ marginTop: "3rem" }}>
          {filteredProjects.map((project, i) => (
            <RevealOnScroll key={project.id} delay={Math.min(i * 60, 300)}>
              <Link href={`/work/${project.slug}`} className="project-panel" aria-label={`Open ${project.title}`}>
                <div className="project-index">{String(i + 1).padStart(2, "0")}</div>
                <div className="project-visual">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={project.title} loading="lazy" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", minHeight: "18rem", background: "linear-gradient(135deg, rgba(19,99,223,0.15), rgba(78,151,255,0.1))" }} />
                  )}
                </div>
                <div className="project-copy">
                  <span className="project-tag">{categoryLabels[project.category] || project.category}</span>
                  <h3>{project.title}</h3>
                  {project.short_description && <p>{project.short_description}</p>}
                  {project.live_url && (
                    <span className="project-link">View Live Project</span>
                  )}
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      )}
    </section>
  );
}