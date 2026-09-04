import type { Metadata } from "next";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Mahleek Design — brand identity, web design, and visual systems from Lagos.",
};

export default function ContactPage() {
  return (
    <section className="contact-section" style={{ paddingTop: "9rem" }} data-scene>
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
            Share what is changing, what is not working, or what you are about to launch. We will
            work out the right shape for it.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={180}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
            <a
              href="mailto:mahleekdesign@gmail.com?subject=Project%20Inquiry"
              className="btn-primary"
              style={{ minWidth: "14rem", textAlign: "center" }}
            >
              Send an Email
            </a>
            <a
              href="https://wa.me/2349116537383"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ minWidth: "14rem", textAlign: "center" }}
            >
              Message on WhatsApp
            </a>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={240}>
          <div style={{ marginTop: "3rem", display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="mailto:mahleekdesign@gmail.com"
              style={{ color: "#7d776f", fontSize: "0.85rem", transition: "color 200ms" }}
            >
              mahleekdesign@gmail.com
            </a>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
            <span style={{ color: "#7d776f", fontSize: "0.85rem" }}>Lagos, Nigeria</span>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
