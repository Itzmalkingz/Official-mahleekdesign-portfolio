"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function WebProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("category", "web")
        .order("created_at", { ascending: false });
      if (data) setProjects(data as Project[]);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      <RevealOnScroll>
        <p className="section-kicker">Web Development Portfolio</p>
      </RevealOnScroll>
      <RevealOnScroll delay={60}>
        <h1 className="section-heading">
          Websites and web experiences built with strategy, precision, and clean code.
        </h1>
      </RevealOnScroll>
      <RevealOnScroll delay={120}>
        <p style={{ color: "#bdb5aa", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "46rem", marginTop: "1rem" }}>
          Each project represents a unique challenge solved through thoughtful design and modern
          frontend development. From landing pages to full web applications.
        </p>
      </RevealOnScroll>

      {loading ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>Loading projects...</h3>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>No web projects yet</h3>
          <p>New projects will appear here once added through the admin dashboard.</p>
        </div>
      ) : (
        <div className="project-stack" style={{ marginTop: "3rem" }}>
          {projects.map((project, i) => (
            <RevealOnScroll key={project.id} delay={i * 80}>
              <div className="project-panel" tabIndex={0} role="link" aria-label={`Open ${project.title}`}>
                <div className="project-index">{String(i + 1).padStart(2, "0")}</div>
                <div className="project-visual">
                  {project.image_url ? (
                    <img src={project.image_url} alt={project.title} loading="lazy" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", minHeight: "18rem", background: "linear-gradient(135deg, rgba(217,182,111,0.15), rgba(92,225,230,0.1))" }} />
                  )}
                </div>
                <div className="project-copy">
                  <span className="project-tag">
                    {project.tags?.length ? project.tags.join(" — ") : "Web Development"}
                  </span>
                  <h3>{project.title}</h3>
                  {project.description && <p>{project.description}</p>}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer" className="project-link">
                      View Live Project
                    </a>
                  )}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      )}
    </section>
  );
}
