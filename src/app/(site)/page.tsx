"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Parallax from "@/components/ui/Parallax";
import BrandManifesto from "@/components/ui/BrandManifesto";

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [projectsError, setProjectsError] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .eq("featured", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) setProjectsError(true);
      if (data) setFeaturedProjects(data as Project[]);
    };
    fetchProjects();
  }, []);

  const categoryLabels: Record<string, string> = {
    "brand-identity": "Brand Identity",
    "web-systems": "Web System",
    "brand-web": "Brand + Web",
  };

  return (
    <>
      <ScrollProgress />
      <Parallax />

      {/* Hero */}
      <section className="hero-section" data-scene>
        <div className="hero-backdrop" aria-hidden="true">
          <span className="halo halo-one" data-depth="0.18" />
          <span className="halo halo-two" data-depth="-0.12" />
          <span className="grid-plane" data-depth="0.06" />
          <span className="light-sweep" data-depth="0.22" />
        </div>

        <div className="hero-content">
          <RevealOnScroll>
            <p className="section-kicker">Mahleek Design — Creative Technology Studio</p>
          </RevealOnScroll>
          <RevealOnScroll delay={60}>
            <h1>We build brands people remember — and web systems businesses rely on.</h1>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p className="hero-text">
              We combine strategic brand identity with purposeful web development to help businesses become recognizable, communicate clearly, and solve real problems through technology.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={180}>
            <div className="hero-actions">
              <Link href="/work" className="btn-primary">
                Explore Our Work
              </Link>
              <Link href="/contact" className="btn-ghost">
                Start a Project
              </Link>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={240}>
            <div className="hero-metrics" aria-label="Portfolio highlights">
              <div>
                <strong>30+</strong>
                <span>brand & web systems delivered</span>
              </div>
              <div>
                <strong>3+</strong>
                <span>years building with purpose</span>
              </div>
              <div>
                <strong>5</strong>
                <span>industries shaped</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        <aside className="hero-showpiece" aria-label="Mahleek portfolio positioning">
          <div className="showpiece-label">Selected work</div>
          <img
            className="hero-portrait"
            src="/images/my%20personal%20picture/mahleek.png"
            alt="Mahleek, founder of Mahleek Design"
          />
          <div className="showpiece-bottom">
            <div>
              <strong>Brand Identity</strong>
              <span>Strategy, identity, recognition</span>
            </div>
            <div>
              <strong>Web Systems</strong>
              <span>Booking, dashboards, workflows</span>
            </div>
          </div>
        </aside>

        <div className="scroll-cue" aria-hidden="true">
          <span />
          <p>Scroll the story</p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section-padding problem-section">
        <RevealOnScroll>
          <p className="section-kicker">The Philosophy</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading">
            Your business doesn't need another website. It needs a better way to work.
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <p className="problem-intro">
            Every business has different challenges. Customers may struggle to book. Leads may be getting lost. Manual processes may be slowing the team down. Or the brand may simply fail to communicate its value.
            <br /><br />
            We identify the problem, design the experience, and build the solution around it.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={180}>
          <div className="problem-cards">
            <div className="problem-card">
              <div className="problem-icon">1</div>
              <h3>Losing potential customers?</h3>
              <p>Build a better lead capture and conversion experience.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">2</div>
              <h3>Managing bookings manually?</h3>
              <p>Give customers a simple way to book and manage appointments.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">3</div>
              <h3>Repeating the same tasks?</h3>
              <p>Turn repetitive processes into useful web-based workflows.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">4</div>
              <h3>Struggling to stand out?</h3>
              <p>Create a brand identity people can recognize and remember.</p>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Two Core Services */}
      <section className="section-padding services-section">
        <RevealOnScroll>
          <p className="section-kicker">What We Do</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading">Two ways we help businesses move forward.</h2>
        </RevealOnScroll>

        <div className="service-cards-grid">
          {/* Brand Identity */}
          <RevealOnScroll delay={120}>
            <article className="service-card-large brand-card">
              <div className="service-header">
                <span className="service-number">01</span>
                <span className="service-label">Brand Identity</span>
              </div>
              <h3>Make your brand impossible to forget.</h3>
              <p className="service-description">
                Your brand is more than a logo. We create strategic visual identities with a clear story, personality, and visual language — helping people recognize your business, understand what you stand for, and remember you.
              </p>
              <div className="service-process">
                <span>Strategy</span>
                <span className="process-arrow">→</span>
                <span>Story</span>
                <span className="process-arrow">→</span>
                <span>Identity</span>
                <span className="process-arrow">→</span>
                <span>Recognition</span>
              </div>
              <ul className="service-examples">
                <li>Brand Strategy & Positioning</li>
                <li>Logo Systems & Visual Direction</li>
                <li>Typography & Color Systems</li>
                <li>Brand Guidelines</li>
                <li>Social Media Identity</li>
                <li>Marketing Materials & Digital Applications</li>
              </ul>
              <Link href="/brand-identity" className="btn-primary service-cta">
                Explore Brand Work →
              </Link>
            </article>
          </RevealOnScroll>

          {/* Web Systems */}
          <RevealOnScroll delay={180}>
            <article className="service-card-large web-card">
              <div className="service-header">
                <span className="service-number">02</span>
                <span className="service-label">Web Systems</span>
              </div>
              <h3>Turn business problems into useful web experiences.</h3>
              <p className="service-description">
                We design and build web systems around the way your business actually works — from booking and lead capture to dashboards, payments, customer experiences, and custom workflows.
              </p>
              <div className="service-process">
                <span>Problem</span>
                <span className="process-arrow">→</span>
                <span>Experience</span>
                <span className="process-arrow">→</span>
                <span>System</span>
                <span className="process-arrow">→</span>
                <span>Solution</span>
              </div>
              <ul className="service-examples">
                <li>Booking & Appointment Systems</li>
                <li>Lead Capture & Conversion</li>
                <li>Customer Portals & Dashboards</li>
                <li>Payment Experiences</li>
                <li>Custom Web Applications</li>
                <li>Business Workflow Automation</li>
              </ul>
              <Link href="/web-systems" className="btn-primary service-cta">
                Explore Web Systems →
              </Link>
            </article>
          </RevealOnScroll>
        </div>
      </section>

      {/* Brand + Web Connection */}
      <section className="section-padding connection-section">
        <RevealOnScroll>
          <p className="section-kicker">The Connection</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading">The brand is only the beginning.</h2>
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <p className="connection-copy">
            A strong identity tells people who you are. A strong digital experience shows them what that means.
            <br /><br />
            We can build both — creating a consistent journey from the first impression to the moment a customer takes action.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={180}>
          <div className="connection-flow">
            <div className="flow-step">
              <div className="flow-icon brand-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18h6" />
                  <path d="M10 21h4" />
                  <path d="M12 3a6 6 0 0 0-4.6 9.7c.8 1 1.4 1.4 1.6 2.3h6c.2-.9.8-1.3 1.6-2.3A6 6 0 0 0 12 3Z" />
                  <path d="M8.5 9.5a3.5 3.5 0 0 1 7 0" />
                </svg>
              </div>
              <h4>Brand Identity</h4>
              <p>Who are you?</p>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-icon experience-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h4>Digital Experience</h4>
              <p>How do people experience you?</p>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-icon system-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18l6-6-6-6" />
                  <path d="M8 6l-6 6 6 6" />
                  <path d="M14 4l-4 16" />
                </svg>
              </div>
              <h4>Web System</h4>
              <p>How does your business work?</p>
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-step">
              <div className="flow-icon action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8.5 12.5l2.2 2.2 4.8-5" />
                </svg>
              </div>
              <h4>Customer Action</h4>
              <p>Conversion & loyalty</p>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="section-padding portfolio-section">
          <RevealOnScroll>
            <p className="section-kicker">Portfolio</p>
          </RevealOnScroll>
          <RevealOnScroll delay={60}>
            <h2 className="section-heading">Built to solve.</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p className="portfolio-intro">
              A selection of brand identities, web systems, and digital experiences built around real business needs.
            </p>
          </RevealOnScroll>
          <div className="project-stack" style={{ marginTop: "2rem" }}>
            {featuredProjects.map((project, i) => (
              <RevealOnScroll key={project.id} delay={i * 80}>
                <Link href={`/work/${project.slug}`} className="project-panel" aria-label={`Open ${project.title}`}>
                  <div className="project-index">{String(i + 1).padStart(2, "0")}</div>
                  <div className="project-visual">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.title} loading="lazy" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", minHeight: "18rem", background: "linear-gradient(135deg, rgba(19, 99, 223, 0.18), rgba(78, 151, 255, 0.12))" }} />
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
          <RevealOnScroll delay={300}>
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link href="/work" className="btn-ghost">
                View All Work →
              </Link>
            </div>
          </RevealOnScroll>
        </section>
      )}

      {projectsError && (
        <section className="section-padding">
          <div className="empty-state">
            <h3>Featured work is temporarily unavailable.</h3>
            <p>Please visit the portfolio shortly, or get in touch to request relevant work.</p>
          </div>
        </section>
      )}

      {/* Web System Types */}
      <section className="section-padding system-types-section">
        <RevealOnScroll>
          <p className="section-kicker">Capabilities</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading">What can we build for your business?</h2>
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <div className="system-types-grid">
            <article className="system-type-card">
              <h3>Booking Systems</h3>
              <p>Let customers schedule appointments without relying entirely on manual communication.</p>
            </article>
            <article className="system-type-card">
              <h3>Lead Capture Systems</h3>
              <p>Capture enquiries and guide potential customers toward taking action.</p>
            </article>
            <article className="system-type-card">
              <h3>Customer Portals</h3>
              <p>Give customers a dedicated place to interact with the business.</p>
            </article>
            <article className="system-type-card">
              <h3>Admin Dashboards</h3>
              <p>Give business owners control over important information, processes, and activity.</p>
            </article>
            <article className="system-type-card">
              <h3>Payment Experiences</h3>
              <p>Make it easier for customers to complete transactions where appropriate.</p>
            </article>
            <article className="system-type-card">
              <h3>Custom Web Applications</h3>
              <p>For problems that cannot be solved by an ordinary website.</p>
            </article>
          </div>
        </RevealOnScroll>
<RevealOnScroll delay={180}>
            <p className="system-types-cta">
              <strong>If your problem doesn't fit inside a normal website, we can build the system around it.</strong>
            </p>
          </RevealOnScroll>
        </section>

        {/* Brand Manifesto — the core promise */}
        <BrandManifesto />

        {/* Brand Identity Section */}
      <section className="section-padding brand-section">
        <RevealOnScroll>
          <p className="section-kicker">Brand Identity</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading">A brand should be recognized before it's explained.</h2>
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <p className="brand-intro">
            We create identities that give businesses a recognizable visual language, a clear story, and a personality people can remember.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={180}>
          <div className="brand-process">
            <span>Strategy</span>
            <span className="process-arrow">→</span>
            <span>Story</span>
            <span className="process-arrow">→</span>
            <span>Identity</span>
            <span className="process-arrow">→</span>
            <span>Recognition</span>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={240}>
          <ul className="brand-deliverables">
            <li>Logos & Logo Systems</li>
            <li>Typography & Color Systems</li>
            <li>Graphic Language & Visual Direction</li>
            <li>Brand Guidelines</li>
            <li>Social Media Identity</li>
            <li>Marketing Materials & Mockups</li>
            <li>Digital Brand Applications</li>
          </ul>
        </RevealOnScroll>
        <RevealOnScroll delay={300}>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/brand-identity" className="btn-primary">
              Explore Brand Work →
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* Contact CTA */}
      <section className="contact-section" data-scene>
        <span className="contact-glow" data-depth="0.18" aria-hidden="true" />
        <div className="contact-copy">
          <RevealOnScroll>
            <p className="section-kicker">Have a problem worth solving?</p>
          </RevealOnScroll>
          <RevealOnScroll delay={60}>
            <h2>Tell us what you're trying to improve, what isn't working, or what you're trying to build.</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p>
              We'll figure out what the right solution looks like — whether that's a stronger brand identity, a web system, or both.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={180}>
            <Link href="/contact" className="btn-primary">
              Start a Project →
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}