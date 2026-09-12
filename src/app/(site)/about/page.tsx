import type { Metadata } from "next";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "About",
  description: "About Mahleek Design — a creative technology studio building memorable brands and purposeful web systems.",
};

export default function AboutPage() {
  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      <RevealOnScroll>
        <p className="section-kicker">About Mahleek Design</p>
      </RevealOnScroll>

      <div className="about-grid" style={{ marginTop: "2rem" }}>
        <div className="about-text">
          <RevealOnScroll>
            <h2>I build around problems.</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={60}>
            <p>
              I'm Mahleek, a designer and web developer focused on building memorable brands and purposeful web systems for businesses.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p>
              My approach combines design, development, and business thinking. I don't start by asking what website a business wants. I start by understanding what isn't working, then figure out how design and technology can improve it.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={180}>
            <p>
              Sometimes that means creating a stronger brand identity.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={240}>
            <p>
              Sometimes it means building a booking system, dashboard, customer experience, or custom web application.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={300}>
            <p>
              Sometimes it means doing both.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={360}>
            <p style={{ fontWeight: 700, color: "var(--ink)" }}>
              The goal isn't to build more software. It's to build something useful.
            </p>
          </RevealOnScroll>
        </div>

        <RevealOnScroll delay={200}>
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

      {/* Process Section */}
      <div style={{ marginTop: "clamp(4rem, 8vw, 7rem)" }}>
        <RevealOnScroll>
          <p className="section-kicker">Process</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading" style={{ marginTop: "0.9rem" }}>
            We start with the problem, not the website.
          </h2>
        </RevealOnScroll>

        <div className="service-grid" style={{ marginTop: "2rem" }}>
          {[
            { num: "01", title: "Understand", desc: "Identify the business, its audience, goals, and actual problems." },
            { num: "02", title: "Define", desc: "Turn the problem into a clear direction and solution." },
            { num: "03", title: "Design", desc: "Create the brand identity, user experience, interface, and visual system." },
            { num: "04", title: "Build", desc: "Develop the web experience/system and connect the necessary functionality." },
            { num: "05", title: "Launch", desc: "Test, refine, and prepare the final solution for real users." },
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

      {/* Technology Section */}
      <div style={{ marginTop: "clamp(4rem, 8vw, 7rem)" }}>
        <RevealOnScroll>
          <p className="section-kicker">Technology</p>
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <h2 className="section-heading" style={{ marginTop: "0.9rem" }}>
            Built with modern tools. Designed around your business.
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <div className="tools-row">
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Figma", "Photoshop", "Canva", "Git", "Vercel"].map((tool) => (
              <span key={tool} className="tool-pill">{tool}</span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}