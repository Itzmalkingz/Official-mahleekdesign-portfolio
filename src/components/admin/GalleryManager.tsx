"use client";

import type { ProjectImage } from "@/lib/types";
import ImageField from "./ImageField";
import { IconClose, IconPlus, IconGrip } from "./icons";

/**
 * Ordered image gallery editor. Persists as the `projects.images` JSONB array.
 */
export default function GalleryManager({
  images,
  onChange,
  folder = "projects",
}: {
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  folder?: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((img, idx) => ({ ...img, sort_order: idx })));
  };

  const setImg = (i: number, patch: Partial<ProjectImage>) => {
    onChange(images.map((img, idx) => (idx === i ? { ...img, ...patch, sort_order: idx } : img)));
  };

  return (
    <div style={{ border: "1px solid var(--aline)", borderRadius: 10, overflow: "hidden" }}>
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
            padding: "0.85rem 1rem",
            borderBottom: "1px solid var(--aline-soft)",
          }}
        >
          <span style={{ marginTop: 12, color: "var(--aslate)" }}>
            <IconGrip size={16} />
          </span>
          <div style={{ flex: 1, display: "grid", gap: "0.5rem" }}>
            <ImageField
              value={img.image_url}
              folder={folder}
              onChange={(url) => setImg(i, { image_url: url })}
            />
            <input
              className="ac-input"
              placeholder="Alt text"
              value={img.alt_text || ""}
              onChange={(e) => setImg(i, { alt_text: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", gap: "0.25rem", marginTop: 6 }}>
            <button
              className="ac-btn sm ghost"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              title="Move up"
            >
              ↑
            </button>
            <button
              className="ac-btn sm ghost"
              disabled={i === images.length - 1}
              onClick={() => move(i, 1)}
              title="Move down"
            >
              ↓
            </button>
            <button
              className="ac-btn sm ghost danger"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              title="Remove"
            >
              <IconClose size={14} />
            </button>
          </div>
        </div>
      ))}
      <div style={{ padding: "0.85rem 1rem" }}>
        <button
          className="ac-btn sm"
          onClick={() =>
            onChange([...images, { image_url: "", alt_text: "", sort_order: images.length, project_id: "" }])
          }
        >
          <IconPlus size={14} /> Add image
        </button>
      </div>
    </div>
  );
}