"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { IconClose } from "./icons";
import { IconExternal, IconFolder, IconInbox, IconCalendar, IconBell } from "./icons";

/* ── Page header ──────────────────────────────────────────────────────────── */

export function PageHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="ash-page-head">
      <div>
        <h1 className="ash-page-title">{title}</h1>
        {sub && <p className="ash-page-sub">{sub}</p>}
      </div>
      {actions && <div className="ash-page-actions">{actions}</div>}
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────────────────── */

export function StatCard({
  icon,
  label,
  value,
  delta,
  down,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  delta?: string;
  down?: boolean;
  hint?: string;
}) {
  return (
    <div className="ac-stat" data-ash-reveal>
      <div className="icon">{icon}</div>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
      {delta && (
        <span className={`delta ${down ? "down" : ""}`}>
          {down ? "↓" : "↑"} {delta}
        </span>
      )}
      {!delta && hint && <div style={{ fontSize: "0.72rem", color: "#93a2b4", marginTop: "0.45rem" }}>{hint}</div>}
    </div>
  );
}

/* ── Badge ────────────────────────────────────────────────────────────────── */

const BADGE_TONE: Record<string, string> = {
  new: "blue",
  contacted: "amber",
  discussion: "blue",
  won: "green",
  closed: "",
  lost: "",
  pending: "amber",
  confirmed: "blue",
  completed: "green",
  cancelled: "",
  "no-show": "red",
  rejected: "",
  active: "green",
  lead: "amber",
  past: "",
  published: "green",
  draft: "amber",
  archived: "",
  low: "",
  normal: "blue",
  high: "amber",
  urgent: "red",
  admin: "ink",
  editor: "blue",
  staff: "",
  enquiry: "blue",
  appointment: "amber",
  system: "",
  lead_event: "green",
  content: "blue",
};

export function Badge({ value }: { value?: string | null }) {
  if (!value) return null;
  const strValue = String(value);
  const tone = BADGE_TONE[strValue.toLowerCase()] || "blue";
  return <span className={`ac-badge ${tone}`}>{strValue.replaceAll("-", " ")}</span>;
}

export function StatusDot({ tone }: { tone: keyof typeof BADGE_TONE }) {
  return <span className={`ac-status-dot ${tone || "gray"}`} />;
}

/* ── Empty / loading ──────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ac-empty">
      <div>
        {icon || <IconFolder size={28} />}
        <div className="ttl">{title}</div>
        {sub && <div className="sub">{sub}</div>}
        {action && <div style={{ marginTop: "1.25rem" }}>{action}</div>}
      </div>
    </div>
  );
}

export function MigrateBadge() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 0.9rem",
        borderRadius: 9,
        background: "#fdf0dc",
        color: "#8a5303",
        fontSize: "0.8rem",
        fontWeight: 600,
        marginBottom: "1rem",
      }}
    >
      <IconInbox size={15} />
      This module needs the Phase 1 migration. Run `supabase/migrations/001_admin_control_center.sql` in your Supabase SQL editor.
    </div>
  );
}

export function SkeletonRows({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ padding: "0.5rem 1.25rem" }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "1rem", padding: "0.9rem 0", borderBottom: "1px solid var(--aline-soft)" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="ac-skel" style={{ height: 14, opacity: 1 - c * 0.16 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Confirm dialog ───────────────────────────────────────────────────────── */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
  danger = true,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(7,26,53,0.5)",
        backdropFilter: "blur(2px)",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        className="ac-card"
        style={{ width: "min(420px, 100%)", padding: "1.5rem", animation: "ash-pop-in 0.14s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <div
            style={{
              flex: "none",
              width: 36,
              height: 36,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              background: danger ? "#fdebea" : "#e5eefc",
              color: danger ? "var(--ared)" : "var(--ablue)",
            }}
          >
            <IconClose size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{title}</h3>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "var(--aslate)", lineHeight: 1.55 }}>{message}</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button className="ac-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className={`ac-btn ${danger ? "danger" : "primary"}`}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
            }}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Form field ───────────────────────────────────────────────────────────── */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="ac-field">
      <label className="ac-label">
        {label}
        {hint && <span style={{ textTransform: "none", fontWeight: 500, marginLeft: "0.4rem" }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Time helpers exposed for pages ──────────────────────────────────────── */

export function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const EMPTY_ICONS: Record<string, ReactNode> = {
  projects: <IconFolder size={28} />,
  enquiries: <IconInbox size={28} />,
  appointments: <IconCalendar size={28} />,
  notifications: <IconBell size={28} />,
};

export { EMPTY_ICONS };
export { IconExternal };