"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Parallax from "@/components/ui/Parallax";

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("category", "web")
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setFeaturedProjects(data as Project[]);
    };
    fetchProjects();
  }, []);

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
            <p className="section-kicker">Mahleek Design — Brand identity, web, and visual systems</p>
          </RevealOnScroll>
          <RevealOnScroll delay={60}>
            <h1>Premium brands and websites that make businesses impossible to ignore.</h1>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p className="hero-text">
              I help founders, service businesses, and creative brands look more trusted, communicate
              faster, and turn attention into real enquiries with refined design and clean frontend
              execution.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={180}>
            <div className="hero-actions">
              <Link href="/web-projects" className="btn-primary">
                Explore My Work
              </Link>
              <Link href="/contact" className="btn-ghost">
                Get in Touch
              </Link>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={240}>
            <div className="hero-metrics" aria-label="Portfolio highlights">
              <div>
                <strong>30+</strong>
                <span>brand and web assets delivered</span>
              </div>
              <div>
                <strong>3+</strong>
                <span>years building visual systems</span>
              </div>
              <div>
                <strong>5</strong>
                <span>industries shaped with design</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        <aside className="hero-showpiece" aria-label="Mahleek portfolio positioning">
          <div className="showpiece-label">Selected studio profile</div>
          <div
            className="hero-portrait"
            style={{
              background: "linear-gradient(135deg, rgba(217,182,111,0.3), rgba(92,225,230,0.2))",
              display: "grid",
              placeItems: "center",
              fontSize: "4rem",
              fontWeight: 900,
              color: "#d9b66f",
            }}
          >
            M
          </div>
          <div className="showpiece-bottom">
            <div>
              <strong>Brand Systems</strong>
              <span>Logos, identity, social presence</span>
            </div>
            <div>
              <strong>Web Experiences</strong>
              <span>Responsive sites with conversion focus</span>
            </div>
          </div>
        </aside>

        <div className="scroll-cue" aria-hidden="true">
          <span />
          <p>Scroll the story</p>
        </div>
      </section>

      {/* Marquee */}
      <section className="marquee-band" aria-label="Capabilities">
        <div className="marquee-track">
          <span>Brand Strategy</span>
          <span>Identity Design</span>
          <span>Frontend Development</span>
          <span>Landing Pages</span>
          <span>Social Campaigns</span>
          <span>Launch Support</span>
          <span>Brand Strategy</span>
          <span>Identity Design</span>
          <span>Frontend Development</span>
          <span>Landing Pages</span>
          <span>Social Campaigns</span>
          <span>Launch Support</span>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="trust-section">
        <RevealOnScroll>
          <div className="trust-strip">
            <span>Trusted for</span>
            <strong>Wellness</strong>
            <strong>Fashion</strong>
            <strong>Education</strong>
            <strong>Beauty</strong>
            <strong>Local Services</strong>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <div className="tool-row" style={{ marginTop: "0.9rem" }}>
            <span>Built with</span>
            <strong>React</strong>
            <strong>Next.js</strong>
            <strong>Tailwind</strong>
            <strong>Figma</strong>
            <strong>Photoshop</strong>
            <strong>Canva</strong>
          </div>
        </RevealOnScroll>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="section-padding">
          <RevealOnScroll>
            <p className="section-kicker">Featured case studies</p>
          </RevealOnScroll>
          <RevealOnScroll delay={60}>
            <h2 className="section-heading" style={{ marginTop: "0.9rem" }}>
              Real projects shaped with strategy, direction, and launch-ready design.
            </h2>
          </RevealOnScroll>
          <div className="project-stack" style={{ marginTop: "2rem" }}>
            {featuredProjects.map((project, i) => (
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
                    <span className="project-tag">{project.title}</span>
                    <h3>{project.description || "A refined web experience built with strategy and clean execution."}</h3>
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
        </section>
      )}

      {/* Services */}
      <section className="section-padding">
        <RevealOnScroll>
          <p className="section-kicker">How premium projects are built</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading">
            A clear process that turns raw ideas into a brand people remember.
          </h2>
        </RevealOnScroll>
        <div className="service-grid">
          <RevealOnScroll delay={0}>
            <div className="service-card">
              <span>01</span>
              <h3>Brand Clarity</h3>
              <p>
                We define what the business should be known for, who it needs to attract, and how the
                brand should feel before design begins.
              </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={80}>
            <div className="service-card">
              <span>02</span>
              <h3>Visual Direction</h3>
              <p>
                I shape the identity, typography, color, imagery, and page composition so the brand
                feels intentional across every touchpoint.
              </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={160}>
            <div className="service-card">
              <span>03</span>
              <h3>Launch Experience</h3>
              <p>
                The final website or design system is polished for mobile, performance, readability,
                and the actions you want clients to take.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-section" data-scene>
        <span className="contact-glow" data-depth="0.18" aria-hidden="true" />
        <div className="contact-copy">
          <RevealOnScroll>
            <p className="section-kicker">Ready for a stronger brand presence?</p>
          </RevealOnScroll>
          <RevealOnScroll delay={60}>
            <h2>Let us build the version of your business people instantly trust.</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p>
              Send a message with your project idea. I will help you clarify what to build, what to
              improve, and how to make the brand feel more premium from the first touch.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={180}>
            <Link href="/contact" className="btn-primary">
              Get in Touch
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
