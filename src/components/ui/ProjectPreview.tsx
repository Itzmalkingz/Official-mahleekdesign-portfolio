"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Project } from "@/lib/types";
import SafeImage from "./SafeImage";
import RevealOnScroll from "./RevealOnScroll";

const categoryLabels: Record<string, string> = {
  "brand-identity": "Brand Identity",
  "web-systems": "Web System",
  "brand-web": "Brand + Web",
};

interface Props {
  project: Project;
  href: string;
  index?: number;
  showIndex?: boolean;
  size?: "default" | "compact" | "featured";
  aspectRatio?: "auto" | "4/3" | "3/4" | "16/9" | "1/1";
  className?: string;
  onClick?: () => void;
}

export default function ProjectPreview({
  project,
  href,
  index,
  showIndex = false,
  size = "default",
  aspectRatio = "auto",
  className = "",
  onClick,
}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const previewImage = (() => {
    const img = project.website_preview_url || project.cover_image;
    return typeof img === "string" ? img : null;
  })();
  const categoryLabel =
    project.category === "brand-web"
      ? "Brand + Web"
      : categoryLabels[project.category] || project.category;

  const sizeStyles: Record<string, React.CSSProperties> = {
    default: { minHeight: "260px", maxHeight: "none" },
    compact: { minHeight: "160px", maxHeight: "none" },
    featured: { minHeight: "320px", maxHeight: "none" },
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    borderRadius: "1rem",
    overflow: "hidden",
    background: "var(--blue-deep)",
    ...(aspectRatio !== "auto" && { aspectRatio }),
    ...sizeStyles[size],
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: aspectRatio === "auto" ? "contain" : "cover",
    objectPosition: "center",
    opacity: imageLoaded ? 1 : 0,
    transition: "opacity 0.3s ease, transform 0.4s ease",
    display: "block",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation handled by Link wrapper
    }
  };

  return (
    <RevealOnScroll>
      <Link
        href={href}
        aria-label={`Open ${project.title}`}
        onClick={handleClick}
        className={`project-preview ${className}`}
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: "0.75rem",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {showIndex && index !== undefined && (
          <div
            className="project-index"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 2,
              color: "rgba(19, 99, 223, 0.13)",
              fontSize: "clamp(2rem, 4vw, 4rem)",
              fontWeight: 900,
              lineHeight: 0.8,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
        )}

        <div
          className="project-preview-visual"
          style={{
            ...containerStyle,
            isolation: "isolate",
          }}
        >
          {!imageError && previewImage ? (
            <SafeImage
              src={previewImage}
              alt={project.title}
              loading="lazy"
              style={imageStyle}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(19,99,223,0.15), rgba(78,151,255,0.1))",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(3rem, 6vw, 6rem)",
                  fontWeight: 900,
                  color: "var(--blue)",
                  opacity: 0.3,
                }}
              >
                {project.title[0]}
              </span>
            </div>
          )}

          <div
            className="project-preview-overlay"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 50%, rgba(7, 26, 53, 0.4))",
              pointerEvents: "none",
            }}
          />
        </div>

        <div
          className="project-preview-copy"
          style={{
            display: "grid",
            gap: "0.6rem",
            padding: "0.5rem 0.25rem",
            minWidth: 0,
          }}
        >
          <span className="project-tag" style={{ display: "inline-block" }}>
            {categoryLabel}
          </span>
          <h3
            style={{
              margin: 0,
              fontSize: "clamp(1.1rem, 1.5vw, 1.4rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--ink)",
              fontFamily: "Georgia, serif",
            }}
          >
            {project.title}
          </h3>
          {project.short_description && (
            <p
              style={{
                margin: 0,
                color: "var(--slate)",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {project.short_description}
            </p>
          )}
          {project.live_url && (
            <span
              className="project-link"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.85rem",
                border: "1px solid var(--line)",
                borderRadius: "999px",
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--blue)",
                background: "rgba(19, 99, 223, 0.05)",
                transition: "border-color 0.2s, color 0.2s, background 0.2s",
                width: "max-content",
              }}
            >
              View Project
            </span>
          )}
        </div>
      </Link>
    </RevealOnScroll>
  );
}