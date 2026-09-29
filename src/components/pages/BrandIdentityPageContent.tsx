"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ProjectPreview from "@/components/ui/ProjectPreview";

export default function BrandIdentityPageContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .in("category", ["brand-identity", "brand-web"])
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (fetchError) setError(true);
      if (data) setProjects(data as Project[]);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      <RevealOnScroll>
        <p className="section-kicker">Brand Identity</p>
      </RevealOnScroll>
      <RevealOnScroll delay={60}>
        <h1 className="section-heading">A brand should be recognized before it's explained.</h1>
      </RevealOnScroll>
      <RevealOnScroll delay={120}>
        <p style={{ color: "var(--slate)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "46rem", marginTop: "1rem" }}>
          We create identities that give businesses a recognizable visual language, a clear story, and a personality people can remember.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={180}>
        <div className="brand-process" style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: "var(--blue)", fontWeight: 700 }}>Strategy</span>
          <span className="process-arrow" style={{ color: "var(--slate)" }}>→</span>
          <span style={{ color: "var(--blue)", fontWeight: 700 }}>Story</span>
          <span className="process-arrow" style={{ color: "var(--slate)" }}>→</span>
          <span style={{ color: "var(--blue)", fontWeight: 700 }}>Identity</span>
          <span className="process-arrow" style={{ color: "var(--slate)" }}>→</span>
          <span style={{ color: "var(--blue)", fontWeight: 700 }}>Recognition</span>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={240}>
        <ul className="brand-deliverables" style={{ 
          marginTop: "3rem", 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "1rem",
          listStyle: "none",
          padding: 0
        }}>
          <li style={{ padding: "1.5rem", border: "1px solid rgba(19, 99, 223, 0.16)", borderRadius: "0.85rem", background: "linear-gradient(150deg, rgba(19, 99, 223, 0.035), transparent 45%), white", boxShadow: "0 0.5rem 1.5rem rgba(13, 46, 94, 0.05)" }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--ink)" }}>Logos & Logo Systems</strong>
            <p style={{ color: "var(--slate)", margin: 0 }}>Primary, secondary, and responsive logo variations with clear usage rules.</p>
          </li>
          <li style={{ padding: "1.5rem", border: "1px solid rgba(19, 99, 223, 0.16)", borderRadius: "0.85rem", background: "linear-gradient(150deg, rgba(19, 99, 223, 0.035), transparent 45%), white", boxShadow: "0 0.5rem 1.5rem rgba(13, 46, 94, 0.05)" }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--ink)" }}>Typography & Color Systems</strong>
            <p style={{ color: "var(--slate)", margin: 0 }}>Type hierarchies and color palettes that work across digital and print.</p>
          </li>
          <li style={{ padding: "1.5rem", border: "1px solid rgba(19, 99, 223, 0.16)", borderRadius: "0.85rem", background: "linear-gradient(150deg, rgba(19, 99, 223, 0.035), transparent 45%), white", boxShadow: "0 0.5rem 1.5rem rgba(13, 46, 94, 0.05)" }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--ink)" }}>Graphic Language & Visual Direction</strong>
            <p style={{ color: "var(--slate)", margin: 0 }}>Patterns, iconography, illustration style, and art direction.</p>
          </li>
          <li style={{ padding: "1.5rem", border: "1px solid rgba(19, 99, 223, 0.16)", borderRadius: "0.85rem", background: "linear-gradient(150deg, rgba(19, 99, 223, 0.035), transparent 45%), white", boxShadow: "0 0.5rem 1.5rem rgba(13, 46, 94, 0.05)" }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--ink)" }}>Brand Guidelines</strong>
            <p style={{ color: "var(--slate)", margin: 0 }}>Comprehensive documentation for consistent application across teams.</p>
          </li>
          <li style={{ padding: "1.5rem", border: "1px solid rgba(19, 99, 223, 0.16)", borderRadius: "0.85rem", background: "linear-gradient(150deg, rgba(19, 99, 223, 0.035), transparent 45%), white", boxShadow: "0 0.5rem 1.5rem rgba(13, 46, 94, 0.05)" }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--ink)" }}>Social Media Identity</strong>
            <p style={{ color: "var(--slate)", margin: 0 }}>Templates, profile systems, and content frameworks for social channels.</p>
          </li>
          <li style={{ padding: "1.5rem", border: "1px solid rgba(19, 99, 223, 0.16)", borderRadius: "0.85rem", background: "linear-gradient(150deg, rgba(19, 99, 223, 0.035), transparent 45%), white", boxShadow: "0 0.5rem 1.5rem rgba(13, 46, 94, 0.05)" }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--ink)" }}>Marketing Materials & Mockups</strong>
            <p style={{ color: "var(--slate)", margin: 0 }}>Business cards, presentations, packaging, signage, and digital ads.</p>
          </li>
          <li style={{ padding: "1.5rem", border: "1px solid rgba(19, 99, 223, 0.16)", borderRadius: "0.85rem", background: "linear-gradient(150deg, rgba(19, 99, 223, 0.035), transparent 45%), white", boxShadow: "0 0.5rem 1.5rem rgba(13, 46, 94, 0.05)" }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--ink)" }}>Digital Brand Applications</strong>
            <p style={{ color: "var(--slate)", margin: 0 }}>Website design systems, app interfaces, email templates, and more.</p>
          </li>
        </ul>
      </RevealOnScroll>

      {/* Brand Identity Projects */}
      <RevealOnScroll delay={300}>
        <div style={{ marginTop: "4rem", borderTop: "1px solid var(--line)", paddingTop: "3rem" }}>
          <p className="section-kicker">Brand Work</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, fontFamily: "Georgia, serif", marginTop: "0.5rem" }}>Selected brand identity projects</h2>
        </div>
      </RevealOnScroll>

      {loading ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>Loading projects...</h3>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>Projects temporarily unavailable</h3>
          <p>Please try again shortly.</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <h3>No brand identity projects yet</h3>
          <p>Projects will appear here once published through the admin dashboard.</p>
        </div>
      ) : (
        <div className="project-stack" style={{ marginTop: "2rem" }}>
          {projects.map((project, i) => (
            <RevealOnScroll key={project.id} delay={Math.min(i * 80, 300)}>
              <ProjectPreview
                project={project}
                href={`/work/${project.slug}`}
                index={i}
                showIndex
                size="default"
              />
            </RevealOnScroll>
          ))}
        </div>
      )}

      <RevealOnScroll delay={400}>
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/work" className="btn-ghost">
            View All Work →
          </Link>
        </div>
      </RevealOnScroll>
    </section>
  );
}
