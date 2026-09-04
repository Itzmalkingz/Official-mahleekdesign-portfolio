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
  const [projectsError, setProjectsError] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("category", "web")
        .eq("featured", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) setProjectsError(true);
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
            <h1>Design that gives good businesses a sharper voice.</h1>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p className="hero-text">
              Brand identity, campaign design, and websites for teams ready to be recognised before
              they have to explain themselves. Clear thinking, distinctive visuals, meticulous build.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={180}>
            <div className="hero-actions">
              <Link href="/web-projects" className="btn-primary">
                See selected work
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
          <div className="showpiece-label">Selected identity work</div>
          <img
            className="hero-portrait"
            src="/images/my%20personal%20picture/mahleek.png"
            alt="Mahleek, founder of Mahleek Design"
          />
          <div className="showpiece-bottom">
            <div>
              <strong>Identity systems</strong>
              <span>Logos, voice, and visual language</span>
            </div>
            <div>
              <strong>Digital presence</strong>
              <span>Websites built to make the case</span>
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

      {/* Studio statement */}
      <section className="studio-statement section-padding">
        <RevealOnScroll>
          <div className="studio-statement-grid">
            <p className="section-kicker">A point of view</p>
            <div>
              <h2>A good brand should feel like it has already arrived.</h2>
              <p>
                Not louder. Not trendier. More precise in what it says, how it looks, and where it
                leads people next. That is the work: make the right details impossible to miss.
              </p>
              <Link href="/about" className="text-link">More about the studio <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </RevealOnScroll>
        <div className="studio-image-rhythm" aria-label="Selected brand work">
          <RevealOnScroll delay={80} className="studio-image studio-image-main">
            <img src="/images/N8V%20media%20brand%20identity/f23fa0841b56591065bed8bb26a9d6b6.jpg" alt="N8V Media identity application" loading="lazy" />
          </RevealOnScroll>
          <RevealOnScroll delay={150} className="studio-image studio-image-secondary">
            <img src="/images/Ember%20%26%20Oak%20Brand%20Identity/1001313086.jpg" alt="Ember and Oak brand identity work" loading="lazy" />
          </RevealOnScroll>
          <RevealOnScroll delay={220} className="studio-image studio-image-detail">
            <img src="/images/Social%20media%20designs/15d472ec7c0a3f8a03f74e496f60e422.jpg" alt="Mahleek social media design work" loading="lazy" />
          </RevealOnScroll>
        </div>
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
                <Link href={`/web-projects/${project.id}`} className="project-panel" aria-label={`Open ${project.title}`}>
                  <div className="project-index">{String(i + 1).padStart(2, "0")}</div>
                  <div className="project-visual">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} loading="lazy" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", minHeight: "18rem", background: "linear-gradient(135deg, rgba(217,182,111,0.15), rgba(92,225,230,0.1))" }} />
                    )}
                  </div>
                  <div className="project-copy">
                    <span className="project-tag">{project.tags?.length ? project.tags.join(" · ") : "Digital experience"}</span>
                    <h3>{project.title}</h3>
                    {project.description && <p>{project.description}</p>}
                    {project.live_url && (
                      <span className="project-link">
                        View Live Project
                      </span>
                    )}
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
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

      {/* Services */}
      <section className="section-padding">
        <RevealOnScroll>
          <p className="section-kicker">How premium projects are built</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading">
            A practical way to make the right impression, from the first decision to the final screen.
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
            <h2>Make the next version of your brand unmistakable.</h2>
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
