"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

const systemTypes = [
  {
    title: "Booking Systems",
    description: "Let customers schedule appointments without relying entirely on manual communication.",
    examples: ["Service booking", "Appointment scheduling", "Calendar integration", "Automated reminders"],
  },
  {
    title: "Lead Capture Systems",
    description: "Capture enquiries and guide potential customers toward taking action.",
    examples: ["Contact forms", "Quote builders", "Assessment tools", "CRM integration"],
  },
  {
    title: "Customer Portals",
    description: "Give customers a dedicated place to interact with the business.",
    examples: ["Account dashboards", "Order tracking", "Document access", "Support tickets"],
  },
  {
    title: "Admin Dashboards",
    description: "Give business owners control over important information, processes, and activity.",
    examples: ["Analytics & reporting", "Content management", "User management", "Workflow control"],
  },
  {
    title: "Payment Experiences",
    description: "Make it easier for customers to complete transactions where appropriate.",
    examples: ["Checkout flows", "Subscription management", "Invoice payment", "Multi-currency"],
  },
  {
    title: "Custom Web Applications",
    description: "For problems that cannot be solved by an ordinary website.",
    examples: ["Business workflow tools", "Data visualization", "Multi-user platforms", "API integrations"],
  },
];

export default function WebSystemsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .in("category", ["web-systems", "brand-web"])
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
        <p className="section-kicker">Web Systems</p>
      </RevealOnScroll>
      <RevealOnScroll delay={60}>
        <h1 className="section-heading">Turn business problems into useful web experiences.</h1>
      </RevealOnScroll>
      <RevealOnScroll delay={120}>
        <p style={{ color: "var(--slate)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "46rem", marginTop: "1rem" }}>
          We design and build web systems around the way your business actually works — from booking and lead capture to dashboards, payments, customer experiences, and custom workflows.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={180}>
        <div className="service-process" style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: "var(--blue)", fontWeight: 700 }}>Problem</span>
          <span className="process-arrow" style={{ color: "var(--slate)" }}>→</span>
          <span style={{ color: "var(--blue)", fontWeight: 700 }}>Experience</span>
          <span className="process-arrow" style={{ color: "var(--slate)" }}>→</span>
          <span style={{ color: "var(--blue)", fontWeight: 700 }}>System</span>
          <span className="process-arrow" style={{ color: "var(--slate)" }}>→</span>
          <span style={{ color: "var(--blue)", fontWeight: 700 }}>Solution</span>
        </div>
      </RevealOnScroll>

      {/* System Types */}
      <RevealOnScroll delay={240}>
        <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 500, fontFamily: "Georgia, serif", marginTop: "3rem" }}>What can we build for your business?</h2>
        <div className="system-types-grid" style={{ 
          marginTop: "2rem", 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {systemTypes.map((system, i) => (
            <RevealOnScroll key={system.title} delay={i * 60}>
              <article className="system-type-card" style={{ 
                padding: "2rem", 
                border: "1px solid rgba(19, 99, 223, 0.16)", 
                borderRadius: "1rem", 
                background: "linear-gradient(150deg, rgba(19, 99, 223, 0.035), transparent 45%), white",
                boxShadow: "0 0.6rem 1.8rem rgba(13, 46, 94, 0.06)",
                transition: "border-color 200ms, box-shadow 200ms, transform 200ms",
              }}>
                <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.25rem", fontWeight: 600, color: "var(--ink)" }}>{system.title}</h3>
                <p style={{ color: "var(--slate)", lineHeight: "1.7", marginBottom: "1.5rem" }}>{system.description}</p>
<ul className="system-list">
                  {system.examples.map((ex, idx) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={360}>
        <p className="system-types-cta" style={{ 
          marginTop: "3rem", 
          textAlign: "center", 
          fontSize: "1.1rem", 
          color: "var(--slate)" 
        }}>
          <strong style={{ color: "var(--ink)" }}>If your problem doesn't fit inside a normal website, we can build the system around it.</strong>
        </p>
      </RevealOnScroll>

      {/* Web Systems Projects */}
      <RevealOnScroll delay={400}>
        <div style={{ marginTop: "4rem", borderTop: "1px solid var(--line)", paddingTop: "3rem" }}>
          <p className="section-kicker">Web System Work</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, fontFamily: "Georgia, serif", marginTop: "0.5rem" }}>Selected web system projects</h2>
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
          <h3>No web system projects yet</h3>
          <p>Projects will appear here once published through the admin dashboard.</p>
        </div>
      ) : (
        <div className="project-stack" style={{ marginTop: "2rem" }}>
          {projects.map((project, i) => (
            <RevealOnScroll key={project.id} delay={Math.min(i * 80, 300)}>
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
                  <span className="project-tag">{project.category === "brand-web" ? "Brand + Web" : "Web System"}</span>
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

      <RevealOnScroll delay={500}>
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/work" className="btn-ghost">
            View All Work →
          </Link>
        </div>
      </RevealOnScroll>
    </section>
  );
}