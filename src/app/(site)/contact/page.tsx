"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import toast, { Toaster } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    business: "",
    projectType: "not-sure",
    message: "",
    budget: "",
    timeline: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setSubmitStatus("idle");

    try {
      const { error } = await supabase.from("enquiries").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        business: formData.business.trim() || null,
        project_type: formData.projectType,
        message: formData.message.trim(),
        budget: formData.budget || null,
        timeline: formData.timeline || null,
        status: "new",
      });

      if (error) throw error;

      setSubmitStatus("success");
      toast.success("Message sent! I'll get back to you soon.");
      setFormData({ name: "", email: "", business: "", projectType: "not-sure", message: "", budget: "", timeline: "" });
    } catch (err) {
      setSubmitStatus("error");
      console.error(err);
      toast.error("Something went wrong. Please try again or email directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const projectTypes = [
    { value: "brand-identity", label: "Brand Identity" },
    { value: "web-systems", label: "Web System" },
    { value: "brand-web", label: "Brand + Web" },
    { value: "business-website", label: "Business Website" },
    { value: "custom", label: "Custom Project" },
    { value: "not-sure", label: "Not Sure Yet" },
  ];

  const budgets = [
    { value: "", label: "Select budget range (optional)" },
    { value: "under-5k", label: "Under $5,000" },
    { value: "5k-15k", label: "$5,000 - $15,000" },
    { value: "15k-30k", label: "$15,000 - $30,000" },
    { value: "30k-50k", label: "$30,000 - $50,000" },
    { value: "50k-plus", label: "$50,000+" },
  ];

  const timelines = [
    { value: "", label: "Select timeline (optional)" },
    { value: "asap", label: "ASAP" },
    { value: "1-2-months", label: "1-2 months" },
    { value: "2-3-months", label: "2-3 months" },
    { value: "3-6-months", label: "3-6 months" },
    { value: "flexible", label: "Flexible" },
  ];

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15,15,17,0.95)",
            color: "#f6f1e8",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "0.85rem",
          },
        }}
      />
      <section className="contact-section" style={{ paddingTop: "9rem", minHeight: "auto", paddingBottom: "6rem" }} data-scene>
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

          {/* Contact Form */}
          <RevealOnScroll delay={180}>
            <div style={{ 
              width: "100%", 
              maxWidth: "48rem", 
              marginTop: "3rem",
              background: "white",
              border: "1px solid rgba(19, 99, 223, 0.16)",
              borderRadius: "1.1rem",
              padding: "clamp(1.25rem, 4vw, 2.5rem)",
              boxShadow: "0 0.75rem 2rem rgba(13, 46, 94, 0.08)"
            }}>
              {submitStatus === "success" ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <h3 style={{ margin: "0 0 1rem", color: "var(--ink)", fontSize: "1.5rem" }}>Message Sent!</h3>
                  <p style={{ margin: 0, color: "var(--slate)" }}>Thanks for reaching out. I'll review your project and get back to you within 1-2 business days.</p>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ marginTop: "2rem" }}
                    onClick={() => setSubmitStatus("idle")}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="contact-form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Name *</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="business">Business / Organization</label>
                    <input
                      id="business"
                      name="business"
                      type="text"
                      placeholder="Company or project name"
                      value={formData.business}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="projectType">What do you need? *</label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      required
                    >
                      {projectTypes.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Tell us about the problem *</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="What are you trying to solve? What isn't working? What are you trying to build?"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                    />
                  </div>

                  <div className="contact-form-grid">
                    <div className="form-group">
                      <label htmlFor="budget">Budget Range</label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                      >
                        {budgets.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="timeline">Timeline</label>
                      <select
                        id="timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                      >
                        {timelines.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: "100%", marginTop: "0.5rem" }}
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Start a Project →"}
                  </button>
                </form>
              )}
            </div>
          </RevealOnScroll>

          {/* Direct Contact */}
          <RevealOnScroll delay={240}>
            <div style={{ marginTop: "3rem", display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="mailto:mahleekdesign@gmail.com"
                style={{ color: "var(--slate)", fontSize: "0.85rem", transition: "color 200ms" }}
              >
                mahleekdesign@gmail.com
              </a>
              <span style={{ color: "var(--line)" }}>|</span>
              <span style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Lagos, Nigeria</span>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}