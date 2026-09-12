"use client";

import type { ProjectFeature } from "@/lib/types";
import { IconClose, IconPlus } from "./icons";

/**
 * Ordered feature list editor. Persists as the `projects.features` JSONB array.
 */
export default function FeaturesEditor({
  features,
  onChange,
}: {
  features: ProjectFeature[];
  onChange: (features: ProjectFeature[]) => void;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= features.length) return;
    const next = [...features];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((f, idx) => ({ ...f, sort_order: idx })));
  };

  const set = (i: number, patch: Partial<ProjectFeature>) => {
    onChange(features.map((f, idx) => (idx === i ? { ...f, ...patch, sort_order: idx } : f)));
  };

  return (
    <div style={{ display: "grid", gap: "0.6rem" }}>
      {features.map((f, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "0.6rem",
            alignItems: "center",
            border: "1px solid var(--aline)",
            borderRadius: 10,
            padding: "0.6rem",
            background: "#fafcff",
          }}
        >
          <input
            className="ac-input"
            placeholder="Feature name"
            value={f.name}
            onChange={(e) => set(i, { name: e.target.value })}
            style={{ flex: "0 0 40%" }}
          />
          <input
            className="ac-input"
            placeholder="Short description (optional)"
            value={f.description || ""}
            onChange={(e) => set(i, { description: e.target.value })}
          />
          <span style={{ display: "flex", gap: "0.25rem" }}>
            <button className="ac-btn sm ghost" disabled={i === 0} onClick={() => move(i, -1)} title="Up">
              ↑
            </button>
            <button
              className="ac-btn sm ghost"
              disabled={i === features.length - 1}
              onClick={() => move(i, 1)}
              title="Down"
            >
              ↓
            </button>
            <button className="ac-btn sm ghost danger" onClick={() => onChange(features.filter((_, idx) => idx !== i))} title="Remove">
              <IconClose size={14} />
            </button>
          </span>
        </div>
      ))}
      <div>
        <button
          className="ac-btn sm"
          onClick={() => onChange([...features, { name: "", description: "", sort_order: features.length, project_id: "" }])}
        >
          <IconPlus size={14} /> Add feature
        </button>
      </div>
    </div>
  );
}