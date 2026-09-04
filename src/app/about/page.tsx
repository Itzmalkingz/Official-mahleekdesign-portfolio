import type { Metadata } from "next";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "About",
  description: "About Mahleek — Lagos-based brand designer and web developer building premium identities and websites.",
};

export default function AboutPage() {
  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      <RevealOnScroll>
        <p className="section-kicker">About Mahleek</p>
      </RevealOnScroll>

      <div className="about-grid" style={{ marginTop: "2rem" }}>
        <div className="about-text">
          <RevealOnScroll>
            <h2>I design where business goals meet a real human response.</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={60}>
            <p>
              I am a Lagos-based brand designer and web developer building identities, websites, and
              campaign visuals for businesses that want to be taken seriously. My process is simple:
              understand what makes the brand valuable, remove visual confusion, then create an
              experience that feels clear, premium, and easy to trust.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p>
              I care about the details clients notice and the details they only feel: spacing,
              hierarchy, tone, speed, mobile polish, image direction, and the confidence a brand
              gives before anyone reads a word.
            </p>
          </RevealOnScroll>
        </div>

        <RevealOnScroll delay={100}>
          <div className="about-portrait">
            <img
              src="/images/Ember%20%26%20Oak%20Brand%20Identity/1001313684.jpg"
              alt="Early identity sketch for Ember and Oak"
            />
            <span className="about-portrait-label">Design philosophy</span>
            <p>
              Every screen should make a business easier to understand, easier to trust, and harder to forget.
            </p>
          </div>
        </RevealOnScroll>
      </div>

      {/* Skills Section */}
      <div style={{ marginTop: "clamp(4rem, 8vw, 7rem)" }}>
        <RevealOnScroll>
          <p className="section-kicker">Skills &amp; Expertise</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading" style={{ marginTop: "0.9rem" }}>
            What I bring to every project.
          </h2>
        </RevealOnScroll>

        <div className="skills-grid">
          {[
            { title: "Web Development", desc: "React, Next.js, Tailwind CSS, responsive design, performance optimization, and modern frontend architecture." },
            { title: "Brand Identity", desc: "Logo design, visual identity systems, brand guidelines, color theory, and typography pairing." },
            { title: "UI/UX Design", desc: "User research, wireframing, prototyping, interaction design, and design systems." },
            { title: "Graphic Design", desc: "Social media graphics, print design, flyers, business cards, and campaign visuals." },
            { title: "Frontend Engineering", desc: "Clean code, component architecture, animation, accessibility, and cross-browser compatibility." },
            { title: "Creative Direction", desc: "Art direction, visual storytelling, mood boards, and cohesive design language across platforms." },
          ].map((skill, i) => (
            <RevealOnScroll key={skill.title} delay={i * 60}>
              <div className="skill-card">
                <span className="section-kicker" style={{ fontSize: "0.7rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{skill.title}</h3>
                <p>{skill.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div style={{ marginTop: "clamp(4rem, 8vw, 7rem)" }}>
        <RevealOnScroll>
          <p className="section-kicker">Tools I Use</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <div className="tools-row">
            {["React", "Next.js", "TypeScript", "Tailwind CSS", "Figma", "Photoshop", "Canva", "Supabase", "Git", "Vercel"].map((tool) => (
              <span key={tool} className="tool-pill">{tool}</span>
            ))}
          </div>
        </RevealOnScroll>
      </div>

      {/* Process */}
      <div style={{ marginTop: "clamp(4rem, 8vw, 7rem)" }}>
        <RevealOnScroll>
          <p className="section-kicker">How I Work</p>
        </RevealOnScroll>
        <div className="service-grid">
          {[
            { num: "01", title: "Discovery", desc: "Understanding the brand, audience, and goals before any design begins." },
            { num: "02", title: "Design", desc: "Crafting the visual identity, layout, and interactions with intention." },
            { num: "03", title: "Delivery", desc: "Polishing for performance, mobile, and the actions that matter most." },
          ].map((step, i) => (
            <RevealOnScroll key={step.num} delay={i * 80}>
              <div className="service-card">
                <span>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
