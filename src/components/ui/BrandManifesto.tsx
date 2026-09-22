"use client";

import { useEffect, useRef } from "react";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function BrandManifesto() {
  const textRef = useRef<HTMLSpanElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shimmerRef.current) return;
    let progress = -100;
    const animate = () => {
      progress += 0.3;
      if (progress > 200) progress = -100;
      shimmerRef.current!.style.backgroundPosition = `${progress}% 50%`;
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <RevealOnScroll delay={100}>
      <section
        className="manifesto-section"
        aria-label="Brand manifesto"
        style={{
          "--manifesto-delay": "0ms",
        } as React.CSSProperties}
      >
        <div className="manifesto-card">
          <div className="manifesto-glow" aria-hidden="true" />
          <div className="manifesto-border" aria-hidden="true" />

          <div className="manifesto-content">
            <span className="manifesto-quote-mark" aria-hidden="true">&#8220;</span>
            <p className="manifesto-text">
              <span className="manifesto-highlight" ref={textRef}>
                If your problem doesn&apos;t fit inside a normal website,
              </span>
              <br />
              <span className="manifesto-highlight" style={{ transitionDelay: "120ms" }}>
                we can build the system around it.
              </span>
            </p>
            <div className="manifesto-shimmer" ref={shimmerRef} aria-hidden="true" />
          </div>

          <div className="manifesto-accent" aria-hidden="true">
            <span className="manifesto-dot" data-index="0" />
            <span className="manifesto-dot" data-index="1" />
            <span className="manifesto-dot" data-index="2" />
          </div>
        </div>

        <style jsx>{`
          .manifesto-section {
            padding: clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem);
            position: relative;
            isolation: isolate;
          }

          .manifesto-card {
            position: relative;
            max-width: 720px;
            margin: 0 auto;
            border-radius: 1.5rem;
            padding: clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem);
            background:
              radial-gradient(ellipse at 50% 0%, rgba(19, 99, 223, 0.18), transparent 55%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.75));
            border: 1px solid rgba(19, 99, 223, 0.22);
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.6) inset,
              0 1.5rem 3rem rgba(13, 46, 94, 0.1),
              0 0.5rem 1.5rem rgba(19, 99, 223, 0.08);
            overflow: hidden;
            transform: translateY(20px);
            opacity: 0;
            animation: manifesto-reveal 0.9s var(--ease-brand) forwards;
            animation-delay: calc(var(--manifesto-delay) + 200ms);
          }

          @keyframes manifesto-reveal {
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .manifesto-glow {
            position: absolute;
            inset: -40% -20% auto -20%;
            height: 60%;
            background: radial-gradient(ellipse at 50% 0%, rgba(78, 151, 255, 0.35), transparent 60%);
            pointer-events: none;
            animation: glow-pulse 4s ease-in-out infinite;
          }

          @keyframes glow-pulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }

          .manifesto-border {
            position: absolute;
            inset: 0;
            border-radius: 1.5rem;
            background: linear-gradient(
              135deg,
              rgba(19, 99, 223, 0.25) 0%,
              transparent 30%,
              transparent 70%,
              rgba(78, 151, 255, 0.2) 100%
            );
            mask: linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff);
            mask-composite: exclude;
            -webkit-mask-composite: xor;
            pointer-events: none;
          }

          .manifesto-content {
            position: relative;
            z-index: 1;
            text-align: center;
          }

          .manifesto-quote-mark {
            display: inline-block;
            font-family: Georgia, serif;
            font-size: clamp(3rem, 6vw, 5rem);
            line-height: 0.5;
            color: var(--blue);
            opacity: 0.25;
            margin-bottom: -0.5rem;
            transform: translateY(0.5rem);
            animation: quote-pop 0.6s var(--ease-brand) forwards;
            animation-delay: calc(var(--manifesto-delay) + 400ms);
            opacity: 0;
          }

          @keyframes quote-pop {
            to { opacity: 0.25; transform: translateY(0); }
          }

          .manifesto-text {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(1.35rem, 2.8vw, 2rem);
            line-height: 1.35;
            font-weight: 500;
            color: var(--ink);
            letter-spacing: -0.015em;
          }

          .manifesto-highlight {
            display: inline-block;
            background: linear-gradient(90deg, var(--blue), var(--blue-bright), var(--blue));
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            opacity: 0;
            transform: translateY(12px);
            animation: text-reveal 0.7s var(--ease-brand) forwards;
            animation-delay: calc(var(--manifesto-delay) + 500ms);
          }

          .manifesto-highlight:nth-of-type(2) {
            animation-delay: calc(var(--manifesto-delay) + 620ms);
          }

          @keyframes text-reveal {
            to { opacity: 1; transform: translateY(0); }
          }

          .manifesto-shimmer {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(78, 151, 255, 0.08) 45%,
              rgba(78, 151, 255, 0.18) 50%,
              rgba(78, 151, 255, 0.08) 55%,
              transparent 100%
            );
            background-size: 300% 100%;
            pointer-events: none;
            border-radius: 1.5rem;
            opacity: 0;
            animation: shimmer-sweep 3s ease-in-out infinite;
            animation-delay: 1.5s;
          }

          @keyframes shimmer-sweep {
            0% { background-position: -200% 50%; opacity: 0; }
            10% { opacity: 1; }
            50% { background-position: 200% 50%; opacity: 1; }
            90% { opacity: 0; }
            100% { opacity: 0; }
          }

          .manifesto-accent {
            display: flex;
            justify-content: center;
            gap: 0.6rem;
            margin-top: 1.5rem;
            opacity: 0;
            animation: accent-reveal 0.5s var(--ease-brand) forwards;
            animation-delay: calc(var(--manifesto-delay) + 1000ms);
          }

          @keyframes accent-reveal {
            to { opacity: 1; }
          }

          .manifesto-dot {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--blue), var(--blue-bright));
            box-shadow: 0 0 0.75rem rgba(19, 99, 223, 0.5);
            animation: dot-float 2.5s ease-in-out infinite;
          }
          .manifesto-dot[data-index="0"] { animation-delay: 0ms; }
          .manifesto-dot[data-index="1"] { animation-delay: 150ms; }
          .manifesto-dot[data-index="2"] { animation-delay: 300ms; }

          @keyframes dot-float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
            50% { transform: translateY(-6px) scale(1.15); opacity: 1; }
          }

          @media (max-width: 640px) {
            .manifesto-card {
              border-radius: 1rem;
              padding: 1.75rem 1.25rem;
            }
            .manifesto-text {
              font-size: clamp(1.15rem, 3.2vw, 1.5rem);
            }
            .manifesto-quote-mark {
              font-size: clamp(2.5rem, 7vw, 3.5rem);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .manifesto-card,
            .manifesto-quote-mark,
            .manifesto-highlight,
            .manifesto-shimmer,
            .manifesto-accent,
            .manifesto-dot,
            .manifesto-glow {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
            .manifesto-shimmer { display: none; }
          }
        `}</style>
      </section>
    </RevealOnScroll>
  );
}